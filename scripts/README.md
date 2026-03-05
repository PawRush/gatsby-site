# Deployment Scripts

This directory contains automation scripts for deploying the Gatsby site to AWS.

## Available Scripts

### deploy.sh

Main deployment script that automates the entire deployment process.

**Purpose:** Deploy Gatsby site to AWS using S3, CloudFront, and CDK infrastructure.

**Usage:**
```bash
./scripts/deploy.sh [OPTIONS]
```

**Options:**
- `--skip-build` - Skip the Gatsby build step (use existing build)
- `--skip-bootstrap` - Skip CDK bootstrap step (if already bootstrapped)
- `--synth-only` - Only synthesize CloudFormation template (dry-run)
- `--help` - Display help message

**Environment Variables:**
- `DEPLOYMENT_ID` - Unique deployment identifier (default: gatsby-site-1772716889)
- `AWS_PROFILE` - AWS profile to use (optional)
- `AWS_REGION` - AWS region for deployment (default: us-east-1)

## Deployment Workflow

The `deploy.sh` script performs the following steps:

1. **Prerequisites Check**
   - Verify Node.js and npm are installed
   - Verify AWS CLI is installed
   - Verify AWS credentials are configured
   - Check AWS CDK availability

2. **Build Gatsby Site**
   - Install npm dependencies (if needed)
   - Run `npm run build`
   - Verify build output in `public/` directory

3. **Install CDK Dependencies**
   - Install AWS CDK packages in `infra/` directory

4. **Bootstrap CDK**
   - Check if CDK is already bootstrapped
   - Run CDK bootstrap (first-time setup)

5. **Synthesize CloudFormation**
   - Generate CloudFormation template from CDK code
   - Output template to `infra/cdk.out/`

6. **Deploy to AWS**
   - Deploy CloudFormation stack
   - Create/update S3 bucket
   - Create/update CloudFront distribution
   - Upload website files to S3
   - Invalidate CloudFront cache

7. **Display Outputs**
   - Show CloudFront URL (website URL)
   - Show CloudFront Distribution ID
   - Show S3 Bucket name
   - Save outputs to `cdk-outputs.json`

## Examples

### Full Deployment (Recommended)

Deploy everything from scratch:

```bash
./scripts/deploy.sh
```

This will:
- Build the Gatsby site
- Bootstrap CDK (if needed)
- Deploy infrastructure
- Upload files
- Display the website URL

### Quick Deployment (Skip Build)

If you've already built the site and just want to deploy:

```bash
./scripts/deploy.sh --skip-build
```

Useful for:
- Redeploying with existing build
- Testing infrastructure changes
- Faster iterations

### Dry Run (Synth Only)

Generate CloudFormation template without deploying:

```bash
./scripts/deploy.sh --synth-only
```

Useful for:
- Reviewing infrastructure changes
- Validating CDK code
- CI/CD pipeline testing

### Deploy to Different Region

```bash
AWS_REGION=eu-west-1 ./scripts/deploy.sh
```

### Use Specific AWS Profile

```bash
AWS_PROFILE=production ./scripts/deploy.sh
```

### Custom Deployment ID

```bash
DEPLOYMENT_ID=my-custom-deployment ./scripts/deploy.sh
```

## Prerequisites

Before running the deployment script, ensure you have:

### Required Tools

1. **Node.js** (v14 or later)
   ```bash
   node --version
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **AWS CLI** (v2 recommended)
   ```bash
   aws --version
   ```
   Install from: https://aws.amazon.com/cli/

4. **AWS Credentials** configured
   ```bash
   aws configure
   ```
   Or set up via environment variables or AWS profiles

### AWS Permissions

The AWS account/user needs permissions for:
- CloudFormation (create/update stacks)
- S3 (create buckets, upload files)
- CloudFront (create distributions)
- IAM (create roles for CDK)
- Lambda@Edge/CloudFront Functions (for URL rewriting)

Minimum recommended policy: `PowerUserAccess` or custom policy with above permissions.

### First-Time Setup

If this is your first time deploying:

1. **Configure AWS credentials:**
   ```bash
   aws configure
   ```

2. **Set AWS region** (or script will use us-east-1):
   ```bash
   export AWS_REGION=us-east-1
   ```

3. **Run deployment:**
   ```bash
   ./scripts/deploy.sh
   ```

The script will automatically handle CDK bootstrap on first run.

## Output

After successful deployment, the script will display:

```
═══════════════════════════════════════════════════════════════
  Deployment Outputs
