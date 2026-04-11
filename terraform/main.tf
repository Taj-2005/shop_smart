terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

variable "aws_region" {
  type        = string
  description = "AWS region for all resources."
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Prefix for resource names."
  default     = "shopsmart"
}

variable "environment" {
  type        = string
  description = "Deployment stage (e.g. dev, staging, prod)."
  default     = "dev"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR for the VPC."
  default     = "10.0.0.0/16"
}

variable "ec2_instance_type" {
  type        = string
  description = "Instance type for the optional EC2 host (bastion or auxiliary)."
  default     = "t3.micro"
}

variable "ec2_key_name" {
  type        = string
  description = "Optional EC2 key pair name for SSH. Leave empty to disable SSH key association."
  default     = ""
}

variable "ssh_ingress_cidr" {
  type        = string
  description = "CIDR allowed to SSH the EC2 instance when ec2_key_name is set (e.g. 203.0.113.10/32). Ignored if no key pair."
  default     = ""
}

variable "enable_ec2" {
  type        = bool
  description = "Whether to create the EC2 instance."
  default     = true
}

variable "server_container_image" {
  type        = string
  description = "Image for the API ECS task. Use your ECR URL after first push; defaults to a public image for first apply."
  default     = "public.ecr.aws/docker/library/nginx:alpine"
}

variable "client_container_image" {
  type        = string
  description = "Image for the Next.js ECS task. Replace with ECR client image after push."
  default     = "public.ecr.aws/docker/library/nginx:alpine"
}

variable "server_container_port" {
  type        = number
  description = "Container port for the API (ShopSmart server: 4000; nginx placeholder: 80)."
  default     = 80
}

variable "client_container_port" {
  type        = number
  description = "Container port for the web app (Next.js: 3000; nginx placeholder: 80)."
  default     = 80
}

variable "api_health_check_path" {
  type        = string
  description = "ALB health check for API (use /api/health for ShopSmart API)."
  default     = "/"
}

variable "client_health_check_path" {
  type        = string
  description = "ALB health check for the client target group."
  default     = "/"
}

variable "fargate_cpu" {
  type        = number
  description = "Fargate task CPU units (256, 512, 1024, ...)."
  default     = 512
}

variable "fargate_memory" {
  type        = number
  description = "Fargate task memory (MiB), must match valid CPU/memory pairs."
  default     = 1024
}

variable "desired_count_api" {
  type        = number
  description = "Desired ECS tasks for the API service."
  default     = 1
}

variable "desired_count_client" {
  type        = number
  description = "Desired ECS tasks for the client service."
  default     = 1
}

locals {
  name = "${var.project_name}-${var.environment}"
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# --- modules: network → security → storage & registry → IAM → ALB → ECS → optional EC2 ---

module "network" {
  source = "./modules/network"

  name               = local.name
  vpc_cidr           = var.vpc_cidr
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 2)
}

module "security" {
  source = "./modules/security"

  name                  = local.name
  vpc_id                = module.network.vpc_id
  server_container_port = var.server_container_port
  client_container_port = var.client_container_port
  enable_ec2            = var.enable_ec2
  ec2_key_name          = var.ec2_key_name
  ssh_ingress_cidr      = var.ssh_ingress_cidr
}

module "s3" {
  source = "./modules/s3"

  name       = local.name
  aws_region = var.aws_region
}

module "ecr" {
  source = "./modules/ecr"

  name = local.name
}

module "iam" {
  source = "./modules/iam"

  name          = local.name
  enable_ec2    = var.enable_ec2
  s3_bucket_arn = module.s3.bucket_arn
}

module "alb" {
  source = "./modules/alb"

  name                     = local.name
  vpc_id                   = module.network.vpc_id
  subnet_ids               = module.network.public_subnet_ids
  alb_security_group_id    = module.security.alb_security_group_id
  server_container_port    = var.server_container_port
  client_container_port    = var.client_container_port
  api_health_check_path    = var.api_health_check_path
  client_health_check_path = var.client_health_check_path
}

module "ecs" {
  source = "./modules/ecs"

  depends_on = [module.alb]

  name                         = local.name
  aws_region                   = var.aws_region
  subnet_ids                   = module.network.public_subnet_ids
  ecs_api_security_group_id    = module.security.ecs_api_security_group_id
  ecs_client_security_group_id = module.security.ecs_client_security_group_id
  execution_role_arn           = module.iam.ecs_execution_role_arn
  task_role_arn                = module.iam.ecs_task_role_arn
  api_target_group_arn         = module.alb.api_target_group_arn
  client_target_group_arn      = module.alb.client_target_group_arn
  server_container_image       = var.server_container_image
  client_container_image       = var.client_container_image
  server_container_port        = var.server_container_port
  client_container_port        = var.client_container_port
  fargate_cpu                  = var.fargate_cpu
  fargate_memory               = var.fargate_memory
  desired_count_api            = var.desired_count_api
  desired_count_client         = var.desired_count_client
}

module "ec2" {
  count  = var.enable_ec2 ? 1 : 0
  source = "./modules/ec2"

  name                 = local.name
  subnet_id            = module.network.public_subnet_ids[0]
  security_group_id    = module.security.ec2_security_group_id
  instance_type        = var.ec2_instance_type
  key_name             = var.ec2_key_name
  iam_instance_profile = module.iam.ec2_instance_profile_name
}

# --- outputs ---

output "vpc_id" {
  value       = module.network.vpc_id
  description = "VPC for ECS, ALB, and EC2."
}

output "public_subnet_ids" {
  value       = module.network.public_subnet_ids
  description = "Public subnets used by the load balancer and Fargate tasks."
}

output "s3_bucket_name" {
  value       = module.s3.bucket_id
  description = "Private S3 bucket (ECS task role can read objects)."
}

output "ecr_server_repository_url" {
  value       = module.ecr.server_repository_url
  description = "Push API image: docker tag && docker push."
}

output "ecr_client_repository_url" {
  value       = module.ecr.client_repository_url
  description = "Push web image: docker tag && docker push."
}

output "ecs_cluster_name" {
  value       = module.ecs.cluster_name
  description = "ECS cluster hosting API and client services."
}

output "alb_dns_name" {
  value       = module.alb.dns_name
  description = "API: http://<dns>/ (port 80). Web: http://<dns>:8080/"
}

output "ec2_public_ip" {
  value       = try(module.ec2[0].public_ip, null)
  description = "Public IPv4 of the optional EC2 instance when enable_ec2 is true."
}

output "aws_account_id" {
  value       = data.aws_caller_identity.current.account_id
  description = "Account ID (for ECR login URLs)."
}
