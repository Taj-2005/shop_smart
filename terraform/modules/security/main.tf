resource "aws_security_group" "alb" {
  name        = "${var.name}-alb"
  description = "Ingress to application load balancer"
  vpc_id      = var.vpc_id

  ingress {
    description = "API"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Web (client on listener 8080)"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_api" {
  name        = "${var.name}-ecs-api"
  description = "API Fargate tasks"
  vpc_id      = var.vpc_id

  ingress {
    description     = "From ALB"
    from_port       = var.server_container_port
    to_port         = var.server_container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_client" {
  name        = "${var.name}-ecs-client"
  description = "Web Fargate tasks"
  vpc_id      = var.vpc_id

  ingress {
    description     = "From ALB"
    from_port       = var.client_container_port
    to_port         = var.client_container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ec2" {
  count       = var.enable_ec2 ? 1 : 0
  name        = "${var.name}-ec2"
  description = "Optional EC2 host"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.ec2_key_name != "" && var.ssh_ingress_cidr != "" ? [1] : []
    content {
      description = "SSH"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [var.ssh_ingress_cidr]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
