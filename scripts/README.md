# Deployment Scripts

This directory contains automation scripts for deploying the Gatsby site to AWS.

## Available Scripts

### `deploy.sh` - Main Deployment Script

Automates the complete deployment process from build to AWS deployment.

#### Features

- ✅ **Pre-flight checks**: Verifies all required tools are installed
- ✅ **AWS credential validation**: Ensures AWS access is configured
- ✅ **Dependency installation**: Installs both project and CDK dependencies
- ✅ **Gatsby build**: Compiles the static site
- ✅ **CDK bootstrap**: Sets up CDK in your AWS account (one-time)
- ✅ **Infrastructure deployment**: Deploys S3 + CloudFront stack
- ✅ **Output display**: Shows CloudFront URL and deployment details
- ✅ **Error handling**: Proper error messages and rollback support
- ✅ **Colored output**: Easy-to-read terminal output

#### Usage

**Basic Deployment:**
```bash
./scripts/deploy.sh
```

**With Options:**
```bash
# Skip dependency installation (if already done)
./scripts/deploy.sh --skip-deps

# Skip Gatsby build (use existing build)
./scripts/deploy.sh --skip-build

# Deploy to specific region
./scripts/deploy.sh --region us-west-2

# Combine options
./scripts/deploy.sh --skip-deps --skip-build --region eu-west-1
```

**Using AWS Profile:**
```bash
AWS_PROFILE=myprofile ./scripts/deploy.sh
```

**Set Region via Environment Variable:**
```bash
AWS_REGION=ap-southeast-1 ./scripts/deploy.sh
```

#### Command Line Options

| Option | Description |
|--------|-------------|
| `--skip-build` | Skip the Gatsby build step (uses existing `public/` directory) |
| `--skip-deps` | Skip dependency installation (npm install) |
| `--region REGION` | Set AWS region for deployment (default: us-east-1) |
| `--help` | Display help message with usage information |

#### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_REGION` | AWS region for deployment | us-east-1 |
| `AWS_PROFILE` | AWS CLI profile to use | (default profile) |
| `AWS_ACCESS_KEY_ID` | AWS access key | (from AWS config) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | (from AWS config) |

#### Prerequisites

The script checks for the following tools:

- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **AWS CLI** (v2 recommended)
- **AWS CDK** (`npm install -g aws-cdk`)

AWS credentials must be configured:
```bash
aws configure
# OR
aws sso login
```

#### Deployment Steps

The script executes the following steps in order:

1. **Pre-flight Checks**
   - Verify required tools are installed
   - Check AWS credentials are configured
   - Validate project structure

2. **Install Dependencies**
   - Install project dependencies (`npm install`)
   - Install CDK infrastructure dependencies

3. **Build Gatsby Site**
   - Clean previous build
   - Run `npm run build`
   - Verify build output

4. **CDK Bootstrap** (if needed)
   - Check if region is already bootstrapped
   - Bootstrap CDK in AWS account/region
   - Creates CDKToolkit CloudFormation stack

5. **Synthesize CDK Stack**
   - Generate CloudFormation template
   - Validate CDK code

6. **Deploy CDK Stack**
   - Deploy infrastructure to AWS
   - Create/update S3 bucket
   - Create/update CloudFront distribution
   - Upload site content to S3
   - Configure URL rewriting and caching

7. **Display Outputs**
   - Show CloudFront URL
   - Display deployment details
   - Save outputs to `cdk-outputs.json`

#### Output Files

After successful deployment:

- **`cdk-outputs.json`** - Stack outputs including CloudFront URL
- **`infra/cdk.out/`** - Synthesized CloudFormation templates

#### Expected Duration

| Step | Duration |
|------|----------|
| Pre-flight checks | ~5 seconds |
| Install dependencies | 1-2 minutes |
| Build Gatsby site | 30-60 seconds |
| CDK bootstrap (first time) | 2-3 minutes |
| CDK synth | ~10 seconds |
| CDK deploy (first time) | 15-20 minutes |
| CDK deploy (updates) | 2-5 minutes |

**Total first deployment:** ~20-25 minutes  
**Total subsequent deployments:** ~3-8 minutes

