output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "ecs_api_security_group_id" {
  value = aws_security_group.ecs_api.id
}

output "ecs_client_security_group_id" {
  value = aws_security_group.ecs_client.id
}

output "ec2_security_group_id" {
  value       = try(aws_security_group.ec2[0].id, null)
  description = "Present only when enable_ec2 is true."
}
