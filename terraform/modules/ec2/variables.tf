variable "name" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "security_group_id" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "key_name" {
  type        = string
  description = "Empty string means no SSH key on the instance."
  default     = ""
}

variable "iam_instance_profile" {
  type = string
}
