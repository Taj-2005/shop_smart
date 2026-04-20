variable "aws_region" {
  type        = string
  description = "AWS region for all resources."
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Short project prefix for resource names."
  default     = "shopsmart"
}

variable "environment" {
  type        = string
  description = "Deployment stage (e.g. dev, staging, prod)."
  default     = "dev"
}

variable "labrole_arn" {
  type        = string
  description = "IAM role ARN to use for ECS task execution + task role (AWS Academy LabRole)."
}

variable "server_container_image" {
  type        = string
  description = "Bootstrap image for the API task (must support the ECS module bootstrap command until CI deploys)."
  default     = "public.ecr.aws/docker/library/node:20-alpine"
}

variable "client_container_image" {
  type        = string
  description = "Bootstrap image for the web task (must support the ECS module bootstrap command until CI deploys)."
  default     = "public.ecr.aws/docker/library/node:20-alpine"
}

variable "server_container_port" {
  type        = number
  description = "Container port for the API (ShopSmart server listens on 4000)."
  default     = 4000
}

variable "client_container_port" {
  type        = number
  description = "Container port for the Next.js app (3000 in production Dockerfile)."
  default     = 3000
}

variable "api_health_check_path" {
  type        = string
  description = "ALB health check path for the API target group."
  default     = "/api/health"
}

variable "client_health_check_path" {
  type        = string
  description = "ALB health check path for the web target group."
  default     = "/"
}

variable "fargate_cpu" {
  type        = number
  description = "Fargate task CPU units (256, 512, 1024, ...)."
  default     = 512
}

variable "fargate_memory" {
  type        = number
  description = "Fargate task memory (MiB); must match a valid CPU/memory pair."
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

variable "create_ecr_repositories" {
  type        = bool
  description = "Set false when ECR repos already exist (e.g. prior apply with lost state, or CI without remote backend)."
  default     = true
}
