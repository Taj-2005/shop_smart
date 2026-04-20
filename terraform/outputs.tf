output "vpc_id" {
  value       = local.vpc_id
  description = "VPC for ECS and the load balancer."
}

output "public_subnet_ids" {
  value       = local.subnet_ids
  description = "Public subnets used by the load balancer and Fargate tasks."
}

output "ecr_server_repository_url" {
  value       = module.ecr.server_repository_url
  description = "ECR repository URL for the API image."
}

output "ecr_client_repository_url" {
  value       = module.ecr.client_repository_url
  description = "ECR repository URL for the web image."
}

output "ecs_cluster_name" {
  value       = module.ecs.cluster_name
  description = "ECS cluster hosting API and client services."
}

output "ecs_api_service_name" {
  value       = module.ecs.api_service_name
  description = "ECS service name for the API."
}

output "ecs_client_service_name" {
  value       = module.ecs.client_service_name
  description = "ECS service name for the web app."
}

output "ecs_api_task_definition_family" {
  value       = module.ecs.api_task_definition_family
  description = "Task definition family for the API (used when registering new revisions in CI)."
}

output "ecs_client_task_definition_family" {
  value       = module.ecs.client_task_definition_family
  description = "Task definition family for the web app."
}

output "alb_dns_name" {
  value       = module.alb.dns_name
  description = "Public ALB DNS name (web on /, API on /api/*)."
}

output "public_api_base_url_parameter_name" {
  value       = aws_ssm_parameter.public_api_base_url.name
  description = "SSM parameter written by Terraform; CI reads this for NEXT_PUBLIC_API_URL."
}

output "ecs_execution_role_arn" {
  value       = local.ecs_execution_role_arn
  description = "Pass this role ARN to iam:PassRole when registering task definitions from CI."
}

output "ecs_task_role_arn" {
  value       = local.ecs_task_role_arn
  description = "Pass this role ARN to iam:PassRole when registering task definitions from CI."
}

output "aws_account_id" {
  value       = data.aws_caller_identity.current.account_id
  description = "Current AWS account ID."
}
