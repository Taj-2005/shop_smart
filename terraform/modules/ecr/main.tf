resource "aws_ecr_repository" "server" {
  count = var.create_repositories ? 1 : 0

  name                 = "${var.name}-server"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "client" {
  count = var.create_repositories ? 1 : 0

  name                 = "${var.name}-client"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

data "aws_ecr_repository" "server" {
  count = var.create_repositories ? 0 : 1
  name  = "${var.name}-server"
}

data "aws_ecr_repository" "client" {
  count = var.create_repositories ? 0 : 1
  name  = "${var.name}-client"
}

locals {
  server_repo_name = var.create_repositories ? aws_ecr_repository.server[0].name : data.aws_ecr_repository.server[0].name
  client_repo_name = var.create_repositories ? aws_ecr_repository.client[0].name : data.aws_ecr_repository.client[0].name
}

resource "aws_ecr_lifecycle_policy" "server" {
  repository = local.server_repo_name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 20 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 20
      }
      action = { type = "expire" }
    }]
  })
}

resource "aws_ecr_lifecycle_policy" "client" {
  repository = local.client_repo_name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 20 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 20
      }
      action = { type = "expire" }
    }]
  })
}
