variable "name" {
  type = string
}

variable "enable_ec2" {
  type = bool
}

variable "s3_bucket_arn" {
  type        = string
  description = "App bucket ARN for ECS task read policy."
}
