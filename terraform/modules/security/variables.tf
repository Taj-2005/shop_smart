variable "name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "server_container_port" {
  type = number
}

variable "client_container_port" {
  type = number
}

variable "enable_ec2" {
  type = bool
}

variable "ec2_key_name" {
  type = string
}

variable "ssh_ingress_cidr" {
  type = string
}
