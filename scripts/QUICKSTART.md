# Quick Start Guide

## Deploy in 3 Steps

### 1. Prerequisites

Ensure you have:
- ✅ AWS CLI configured (`aws configure`)
- ✅ AWS CDK installed (`npm install -g aws-cdk`)
- ✅ Node.js and npm installed

### 2. Run Deployment

```bash
./scripts/deploy.sh
```

### 3. Access Your Site

After deployment completes (~8-15 minutes), your site will be available at the CloudFront URL shown in the output.

---

## Quick Commands

**Deploy with default settings:**
```bash
./scripts/deploy.sh
```

**Deploy without confirmation (CI/CD):**
```bash
./scripts/deploy.sh --skip-confirmation
```

**Custom deployment ID:**
```bash
DEPLOYMENT_ID=my-site-v2 ./scripts/deploy.sh
```

**Different AWS region:**
```bash
AWS_REGION=eu-west-1 ./scripts/deploy.sh
```

---

## What the Script Does

1. ✅ Checks prerequisites (AWS CLI, CDK, Node.js)
2. ✅ Installs dependencies
3. ✅ Builds Gatsby site (`npm run build`)
4. ✅ Compiles CDK infrastructure
5. ✅ Bootstraps CDK (first time only)
6. ✅ Deploys to AWS (S3 + CloudFront)
7. ✅ Shows your site URL

---

## Default Configuration

- **Deployment ID**: `gatsby-site-1772715714`
- **Stack Name**: `gatsby-site-1772715714-stack`
- **Region**: `us-east-1`
- **Build Output**: `public/`

---

## Troubleshooting

**Permission denied:**
```bash
chmod +x scripts/deploy.sh
```

**AWS credentials error:**
```bash
aws configure
```

**CDK not found:**
```bash
npm install -g aws-cdk
```

---

## Get Help

```bash
./scripts/deploy.sh --help
```

For detailed documentation, see [scripts/README.md](./README.md)
