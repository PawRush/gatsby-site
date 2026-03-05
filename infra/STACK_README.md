# Frontend Deployment Stack

This CDK stack deploys a Gatsby static site to AWS using S3 and CloudFront.

## Stack Name
`gatsby-site-1772712371-stack`

## Architecture

### Components

1. **S3 Bucket** (`gatsby-site-1772712371-bucket`)
   - Private bucket with blocked public access
   - Server-side encryption (S3-managed)
   - Auto-delete objects on stack deletion
   - Stores all static website assets

2. **CloudFront Distribution**
   - HTTPS-only access (redirects HTTP to HTTPS)
   - HTTP/2 and HTTP/3 support
   - Gzip/Brotli compression enabled
   - Global edge locations (Price Class 100)
   - IPv6 enabled
   - TLS 1.2+ minimum protocol version

3. **Origin Access Identity (OAI)**
   - Secure access from CloudFront to S3
   - Prevents direct S3 bucket access
   - IAM-based permissions

4. **CloudFront Function** (`gatsby-site-1772712371-url-rewrite`)
   - Handles URL rewriting for Gatsby SPA routing
   - Appends `/index.html` to routes without file extensions
   - Ensures proper client-side navigation

5. **S3 Deployment**
   - Automated deployment from `public/` directory
   - CloudFront cache invalidation on updates
   - Prunes old files
   - Sets optimal cache-control headers

## Features

### Gatsby-Specific Configuration

- **SPA Routing Support**: CloudFront Function rewrites URLs to support Gatsby's client-side routing
- **Error Pages**: 404 and 403 errors redirect to appropriate pages
- **Cache Optimization**: Long cache times for static assets, shorter for HTML
- **Default Root**: `index.html` served at root path

### Security

- Private S3 bucket (no public access)
- HTTPS enforcement
- OAI-based CloudFront access
- TLS 1.2+ minimum
- S3 server-side encryption

### Performance

- Global CDN with edge caching
- HTTP/2 and HTTP/3 support
- Automatic compression (Gzip/Brotli)
- Optimized cache policies
- 365-day cache for static assets

## Stack Properties

```typescript
interface FrontendStackProps {
  deploymentId: string;          // gatsby-site-1772712371
  buildOutputPath: string;        // ../../public
}
```

## Outputs

The stack exports the following outputs:

- **DistributionUrl**: CloudFront distribution URL (https://...)
- **DistributionId**: CloudFront distribution ID
- **BucketName**: S3 bucket name
- **DeploymentId**: Deployment identifier

## Resource Naming

All resources use the deployment ID as a prefix to avoid conflicts:
- Stack: `gatsby-site-1772712371-stack`
- Bucket: `gatsby-site-1772712371-bucket`
- Function: `gatsby-site-1772712371-url-rewrite`

## Tags

All resources are tagged with:
- `DeploymentId`: gatsby-site-1772712371
- `Framework`: Gatsby
- `ManagedBy`: CDK

## URL Rewrite Logic

The CloudFront Function implements the following logic for Gatsby SPA routing:

```javascript
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  
  // Check if the URI is missing a file extension or ends with '/'
  if (!uri.includes('.')) {
    // If URI ends with '/', append 'index.html'
    if (uri.endsWith('/')) {
      request.uri = uri + 'index.html';
    } 
    // Otherwise, append '/index.html' for client-side routing
    else {
      request.uri = uri + '/index.html';
    }
  }
  
  return request;
}
```

This ensures:
- `/` → `/index.html`
- `/about/` → `/about/index.html`
- `/blog` → `/blog/index.html`
- `/styles.css` → `/styles.css` (unchanged)

## Deployment Commands

```bash
# Build the Gatsby site first
npm run build

# Synthesize CloudFormation template
cd infra
npm run build
npx cdk synth

# Deploy the stack
npx cdk deploy

# Destroy the stack
npx cdk destroy
```

## Environment Variables

- `DEPLOYMENT_ID`: Override the default deployment ID (optional)
- `CDK_DEFAULT_ACCOUNT`: AWS account ID (set by AWS CLI)
- `CDK_DEFAULT_REGION`: AWS region (set by AWS CLI)

## Notes

- The stack uses `RemovalPolicy.DESTROY` for development convenience
- All objects are automatically deleted when the stack is destroyed
- CloudFront distribution takes ~15-20 minutes to deploy
- Cache invalidation is automatic on deployment
