output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "ecs_api_security_group_id" {
  value = aws_security_group.ecs_api.id
}

output "ecs_client_security_group_id" {
  value = aws_security_group.ecs_client.id
}
