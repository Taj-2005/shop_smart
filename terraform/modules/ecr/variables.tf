variable "name" {
  type = string
}

variable "create_repositories" {
  type        = bool
  description = "When false, look up existing ECR repos named {name}-server / {name}-client instead of creating them."
  default     = true
}
