variable "name" {
  type        = string
  description = "Name prefix for all ALB resources."
}

variable "vpc_id" {
  type        = string
  description = "VPC ID where the ALB and target groups will be created."
}

variable "subnet_ids" {
  type        = list(string)
  description = "List of public subnet IDs for the ALB (minimum 2 required)."
}

variable "server_container_port" {
  type        = number
  description = "Container port for the API service."
  default     = 4000
}

variable "client_container_port" {
  type        = number
  description = "Container port for the client service."
  default     = 3000
}

variable "api_health_check_path" {
  type        = string
  description = "Health check path for the API target group."
  default     = "/api/health"
}

variable "client_health_check_path" {
  type        = string
  description = "Health check path for the client target group."
  default     = "/"
}
