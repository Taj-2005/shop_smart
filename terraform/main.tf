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

locals {
  name = "${var.project_name}-${var.environment}"

  ecs_execution_role_arn = var.labrole_arn
  ecs_task_role_arn      = var.labrole_arn
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

locals {
  vpc_id     = data.aws_vpc.default.id
  subnet_ids = slice(data.aws_subnets.default.ids, 0, 2)
}

data "aws_security_group" "ecs_api" {
  vpc_id = local.vpc_id
  name   = "${local.name}-ecs-api"
}

data "aws_security_group" "ecs_client" {
  vpc_id = local.vpc_id
  name   = "${local.name}-ecs-client"
}

module "ecr" {
  source = "./modules/ecr"

  name                = local.name
  create_repositories = var.create_ecr_repositories
}

module "alb" {
  source = "./modules/alb"

  name                     = local.name
  vpc_id                   = local.vpc_id
  subnet_ids               = local.subnet_ids
  server_container_port    = var.server_container_port
  client_container_port    = var.client_container_port
  api_health_check_path    = var.api_health_check_path
  client_health_check_path = var.client_health_check_path
}

module "ecs" {
  source = "./modules/ecs"

  name                         = local.name
  aws_region                   = var.aws_region
  subnet_ids                   = local.subnet_ids
  ecs_api_security_group_id    = data.aws_security_group.ecs_api.id
  ecs_client_security_group_id = data.aws_security_group.ecs_client.id
  execution_role_arn           = local.ecs_execution_role_arn
  task_role_arn                = local.ecs_task_role_arn
  server_container_image       = var.server_container_image
  client_container_image       = var.client_container_image
  server_container_port        = var.server_container_port
  client_container_port        = var.client_container_port
  fargate_cpu                  = var.fargate_cpu
  fargate_memory               = var.fargate_memory
  desired_count_api            = var.desired_count_api
  desired_count_client         = var.desired_count_client
}
