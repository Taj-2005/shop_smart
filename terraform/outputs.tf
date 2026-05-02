output "vpc_id" {
  value       = local.vpc_id
  description = "Default VPC used by ECS."
}

output "public_subnet_ids" {
  value       = local.subnet_ids
  description = "Default VPC subnets used by Fargate tasks."
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

output "ecs_api_task_definition_family" {
  value       = module.ecs.api_task_definition_family
  description = "Task definition family for the API (used when registering new revisions in CI)."
}

output "ecs_client_task_definition_family" {
  value       = module.ecs.client_task_definition_family
  description = "Task definition family for the web app."
}

output "alb_dns_name" {
  value       = module.alb.alb_dns_name
  description = "DNS name of the Application Load Balancer. Client: http://<alb_dns_name>  API: http://<alb_dns_name>/api/"
}

output "public_endpoints_note" {
  value       = "ALB provisioned. Access the client at http://${module.alb.alb_dns_name} and the API at http://${module.alb.alb_dns_name}/api/"
  description = "How to access the services via the Application Load Balancer."
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
