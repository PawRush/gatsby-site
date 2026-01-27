---
sop_name: deploy-frontend-app
repo_name: gatsby-site
app_name: GatsbySite
app_type: Frontend Application (Gatsby Static Site)
branch: deploy-to-aws
created: 2026-01-27T11:33:00Z
last_updated: 2026-01-27T11:49:00Z
---

# Deployment Summary

Your app is deployed to AWS with automated CI/CD!

**Production URL:** Will be available once pipeline completes (first deployment in progress)

**Preview URL:** https://d1bjsy0hdu82pb.cloudfront.net (manual deployment)

**Pipeline:** https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/GatsbySitePipeline/view

**Deployment Method:** Push to `deploy-to-aws` branch triggers automatic deployment

Services used: CodePipeline, CodeBuild, CodeConnections, CloudFront, S3, CloudFormation, IAM

Questions? Ask your Coding Agent:
- What resources were deployed to AWS?
- How do I update my deployment?

## Quick Commands

```bash
# Check pipeline status
aws codepipeline get-pipeline-state --name "GatsbySitePipeline" --query 'stageStates[*].{Stage:stageName,Status:latestExecution.status}' --output table

# View build logs
aws logs tail "/aws/codebuild/GatsbySitePipeline-selfupdate" --follow

# Trigger pipeline manually
aws codepipeline start-pipeline-execution --name "GatsbySitePipeline"

# View production stack status
aws cloudformation describe-stacks --stack-name "GatsbySiteFrontend-prod" --query 'Stacks[0].StackStatus' --output text

# Deploy to production (automatic via pipeline)
git push origin deploy-to-aws

# Manual preview deployment (bypasses pipeline)
./scripts/deploy.sh
```

## Production Readiness

For production deployments, consider:
- WAF Protection: Add AWS WAF with managed rules (Core Rule Set, Known Bad Inputs) and rate limiting
- CSP Headers: Configure Content Security Policy in CloudFront response headers (`script-src 'self'`, `frame-ancestors 'none'`)
- Custom Domain: Set up Route 53 and ACM certificate
- Monitoring: CloudWatch alarms for 4xx/5xx errors and CloudFront metrics
- Auth Redirect URLs: If using an auth provider (Auth0, Supabase, Firebase, Lovable, etc.), add your CloudFront URL to allowed redirect URLs

---

# Deployment Plan: GatsbySite

Coding Agents should follow this Deployment Plan, and validate previous progress if picking up the Deployment in a new coding session.

**IMPORTANT**: Update this plan after EACH step completes. Mark the step `[x]` and update `last_updated` timestamp.

## Build Configuration

- Framework: Gatsby v4.25.0 (Static Site Generator)
- Package manager: npm
- Build command: `npm run build`
- Output directory: `public/`
- Base path: `/` (root deployment)
- Entry point: `index.html`
- Trailing slash: defaults to `always` (Gatsby default)
- CloudFront config: URL rewrite function (rewrites /path to /path/index.html)
- Lint command: None

## Phase 1: Gather Context and Configure
- [x] Step 0: Inform User of Execution Flow
- [x] Step 1: Create Deployment Plan
- [x] Step 2: Create Deploy Branch
- [x] Step 3: Detect Build Configuration
- [x] Step 4: Validate Prerequisites
- [x] Step 5: Revisit Deployment Plan

## Phase 2: Build CDK Infrastructure
- [x] Step 6: Initialize CDK Foundation
- [x] Step 7: Generate CDK Stack
- [x] Step 8: Create Deployment Script
- [x] Step 9: Validate CDK Synth

## Phase 3: Deploy and Validate
- [x] Step 10: Execute CDK Deployment
- [x] Step 11: Validate CloudFormation Stack

## Phase 4: Update Documentation
- [x] Step 12: Finalize Deployment Plan
- [x] Step 13: Update README.md

## Deployment Info

- Deployment URL: https://d1bjsy0hdu82pb.cloudfront.net
- Stack name: GatsbySiteFrontend-preview-sergeyka
- Distribution ID: E3MOOA81CTWZZG
- Distribution Domain: d1bjsy0hdu82pb.cloudfront.net
- S3 Bucket: gatsbysitefrontend-preview--cftos3s3bucketcae9f2be-lizsgmlm98ch
- CloudFront Log Bucket: gatsbysitefrontend-previe-cftos3cloudfrontloggingb-sexorbwwdych
- S3 Log Bucket: gatsbysitefrontend-previe-cftos3s3loggingbucket64b-kubcrge67qnr
- Deployment Date: 2026-01-27T11:48:14Z

## Recovery Guide

```bash
# Rollback
cd infra && cdk destroy "GatsbySiteFrontend-<environment>"

# Redeploy
./scripts/deploy.sh
```

## Issues Encountered

None.

## Session Log

### Session 1 - 2026-01-27T11:33:00Z
Agent: Claude Sonnet 4.5
Progress: All phases complete - Successfully deployed Gatsby site to AWS CloudFront
Deployment URL: https://d1bjsy0hdu82pb.cloudfront.net
