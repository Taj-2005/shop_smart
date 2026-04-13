output "cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "api_service_name" {
  value = aws_ecs_service.api.name
}

output "client_service_name" {
  value = aws_ecs_service.client.name
}

output "api_task_definition_family" {
  value = aws_ecs_task_definition.api.family
}

output "client_task_definition_family" {
  value = aws_ecs_task_definition.client.family
}
