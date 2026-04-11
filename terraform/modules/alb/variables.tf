variable "name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type        = list(string)
  description = "At least two subnets in distinct AZs."
}

variable "alb_security_group_id" {
  type = string
}

variable "server_container_port" {
  type = number
}

variable "client_container_port" {
  type = number
}

variable "api_health_check_path" {
  type = string
}

variable "client_health_check_path" {
  type = string
}
