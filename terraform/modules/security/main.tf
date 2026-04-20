resource "aws_security_group" "ecs_api" {
  name        = "${var.name}-ecs-api"
  description = "API Fargate tasks"
  vpc_id      = var.vpc_id

  ingress {
    description = "Public API"
    from_port   = var.server_container_port
    to_port     = var.server_container_port
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

resource "aws_security_group" "ecs_client" {
  name        = "${var.name}-ecs-client"
  description = "Web Fargate tasks"
  vpc_id      = var.vpc_id

  ingress {
    description = "Public web"
    from_port   = var.client_container_port
    to_port     = var.client_container_port
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
