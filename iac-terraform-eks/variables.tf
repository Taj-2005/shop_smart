variable "aws_region" {
  type        = string
  description = "AWS region for all resources."
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Short project prefix for resource names."
  default     = "shopsmart"
}

variable "environment" {
  type        = string
  description = "Deployment stage (e.g. dev, staging, prod)."
  default     = "dev"
}

variable "labrole_arn" {
  type        = string
  description = "IAM role ARN to use as EKS cluster role and node instance role (AWS Academy LabRole)."
}

variable "node_instance_type" {
  type        = string
  description = "EC2 instance type for EKS managed node group."
  default     = "t3.small"
}

variable "desired_nodes" {
  type        = number
  description = "Desired number of worker nodes."
  default     = 2
}

variable "min_nodes" {
  type        = number
  description = "Minimum number of worker nodes."
  default     = 1
}

variable "max_nodes" {
  type        = number
  description = "Maximum number of worker nodes."
  default     = 3
}

variable "server_container_port" {
  type        = number
  description = "Container port for the API server."
  default     = 4000
}

variable "client_container_port" {
  type        = number
  description = "Container port for the client (Next.js)."
  default     = 3000
}

variable "server_nodeport" {
  type        = number
  description = "NodePort for the API server service (30000-32767)."
  default     = 30400
}

variable "client_nodeport" {
  type        = number
  description = "NodePort for the client service (30000-32767)."
  default     = 30300
}
