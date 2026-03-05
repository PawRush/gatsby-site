# CDK Infrastructure Documentation

**Deployment ID:** gatsby-site-1772716889
**Stack Name:** gatsby-site-1772716889-stack
**Last Updated:** 2026-03-05

---

## Infrastructure Overview

The CDK infrastructure is fully initialized and configured for deploying a Gatsby static site to AWS using S3 and CloudFront.

### Technology Stack
- **Infrastructure as Code:** AWS CDK v2.1108.0
- **Language:** TypeScript 5.9.3
- **Framework:** Gatsby (Static Site Generator)
- **Build Output:** `public/` directory

---

## Directory Structure

```
infra/
├── bin/
│   └── infra.ts              # CDK app entry point
├── lib/
│   ├── frontend-stack.ts     # Main deployment stack
│   └── infra-stack.ts        # Legacy/example stack
├── test/
│   └── infra.test.ts         # Stack tests
├── cdk.json                  # CDK configuration
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

---

## AWS Resources Created

### 1. S3 Bucket (`gatsby-site-1772716889-bucket`)
- **Purpose:** Static website hosting
- **Configuration:**
  - Block all public access (CloudFront only)
  - S3-managed encryption
  - Auto-delete on stack destruction
  - Removal policy: DESTROY

### 2. CloudFront Distribution
- **Purpose:** Global CDN for fast content delivery
- **Configuration:**
  - HTTPS redirect (TLS 1.2+)
  - HTTP/2 and HTTP/3 enabled
  - Compression enabled
  - Price class: 100 (US, Canada, Europe)
  - IPv6 enabled
  - Default root object: `index.html`

### 3. Origin Access Identity (OAI)
- **Purpose:** Secure S3 access for CloudFront
- **Configuration:**
  - Grants CloudFront read access to S3
  - Prevents direct S3 access

### 4. CloudFront Function (URL Rewriting)
- **Purpose:** Handle Gatsby SPA client-side routing
- **Logic:**
  - Rewrites extensionless URLs to `/index.html`
  - Handles trailing slashes
  - Supports Gatsby's routing mechanism

### 5. S3 Bucket Deployment
- **Purpose:** Automated content deployment
- **Configuration:**
  - Syncs `public/` directory to S3
  - Automatic CloudFront invalidation
  - Prune old files
  - Cache control: 1 year for static assets
  - Only deploys if build output exists

---

## Error Handling

### Custom Error Responses
1. **404 Not Found**
   - Returns: `/404.html` (if exists)
   - Status: 200 OK
   - TTL: 5 minutes

2. **403 Forbidden**
   - Returns: `/index.html` (for SPA routing)
   - Status: 200 OK
   - TTL: 5 minutes

---

## Stack Outputs

After deployment, the stack exports:

| Output | Description | Export Name |
|--------|-------------|-------------|
| `DistributionUrl` | CloudFront URL (https://xxx.cloudfront.net) | `gatsby-site-1772716889-distribution-url` |
| `DistributionId` | CloudFront distribution ID | `gatsby-site-1772716889-distribution-id` |
| `BucketName` | S3 bucket name | `gatsby-site-1772716889-bucket-name` |
| `DeploymentId` | Deployment identifier | N/A |
| `BuildOutputPath` | Path to build directory | N/A |
| `BuildOutputExists` | Whether build output exists | N/A |

---

## CDK Commands

### Build TypeScript
```bash
cd infra
npm run build
```

### Synthesize CloudFormation
```bash
cd infra
DEPLOYMENT_ID=gatsby-site-1772716889 npx cdk synth
```

### Deploy Stack
```bash
cd infra
DEPLOYMENT_ID=gatsby-site-1772716889 npx cdk deploy
```

### Destroy Stack
```bash
cd infra
DEPLOYMENT_ID=gatsby-site-1772716889 npx cdk destroy
```

### List Stacks
```bash
cd infra
npx cdk list
```

---

## Dependencies

### Production Dependencies
- `aws-cdk-lib` (^2.240.0) - AWS CDK core library
- `constructs` (^10.5.0) - CDK constructs library
- `@aws-solutions-constructs/aws-cloudfront-s3` (^2.100.1) - Pre-built CloudFront+S3 patterns

### Development Dependencies
- `aws-cdk` (2.1108.0) - CDK CLI
- `typescript` (~5.9.3) - TypeScript compiler
- `ts-node` (^10.9.2) - TypeScript execution
- `jest` (^30) - Testing framework
- `ts-jest` (^29) - Jest TypeScript support

---

## Configuration Details

### CDK Context (`cdk.json`)
- **App:** `npx ts-node --prefer-ts-exts bin/infra.ts`
- **Watch patterns:** `**/*.ts`, `**/*.js`
- **Exclude patterns:** `README.md`, `node_modules/`, etc.

### Environment Variables
- `DEPLOYMENT_ID` - Controls stack naming (default: `gatsby-site-1772712371`)
- `CDK_DEFAULT_ACCOUNT` - AWS account ID (auto-detected)
- `CDK_DEFAULT_REGION` - AWS region (auto-detected)

---

## Security Features

1. **S3 Bucket:**
   - Block all public access
   - No direct internet access
   - Server-side encryption enabled

2. **CloudFront:**
   - HTTPS only (redirect from HTTP)
   - TLS 1.2 minimum protocol version
   - Modern HTTP/2 and HTTP/3 support

3. **Access Control:**
   - Origin Access Identity for S3 access
   - No public S3 bucket policies
   - CloudFront-only access pattern

---

## Resource Tags

All resources are tagged with:
- `DeploymentId: gatsby-site-1772716889`
- `Framework: Gatsby`
- `ManagedBy: CDK`

---

## Known Warnings

### S3Origin Deprecation
The stack uses `aws-cdk-lib.aws_cloudfront_origins.S3Origin` which is deprecated. Future versions should migrate to:
- `S3BucketOrigin` for standard bucket origins
- `S3StaticWebsiteOrigin` for website-enabled buckets

### Build Output Check
If the build output directory (`public/`) doesn't exist during synthesis, the S3 deployment will be skipped with a warning. This is expected behavior before the first build.

---

## Prerequisites for Deployment

1. ✅ AWS CLI installed and configured
2. ✅ AWS CDK CLI installed
3. ✅ Node.js 20.18.3+ installed
4. ✅ TypeScript dependencies installed
5. ❌ AWS credentials configured (REQUIRED)
6. ⚠️ Gatsby build completed (public/ directory exists)

---

## Next Steps

1. **Build the Gatsby site:**
   ```bash
   cd /tmp/deployment-agent-repos/gatsby-site
   npm install
   npm run build
   ```

2. **Configure AWS credentials:**
   ```bash
   aws configure
   ```

3. **Bootstrap CDK (first-time only):**
   ```bash
   cd infra
   DEPLOYMENT_ID=gatsby-site-1772716889 npx cdk bootstrap
   ```

4. **Deploy the stack:**
   ```bash
   cd infra
   DEPLOYMENT_ID=gatsby-site-1772716889 npx cdk deploy
   ```

---

## Verification Status

- ✅ CDK infrastructure initialized
- ✅ TypeScript compilation successful
- ✅ CDK synthesis successful (with expected warnings)
- ✅ Dependencies installed
- ✅ Stack definition complete
- ❌ Build output not yet available
- ❌ AWS credentials not configured

---

## Summary

The CDK infrastructure is **fully configured and ready for deployment**. All code is in place, dependencies are installed, and the stack can successfully synthesize CloudFormation templates. 

The only blockers are:
1. AWS credentials configuration
2. Gatsby build completion

Once these prerequisites are met, the deployment can proceed immediately.
