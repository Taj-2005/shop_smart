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

resource "aws_ecs_service" "api" {
  name            = "${var.name}-api"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.desired_count_api
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  health_check_grace_period_seconds = 90

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [var.ecs_api_security_group_id]
    assign_public_ip = true
  }

  dynamic "load_balancer" {
    for_each = var.enable_load_balancer ? [1] : []
    content {
      target_group_arn = var.api_target_group_arn
      container_name   = "api"
      container_port   = var.server_container_port
    }
  }

  lifecycle {
    ignore_changes = [task_definition]
  }
}

resource "aws_ecs_service" "client" {
  name            = "${var.name}-client"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.client.arn
  desired_count   = var.desired_count_client
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  health_check_grace_period_seconds = 90

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [var.ecs_client_security_group_id]
    assign_public_ip = true
  }

  dynamic "load_balancer" {
    for_each = var.enable_load_balancer ? [1] : []
    content {
      target_group_arn = var.client_target_group_arn
      container_name   = "web"
      container_port   = var.client_container_port
    }
  }

  lifecycle {
    ignore_changes = [task_definition]
  }
}
