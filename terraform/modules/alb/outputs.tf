output "dns_name" {
  value       = aws_lb.this.dns_name
  description = "ALB DNS name."
}

output "api_target_group_arn" {
  value = aws_lb_target_group.api.arn
}

output "client_target_group_arn" {
  value = aws_lb_target_group.client.arn
}
