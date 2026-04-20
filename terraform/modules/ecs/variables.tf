variable "name" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "ecs_api_security_group_id" {
  type = string
}

variable "ecs_client_security_group_id" {
  type = string
}

variable "execution_role_arn" {
  type = string
}

variable "task_role_arn" {
  type = string
}

variable "enable_load_balancer" {
  type        = bool
  description = "If true, attach ECS services to load balancer target groups."
  default     = false
}

variable "api_target_group_arn" {
  type        = string
  description = "ALB target group ARN for the API service (required when enable_load_balancer is true)."
  default     = ""
}

variable "client_target_group_arn" {
  type        = string
  description = "ALB target group ARN for the client service (required when enable_load_balancer is true)."
  default     = ""
}

variable "server_container_image" {
  type = string
}

variable "client_container_image" {
  type = string
}

variable "server_container_port" {
  type = number
}

variable "client_container_port" {
  type = number
}

variable "fargate_cpu" {
  type = number
}

variable "fargate_memory" {
  type = number
}

variable "desired_count_api" {
  type = number
}

variable "desired_count_client" {
  type = number
}