#### Deployment ID

All AWS resources are prefixed with the deployment ID to avoid conflicts:

```
Deployment ID: gatsby-site-1772712371
Stack Name: gatsby-site-1772712371-stack
S3 Bucket: gatsby-site-1772712371-bucket
CloudFront Function: gatsby-site-1772712371-url-rewrite
```

#### Example Output

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         Gatsby Site Deployment to AWS                        ║
║         S3 + CloudFront via AWS CDK                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

[INFO] Deployment ID: gatsby-site-1772712371
[INFO] Stack Name: gatsby-site-1772712371-stack
[INFO] Region: us-east-1

═══════════════════════════════════════════════════════════════
  Pre-flight Checks
═══════════════════════════════════════════════════════════════

[SUCCESS] Node.js installed: v20.18.3
[SUCCESS] npm installed: 10.9.2
[SUCCESS] AWS CLI installed: aws-cli/2.19.1
[SUCCESS] AWS CDK installed: 2.240.0
[SUCCESS] AWS credentials configured
[INFO]   Account: 123456789012
[INFO]   Region: us-east-1
[SUCCESS] All pre-flight checks passed!

... (build and deployment steps) ...

═══════════════════════════════════════════════════════════════
  Deployment Outputs
═══════════════════════════════════════════════════════════════

🎉 Deployment Successful!

Your site is now live at:
https://d1234567890abc.cloudfront.net

CloudFront Distribution ID: E1234567890ABC
S3 Bucket: gatsby-site-1772712371-bucket

✓ Deployment completed successfully!
```

#### Troubleshooting

**Error: AWS credentials not configured**
```bash
aws configure
# OR
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

**Error: CDK not installed**
```bash
npm install -g aws-cdk
```

**Error: Build output directory not found**
- Ensure `npm run build` works correctly
- Check that Gatsby outputs to `public/` directory

**Error: Region not bootstrapped**
- The script automatically bootstraps if needed
- Manual bootstrap: `cd infra && cdk bootstrap`

**Error: Insufficient permissions**
- Ensure AWS user has required permissions:
  - CloudFormation (full)
  - S3 (full)
  - CloudFront (full)
  - Lambda (basic)
  - IAM (limited)

#### Manual Deployment (Alternative)

If you prefer manual control:

```bash
# 1. Install dependencies
npm install
cd infra && npm install && cd ..

# 2. Build site
npm run build

# 3. Bootstrap CDK (first time only)
cd infra
cdk bootstrap

# 4. Deploy
cdk deploy
cd ..
```

#### Update Existing Deployment

To update an existing deployment with new content:

```bash
# Quick update (skip deps, just rebuild and deploy)
./scripts/deploy.sh --skip-deps
```

#### Rollback

To rollback to a previous version:

1. View stack history in CloudFormation console
2. Rollback stack to previous version
3. Or redeploy previous code version

#### Clean Up

To remove all AWS resources:

```bash
cd infra
cdk destroy
```

⚠️ **Warning:** This will delete the S3 bucket and all content!

#### Security Notes

- S3 bucket is private (no public access)
- Content served only via CloudFront
- HTTPS enforced (redirects HTTP)
- TLS 1.2+ minimum
- Origin Access Identity (OAI) for S3 access

#### Cost Estimate

Approximate monthly costs (varies by traffic):

- **S3 Storage**: $0.023 per GB (~$0.50 for 20GB site)
- **CloudFront**: $0.085 per GB transfer (~$8.50 for 100GB/month)
- **Lambda** (deployment): Negligible (only runs during deploy)
- **CloudFormation**: Free

**Estimated monthly cost:** $1-20 depending on traffic

#### Support

For issues or questions:
- Check CloudFormation events in AWS Console
- Review CDK output logs
- Verify AWS credentials and permissions
- Ensure all prerequisites are installed

#### Version Information

- **Deployment ID**: gatsby-site-1772712371
- **Script Version**: 1.0.0
- **CDK Version**: 2.240.0
- **Framework**: Gatsby
- **Target Services**: S3 + CloudFront
