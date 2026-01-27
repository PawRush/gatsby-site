# Agent Documentation

This file provides guidance for AI coding agents working on this project.

## Deployment

See `./DEPLOYMENT.md` for deployment status, logs, troubleshooting, pipeline setup, and next steps.

**Automated Deployment:** Push to `deploy-to-aws` branch triggers CodePipeline

**Preview URL:** https://d1bjsy0hdu82pb.cloudfront.net (manual deployment)

**Production URL:** Deployed via pipeline to `GatsbySiteFrontend-prod` stack

**Pipeline:** https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/GatsbySitePipeline/view

**Manual deployment (preview only):** `./scripts/deploy.sh`
