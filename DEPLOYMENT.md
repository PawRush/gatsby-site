# Deployment Summary

## 🌐 Live URL

https://d10vf2tw1paq7l.cloudfront.net

## Stack Outputs

| Key                    | Value                                    |
|------------------------|------------------------------------------|
| **Deployment ID**      | `gatsby-site-1772804382`                 |
| **Stack Name**         | `gatsby-site-1772804382`                 |
| **Stack Status**       | `CREATE_COMPLETE`                        |
| **BucketName**         | `gatsby-site-1772804382`                 |
| **DistributionId**     | `E3348J8OUMRF4A`                         |
| **DistributionDomainName** | `https://d10vf2tw1paq7l.cloudfront.net` |

## Infrastructure

- **Cloud Provider:** AWS (us-east-1)
- **Account:** 002255676568
- **S3 Bucket:** `gatsby-site-1772804382` (private, OAC-restricted)
- **CloudFront Distribution:** `E3348J8OUMRF4A`
- **CDK Stack ARN:** `arn:aws:cloudformation:us-east-1:002255676568:stack/gatsby-site-1772804382/70d74990-1963-11f1-9935-0affd207b841`

## Quick Commands

### Upload assets & invalidate cache
```bash
# Sync hashed assets (JS, CSS, images, fonts) — long-lived cache
aws s3 sync public/ s3://gatsby-site-1772804382/ --delete \
  --exclude "index.html" --exclude "*.json" \
  --cache-control "public, max-age=31536000, immutable"

# Sync HTML + JSON manifests — no cache
aws s3 sync public/ s3://gatsby-site-1772804382/ \
  --exclude "*" --include "index.html" --include "*.json" \
  --cache-control "no-cache, no-store, must-revalidate"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E3348J8OUMRF4A \
  --paths "/*"
```

### Redeploy infrastructure
```bash
cd infra
npx cdk deploy --require-approval never \
  -c deploymentId=gatsby-site-1772804382 \
  --outputs-file cdk-outputs.json
```

### Tear down
```bash
cd infra
npx cdk destroy -c deploymentId=gatsby-site-1772804382
```

### Check stack status
```bash
aws cloudformation describe-stacks \
  --stack-name gatsby-site-1772804382 \
  --query 'Stacks[0].StackStatus' \
  --output text
```
