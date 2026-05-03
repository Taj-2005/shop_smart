provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

locals {
  name = "${var.project_name}-${var.environment}"
}

data "aws_caller_identity" "current" {}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

locals {
  vpc_id     = data.aws_vpc.default.id
  subnet_ids = slice(data.aws_subnets.default.ids, 0, 2)
}

resource "aws_eks_cluster" "this" {
  name     = "${local.name}-eks"
  role_arn = var.labrole_arn

  vpc_config {
    subnet_ids             = local.subnet_ids
    endpoint_public_access = true
  }

  tags = {
    Name = "${local.name}-eks"
  }
}

# Open NodePort traffic on the cluster's shared security group so that
# external clients can reach services running on worker nodes.
resource "aws_security_group_rule" "nodeport_server" {
  type              = "ingress"
  from_port         = var.server_nodeport
  to_port           = var.server_nodeport
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_eks_cluster.this.vpc_config[0].cluster_security_group_id
  description       = "Allow inbound traffic to API server NodePort"
}

resource "aws_security_group_rule" "nodeport_client" {
  type              = "ingress"
  from_port         = var.client_nodeport
  to_port           = var.client_nodeport
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_eks_cluster.this.vpc_config[0].cluster_security_group_id
  description       = "Allow inbound traffic to client NodePort"
}

resource "aws_eks_node_group" "this" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${local.name}-nodes"
  node_role_arn   = var.labrole_arn

  subnet_ids     = local.subnet_ids
  instance_types = [var.node_instance_type]

  scaling_config {
    desired_size = var.desired_nodes
    max_size     = var.max_nodes
    min_size     = var.min_nodes
  }

  update_config {
    max_unavailable = 1
  }

  tags = {
    Name = "${local.name}-nodes"
  }
}
