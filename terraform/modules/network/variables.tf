variable "name" {
  type        = string
  description = "Resource name prefix (project-environment)."
}

variable "vpc_cidr" {
  type        = string
  description = "VPC IPv4 CIDR."
}

variable "availability_zones" {
  type        = list(string)
  description = "AZs for public subnets (typically two for ALB/ECS)."
}