═══════════════════════════════════════════════════════════════

✓ Your Gatsby site has been deployed!

🌐 Website URL:
   https://d1234567890abc.cloudfront.net

📊 CloudFront Distribution ID:
   E1234567890ABC

🪣 S3 Bucket Name:
   gatsby-site-1772716889-bucket

📋 Stack Name:
   gatsby-site-1772716889-stack
```

## Resources Created

The deployment script creates the following AWS resources:

### S3 Bucket
- **Name:** `gatsby-site-1772716889-bucket`
- **Purpose:** Store static website files
- **Access:** Private (CloudFront only via OAI)
- **Encryption:** S3-managed (SSE-S3)

### CloudFront Distribution
- **Purpose:** Global CDN for fast content delivery
- **Protocol:** HTTPS with HTTP redirect
- **HTTP Version:** HTTP/2 and HTTP/3
- **Compression:** Enabled
- **Cache:** Optimized for static assets

### CloudFront Function
- **Name:** `gatsby-site-1772716889-url-rewrite`
- **Purpose:** URL rewriting for Gatsby SPA routing
- **Behavior:** Rewrites extensionless URLs to `/index.html`

### Origin Access Identity (OAI)
- **Purpose:** Secure S3 access (only from CloudFront)
- **Security:** Blocks direct S3 access

## Updating Your Site

To update your deployed site after making changes:

1. **Make changes** to your Gatsby site
2. **Run deployment script:**
   ```bash
   ./scripts/deploy.sh
   ```
3. **Script will:**
   - Rebuild your site
   - Update S3 files
   - Invalidate CloudFront cache
   - Your changes go live in minutes

## Troubleshooting

### "AWS credentials not configured"

**Solution:** Run `aws configure` and enter your credentials

### "CDK bootstrap failed"

**Solution:** Ensure you have sufficient AWS permissions (AdministratorAccess or PowerUserAccess)

### "Build failed"

**Solution:** 
- Check Node.js version (should be v14+)
- Run `npm install` manually
- Check for build errors in output

### "CloudFormation stack already exists"

**Solution:** This is normal on subsequent deployments. CDK will update the existing stack.

### "Distribution URL not working immediately"

**Reason:** CloudFront distributions take 10-15 minutes to fully deploy globally.

**Solution:** Wait a few minutes and try again.

## CI/CD Integration

The deployment script can be integrated into CI/CD pipelines:

### GitHub Actions Example

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to AWS
        run: ./scripts/deploy.sh
        env:
          DEPLOYMENT_ID: gatsby-site-production
```

### GitLab CI Example

```yaml
deploy:
  image: node:18
  stage: deploy
  before_script:
    - apt-get update && apt-get install -y awscli
    - aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
    - aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
    - aws configure set region us-east-1
  script:
    - chmod +x scripts/deploy.sh
    - ./scripts/deploy.sh
  only:
    - main
```

## Cost Estimation

Typical monthly costs for a small Gatsby site:

- **S3 Storage:** $0.023/GB (~$0.50 for 20GB)
- **CloudFront:** $0.085/GB data transfer (~$8.50 for 100GB)
- **CloudFront Requests:** $0.0075 per 10,000 requests (~$0.75 for 1M requests)
- **Total:** ~$10-50/month depending on traffic

AWS Free Tier includes:
- 5GB S3 storage
- 2,000 CloudFormation operations
- CloudFront free tier (first 12 months)

## Cleanup

To delete all resources and stop incurring costs:

```bash
cd infra
DEPLOYMENT_ID=gatsby-site-1772716889 npx cdk destroy
```

This will:
- Delete CloudFront distribution
- Delete S3 bucket and all files
- Delete CloudFormation stack
- Remove all associated resources

**Warning:** This is irreversible. Make sure you have backups.

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Gatsby Documentation](https://www.gatsbyjs.com/docs/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [S3 Documentation](https://docs.aws.amazon.com/s3/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review AWS CloudFormation events in AWS Console
3. Check CDK deployment logs
4. Review `infra/STACK_README.md` for infrastructure details

## Version

**Script Version:** 1.0.0  
**Last Updated:** 2026-03-05  
**Deployment ID:** gatsby-site-1772716889
