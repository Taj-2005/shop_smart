locals {
  # Minimal HTTP listeners so the first `terraform apply` passes ALB health checks
  # before CI deploys real images (task definition updates are owned by CI afterward).
  api_bootstrap_cmd = [
    "node", "-e",
    "require('http').createServer((q,s)=>{s.statusCode=200;s.end('ok');}).listen(4000,'0.0.0.0');"
  ]
  web_bootstrap_cmd = [
    "node", "-e",
    "require('http').createServer((q,s)=>{s.statusCode=200;s.end('ok');}).listen(3000,'0.0.0.0');"
  ]
}

resource "aws_ecs_cluster" "this" {
  name = "${var.name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.name}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([{
    name      = "api"
    image     = var.server_container_image
    command   = local.api_bootstrap_cmd
    essential = true
    portMappings = [{
      containerPort = var.server_container_port
      protocol      = "tcp"
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.name}-api"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "api"
        "awslogs-create-group"  = "true"
      }
    }
  }])

  lifecycle {
    ignore_changes = [container_definitions]
  }
}

resource "aws_ecs_task_definition" "client" {
  family                   = "${var.name}-client"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([{
    name      = "web"
    image     = var.client_container_image
    command   = local.web_bootstrap_cmd
    essential = true
    portMappings = [{
      containerPort = var.client_container_port
      protocol      = "tcp"
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.name}-client"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "web"
        "awslogs-create-group"  = "true"
      }
    }
  }])

  lifecycle {
    ignore_changes = [container_definitions]
  }
}

## NOTE:
## ECS services are intentionally not managed by Terraform in this repo.
## In AWS Academy accounts (and when running Terraform without a remote backend),
## repeated applies can fail on CreateService idempotency errors if a prior service
## exists in a transient INACTIVE/DELETING state. The GitHub Actions deploy workflows
## handle create-or-update of services idempotently via AWS CLI.
