output "ecs_execution_role_arn" {
  value = aws_iam_role.ecs_execution.arn
}

output "ecs_task_role_arn" {
  value = aws_iam_role.ecs_task.arn
}

output "ec2_instance_profile_name" {
  value       = try(aws_iam_instance_profile.ec2[0].name, null)
  description = "EC2 instance profile name when enable_ec2 is true."
}
