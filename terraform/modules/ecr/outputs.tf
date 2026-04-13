output "server_repository_url" {
  value       = var.create_repositories ? aws_ecr_repository.server[0].repository_url : data.aws_ecr_repository.server[0].repository_url
  description = "ECR URL for the API image."
}

output "client_repository_url" {
  value       = var.create_repositories ? aws_ecr_repository.client[0].repository_url : data.aws_ecr_repository.client[0].repository_url
  description = "ECR URL for the web image."
}
