# Deployment Scripts

This directory contains deployment automation scripts for the Gatsby frontend application.

## Available Scripts

### `deploy.sh`

Main deployment script that automates the complete deployment process to AWS.

#### Features

- ✅ **Pre-flight Checks**: Verifies all required tools and credentials
- ✅ **Dependency Management**: Installs npm packages for both site and infrastructure
- ✅ **Build Automation**: Builds the Gatsby site
- ✅ **CDK Compilation**: Compiles TypeScript CDK infrastructure
- ✅ **CDK Bootstrap**: Initializes CDK in AWS account (if needed)
- ✅ **Stack Synthesis**: Generates CloudFormation templates
- ✅ **Deployment**: Deploys infrastructure and content to AWS
- ✅ **Output Display**: Shows CloudFront URL and deployment information
- ✅ **Error Handling**: Exits on any error with clear messages
- ✅ **Colorized Output**: Easy-to-read console output

#### Usage

**Basic deployment:**
```bash
./scripts/deploy.sh
```

**Skip confirmation prompts (for CI/CD):**
```bash
./scripts/deploy.sh --skip-confirmation
```

**Custom deployment ID:**
```bash
DEPLOYMENT_ID=my-custom-id ./scripts/deploy.sh
```

**Deploy to specific region:**
```bash
AWS_REGION=eu-west-1 ./scripts/deploy.sh
```

**Combined options:**
```bash
DEPLOYMENT_ID=prod-v2 AWS_REGION=us-west-2 ./scripts/deploy.sh --skip-confirmation
```

#### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEPLOYMENT_ID` | Unique identifier for this deployment | `gatsby-site-1772715714` |
| `AWS_REGION` | AWS region for deployment | `us-east-1` |
| `CDK_QUALIFIER` | CDK bootstrap qualifier | `hnb659fds` |
| `SKIP_CONFIRMATION` | Skip deployment confirmations | (not set) |
| `CI` | CI/CD environment indicator | (not set) |

#### Prerequisites

The script checks for these prerequisites:

1. **Node.js** - JavaScript runtime
2. **npm** - Package manager
3. **AWS CLI** - AWS command-line interface
4. **AWS CDK** - AWS Cloud Development Kit
5. **AWS Credentials** - Configured via `aws configure`
6. **Project Structure** - Valid Gatsby project with CDK infrastructure

#### Deployment Steps

The script executes these steps in order:

1. **Pre-flight Checks** (30s)
   - Verify tool installations
   - Check AWS credentials
   - Validate project structure

2. **Install Dependencies** (1-3 min)
   - Install Gatsby dependencies
   - Install CDK dependencies

3. **Build Gatsby Site** (1-5 min)
   - Clean previous build
   - Run `npm run build`
   - Verify build output

4. **Compile CDK Infrastructure** (10-30s)
   - Compile TypeScript to JavaScript
   - Type checking

5. **Bootstrap CDK** (1-2 min, first time only)
   - Check if already bootstrapped
   - Create CDK toolkit stack if needed

6. **Synthesize Stack** (10-20s)
   - Generate CloudFormation templates
   - Validate stack configuration

7. **Deploy Stack** (5-10 min)
   - Upload assets to S3
   - Deploy CloudFormation stack
   - Create S3 bucket
   - Create CloudFront distribution
   - Upload site files

8. **Get Stack Outputs** (5-10s)
   - Fetch CloudFront URL
   - Display deployment information

**Total Time**: ~8-20 minutes (first deployment)  
**Subsequent Deployments**: ~5-10 minutes

#### Output Example

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║           Gatsby Frontend Deployment to AWS                      ║
║           S3 + CloudFront via AWS CDK                            ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

ℹ Deployment ID: gatsby-site-1772715714
ℹ Stack Name: gatsby-site-1772715714-stack
ℹ Region: us-east-1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Pre-flight Checks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Node.js v18.17.0 is installed
✓ npm 9.6.7 is installed
✓ aws-cli/2.13.0 is installed
✓ AWS credentials configured (Account: 123456789012, User: admin)
✓ AWS CDK 2.100.0 is installed
✓ All pre-flight checks passed!

[... build and deployment output ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Deployment Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Stack Name:       gatsby-site-1772715714-stack
  Region:           us-east-1
  Deployment ID:    gatsby-site-1772715714

  Website URL:      https://d1234567890.cloudfront.net
  S3 Bucket:        gatsby-site-1772715714-bucket
  Distribution ID:  E1234567890ABC

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Error Handling

The script uses `set -e` to exit immediately on any error. Common errors:

- **AWS credentials not configured**: Run `aws configure`
- **CDK not installed**: Run `npm install -g aws-cdk`
- **Build fails**: Check Gatsby configuration and dependencies
- **Deployment fails**: Check AWS permissions and CloudFormation events

#### CI/CD Integration

The script is designed to work in CI/CD environments:

```yaml
# GitHub Actions example
- name: Deploy to AWS
  env:
    DEPLOYMENT_ID: ${{ github.run_id }}
    AWS_REGION: us-east-1
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    CI: true
  run: ./scripts/deploy.sh
```

The `CI` environment variable automatically skips confirmation prompts.

#### Troubleshooting

**Script doesn't execute:**
```bash
chmod +x scripts/deploy.sh
```

**AWS permissions error:**
Ensure your AWS user/role has these permissions:
- CloudFormation: Create/Update stacks
- S3: Create buckets, upload objects
- CloudFront: Create/update distributions
- IAM: Create roles for CloudFront OAI

**Build fails:**
```bash
# Clean and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**CDK bootstrap fails:**
```bash
# Manual bootstrap
cd infra
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

#### Maintenance

To update the deployment script:

1. Edit `scripts/deploy.sh`
2. Test changes locally
3. Commit changes to repository
4. Update this README if behavior changes

#### Resources Created

The script creates/updates these AWS resources:

- **S3 Bucket**: Stores Gatsby static files
- **CloudFront Distribution**: CDN for global content delivery
- **CloudFront OAI**: Secure S3 access
- **CloudFront Function**: URL rewriting for SPA routing
- **CloudFormation Stack**: Infrastructure as code

#### Cost Estimation

Typical monthly costs:

- **S3**: $0.023/GB storage + $0.09/GB transfer
- **CloudFront**: $0.085/GB (first 10TB)
- **Requests**: ~$0.01 per 10,000 requests
- **Total**: ~$5-50/month depending on traffic

Free tier eligible for first 12 months.

#### Security

The deployment follows AWS best practices:

- ✅ S3 bucket not publicly accessible
- ✅ CloudFront OAI for secure access
- ✅ HTTPS enforced
- ✅ No sensitive data in code
- ✅ AWS credentials via IAM

## Additional Scripts

You can add more scripts to this directory:

- `build.sh` - Build only
- `destroy.sh` - Tear down infrastructure
- `validate.sh` - Validate deployment
- `rollback.sh` - Rollback to previous version

## License

See the main project LICENSE file.
