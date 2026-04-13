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

  ecs_execution_role_arn = var.create_iam_roles ? module.iam[0].ecs_execution_role_arn : var.external_ecs_execution_role_arn
  ecs_task_role_arn      = var.create_iam_roles ? module.iam[0].ecs_task_role_arn : var.external_ecs_task_role_arn
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

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
}

module "ecr" {
  source = "./modules/ecr"

  name                = local.name
  create_repositories = var.create_ecr_repositories
}

module "iam" {
  count  = var.create_iam_roles ? 1 : 0
  source = "./modules/iam"

  name = local.name
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
  execution_role_arn           = local.ecs_execution_role_arn
  task_role_arn                = local.ecs_task_role_arn
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

resource "aws_ssm_parameter" "public_api_base_url" {
  name        = "/${var.project_name}/${var.environment}/public_api_base_url"
  description = "Public base URL for the API (ALB on port 80). Used by CI for client image build args."
  type        = "String"
  value       = "http://${module.alb.dns_name}"

  depends_on = [module.alb]
}
