output "vpc_id" {
  value       = local.vpc_id
  description = "Default VPC used by EKS."
}

output "public_subnet_ids" {
  value       = local.subnet_ids
  description = "Default VPC subnets used by EKS worker nodes."
}

output "eks_cluster_name" {
  value       = aws_eks_cluster.this.name
  description = "EKS cluster name. Pass to 'aws eks update-kubeconfig --name' to configure kubectl."
}

output "eks_cluster_endpoint" {
  value       = aws_eks_cluster.this.endpoint
  description = "EKS API server endpoint."
}

output "eks_cluster_certificate_authority" {
  value       = aws_eks_cluster.this.certificate_authority[0].data
  description = "Base64-encoded certificate authority data for the cluster."
  sensitive   = true
}

output "node_group_name" {
  value       = aws_eks_node_group.this.node_group_name
  description = "EKS managed node group name."
}

output "server_nodeport" {
  value       = var.server_nodeport
  description = "NodePort for the API server. Access via http://<node-public-ip>:<nodeport>"
}

output "client_nodeport" {
  value       = var.client_nodeport
  description = "NodePort for the client. Access via http://<node-public-ip>:<nodeport>"
}

output "aws_account_id" {
  value       = data.aws_caller_identity.current.account_id
  description = "Current AWS account ID."
}

output "ecr_server_repository_url" {
  value       = aws_ecr_repository.server.repository_url
  description = "ECR repository URL for the server image."
}

output "ecr_client_repository_url" {
  value       = aws_ecr_repository.client.repository_url
  description = "ECR repository URL for the client image."
}
