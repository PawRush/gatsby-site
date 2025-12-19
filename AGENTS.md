# Agent Instructions & Deployment

## Deployment

See `./deployment_plan.md` for current deployment status and instructions.

### Quick Deployment

```bash
# Deploy to your personal environment
./scripts/deploy.sh

# Deploy to other environments
./scripts/deploy.sh dev
./scripts/deploy.sh prod
```

### View Deployment Outputs

```bash
aws cloudformation describe-stacks --stack-name MarcySuttonFrontend-preview-$(whoami) --query 'Stacks[0].Outputs'
```
