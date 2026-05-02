output "alb_dns_name" {
  value       = aws_lb.this.dns_name
  description = "DNS name of the Application Load Balancer."
}

output "api_target_group_arn" {
  value       = aws_lb_target_group.api.arn
  description = "ARN of the API target group."
}

output "client_target_group_arn" {
  value       = aws_lb_target_group.client.arn
  description = "ARN of the client target group."
}

output "alb_security_group_id" {
  value       = aws_security_group.alb.id
  description = "Security group ID of the ALB (can be used as ingress source for ECS task SGs)."
}
