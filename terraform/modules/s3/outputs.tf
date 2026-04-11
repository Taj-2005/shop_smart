output "bucket_id" {
  value       = aws_s3_bucket.app.id
  description = "S3 bucket name."
}

output "bucket_arn" {
  value       = aws_s3_bucket.app.arn
  description = "S3 bucket ARN for IAM policies."
}
