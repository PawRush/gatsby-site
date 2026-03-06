# Deployment Summary

## 🌐 Live URL

https://d2xr07mwscjanf.cloudfront.net

## Deployment Details

| Item | Value |
|---|---|
| **Deployment ID** | `gatsby-site-1772795009` |
| **CloudFront URL** | `https://d2xr07mwscjanf.cloudfront.net` |
| **Distribution ID** | `E9ZKTFQYOD596` |
| **S3 Bucket** | `gatsby-site-1772795009` |
| **AWS Region** | `us-east-1` |
| **AWS Account** | `002255676568` |
| **Stack Name** | `gatsby-site-1772795009` |
| **Stack Status** | `CREATE_COMPLETE` |

## Stack Outputs

| Output Key | Value |
|---|---|
| `DistributionDomainName` | `https://d2xr07mwscjanf.cloudfront.net` |
| `DistributionId` | `E9ZKTFQYOD596` |
| `BucketName` | `gatsby-site-1772795009` |
| `DeployCommand` | `aws s3 sync public/ s3://gatsby-site-1772795009 --delete` |
| `InvalidateCommand` | `aws cloudfront create-invalidation --distribution-id E9ZKTFQYOD596 --paths "/*"` |

## Quick Commands

### Re-deploy site assets
```bash
# Sync hashed assets (JS, CSS, images) with long-lived cache
aws s3 sync public/ s3://gatsby-site-1772795009/ --delete \
  --exclude "index.html" --exclude "*.json" \
  --cache-control "public, max-age=31536000, immutable"

# Sync HTML and JSON entry points with no-cache
aws s3 sync public/ s3://gatsby-site-1772795009/ \
  --exclude "*" --include "index.html" --include "*.json" \
  --cache-control "no-cache, no-store, must-revalidate"
```

### Invalidate CloudFront cache
```bash
aws cloudfront create-invalidation \
  --distribution-id E9ZKTFQYOD596 \
  --paths "/*"
```

### Re-deploy CDK infrastructure
```bash
cd infra && npx cdk deploy --require-approval never \
  -c deploymentId=gatsby-site-1772795009 \
  --outputs-file cdk-outputs.json
```

### Tear down infrastructure
```bash
cd infra && npx cdk destroy -c deploymentId=gatsby-site-1772795009
```

### Check CloudFormation stack status
```bash
aws cloudformation describe-stacks \
  --stack-name gatsby-site-1772795009 \
  --query 'Stacks[0].StackStatus' \
  --output text
```
