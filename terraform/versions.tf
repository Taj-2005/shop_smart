terraform {
  required_version = ">= 1.5.0"

  # Partial backend configuration: bucket, key, and region are supplied at
  # init time via -backend-config flags in CI workflows.
  # See .github/workflows/infra-deploy.yml for the bootstrap + init steps.
  backend "s3" {}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
