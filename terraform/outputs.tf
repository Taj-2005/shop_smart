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

output "public_endpoints_note" {
  value       = "No ALB is provisioned. ECS tasks run with public IPs; retrieve task public IPs from the ECS console and use http://<client-task-ip>:3000 and http://<api-task-ip>:4000"
  description = "How to access the services when deploying without a load balancer."
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
