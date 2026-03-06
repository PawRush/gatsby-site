# Deployment Summary

## Live URL

https://d3ixp6wli19wn5.cloudfront.net

## Deployment Details

| Field              | Value                          |
|--------------------|--------------------------------|
| Deployment ID      | gatsby-site-1772791448         |
| AWS Region         | us-east-1                      |
| AWS Account        | 002255676568                   |
| CloudFormation Stack | gatsby-site-1772791448       |
| Stack Status       | CREATE_COMPLETE                |

## Stack Outputs

| Output Key        | Value                                     |
|-------------------|-------------------------------------------|
| BucketName        | gatsby-site-1772791448                    |
| DistributionId    | E27LRFN7KVMIL4                            |
| DistributionUrl   | https://d3ixp6wli19wn5.cloudfront.net     |

## Quick Commands

### Redeploy (sync build assets to S3)
```bash
# Sync hashed assets with long-lived cache
aws s3 sync public/ s3://gatsby-site-1772791448/ \
  --delete \
  --exclude "index.html" --exclude "*.json" \
  --cache-control "public, max-age=31536000, immutable"

# Sync index.html and JSON manifests with no-cache
aws s3 sync public/ s3://gatsby-site-1772791448/ \
  --exclude "*" --include "index.html" --include "*.json" \
  --cache-control "no-cache, no-store, must-revalidate"
```

### Invalidate CloudFront Cache
```bash
aws cloudfront create-invalidation \
  --distribution-id E27LRFN7KVMIL4 \
  --paths "/*"
```

### Tear Down Infrastructure
```bash
cd infra && npx cdk destroy --force -c deploymentId=gatsby-site-1772791448
```

### Check Stack Status
```bash
aws cloudformation describe-stacks \
  --stack-name gatsby-site-1772791448 \
  --query 'Stacks[0].StackStatus' \
  --output text
```
