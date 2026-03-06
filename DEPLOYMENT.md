# Deployment — gatsby-site-1772785016

## Live URL

https://d1qxkv3zwgmkge.cloudfront.net

## Stack Outputs

| Output                  | Value                                      |
|-------------------------|--------------------------------------------|
| **Site URL**            | https://d1qxkv3zwgmkge.cloudfront.net      |
| **S3 Bucket**           | gatsby-site-1772785016                     |
| **CloudFront ID**       | E176NW0OB17LVR                             |
| **CloudFront Domain**   | d1qxkv3zwgmkge.cloudfront.net              |
| **Stack Name**          | FrontendStack-gatsby-site-1772785016       |
| **AWS Account**         | 002255676568                               |
| **Region**              | us-east-1                                  |
| **Stack Status**        | CREATE_COMPLETE                            |

## AWS Resources

- **CloudFormation Stack:** `FrontendStack-gatsby-site-1772785016`
- **S3 Bucket:** `gatsby-site-1772785016` (private, OAC-only access)
- **CloudFront Distribution:** `E176NW0OB17LVR` (HTTPS, HTTP/2+3, PriceClass_100)
- **CloudFront Function:** `gatsby-site-1772785016-url-rewrite` (clean URL rewriting)
- **Origin Access Control:** sigv4 signed requests from CloudFront → S3

## Quick Commands

### Build the site
```bash
npm ci
npm run build
```

### Sync build output to S3
```bash
# Hashed assets — long-lived cache (JS, CSS, images)
aws s3 sync public/ s3://gatsby-site-1772785016/ \
  --exclude "*" --include "*.js" --include "*.css" --include "*.woff2" \
  --cache-control "public,max-age=31536000,immutable" --delete

# HTML + page-data — no cache
aws s3 sync public/ s3://gatsby-site-1772785016/ \
  --exclude "*" --include "*.html" --include "page-data/*" \
  --cache-control "no-cache,no-store,must-revalidate" --delete

# Everything else — 1-day cache
aws s3 sync public/ s3://gatsby-site-1772785016/ \
  --cache-control "public,max-age=86400" --delete
```

### Invalidate CloudFront cache
```bash
aws cloudfront create-invalidation \
  --distribution-id E176NW0OB17LVR \
  --paths "/*"
```

### Full redeploy (build + sync + invalidate)
```bash
bash scripts/deploy.sh
```

### Update infrastructure only
```bash
cd infra
cdk deploy --require-approval never \
  -c deploymentId=gatsby-site-1772785016 \
  --outputs-file cdk-outputs.json
```

### Tear down all AWS resources
```bash
cd infra
cdk destroy --force -c deploymentId=gatsby-site-1772785016
```

### Check stack status
```bash
aws cloudformation describe-stacks \
  --stack-name FrontendStack-gatsby-site-1772785016 \
  --query 'Stacks[0].StackStatus' --output text
```

## Deployment Notes

- Static assets with content hashes (`/static/**`) are served with a **1-year immutable cache**.
- HTML files and `page-data/` are served **uncached** so updates are immediately visible.
- The CloudFront Function rewrites clean URLs (e.g. `/about` → `/about/index.html`).
- 403/404 errors from S3 are mapped to `/404/index.html` with a 10s TTL.
- The S3 bucket is **not public** — all access goes through CloudFront via OAC (sigv4).
