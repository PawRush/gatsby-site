#!/bin/bash
set -e

# Bootstrap CDK with trust for pipeline deploy roles
# Usage: ./scripts/bootstrap-cdk.sh [PIPELINE_STACK_NAME]

PIPELINE_STACK_NAME=${1:-"MarcySuttonPipelineStack"}

echo "================================================"
echo "CDK Bootstrap with Pipeline Trust"
echo "================================================"
echo ""

# Get AWS account and region
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=${AWS_DEFAULT_REGION:-us-east-1}

echo "Target Environment:"
echo "  Account: $ACCOUNT"
echo "  Region:  $REGION"
echo "  Pipeline Stack: $PIPELINE_STACK_NAME"
echo ""

# Check if pipeline stack exists
if ! aws cloudformation describe-stacks --stack-name $PIPELINE_STACK_NAME --region $REGION >/dev/null 2>&1; then
  echo "❌ Error: Pipeline stack '$PIPELINE_STACK_NAME' does not exist"
  echo "   Deploy the pipeline stack first"
  exit 1
fi

# Extract role ARNs from stack outputs
echo "Extracting BuildRole ARN from stack outputs..."
BUILD_ROLE_ARN=$(aws cloudformation describe-stacks \
  --stack-name $PIPELINE_STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`BuildRoleArn`].OutputValue' \
  --output text)

echo "Extracting DeployRole ARN from stack outputs..."
DEPLOY_ROLE_ARN=$(aws cloudformation describe-stacks \
  --stack-name $PIPELINE_STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`DeployRoleArn`].OutputValue' \
  --output text)

# Validate role ARNs were found
if [ -z "$BUILD_ROLE_ARN" ] || [ "$BUILD_ROLE_ARN" = "None" ]; then
  echo "⚠️  Warning: BuildRoleArn not found in stack outputs"
  BUILD_ROLE_ARN=""
fi

if [ -z "$DEPLOY_ROLE_ARN" ] || [ "$DEPLOY_ROLE_ARN" = "None" ]; then
  echo "❌ Error: DeployRoleArn not found in stack outputs"
  exit 1
fi

echo ""
echo "Pipeline Roles:"
if [ -n "$BUILD_ROLE_ARN" ]; then
  echo "  BuildRole:  $BUILD_ROLE_ARN"
fi
echo "  DeployRole: $DEPLOY_ROLE_ARN"
echo ""

# Check if CDK bootstrap already exists
echo "Checking CDK bootstrap status..."
if aws cloudformation describe-stacks --stack-name CDKToolkit --region $REGION >/dev/null 2>&1; then
  echo "✓ CDK bootstrap stack exists"
  echo "  Updating trust policy for pipeline roles..."
else
  echo "ℹ️  CDK bootstrap stack does not exist"
  echo "  Creating new bootstrap with pipeline trust..."
fi

echo ""
echo "Running CDK bootstrap..."
echo ""

# Build trust arguments
TRUST_ARGS="--trust $DEPLOY_ROLE_ARN"
if [ -n "$BUILD_ROLE_ARN" ]; then
  TRUST_ARGS="$TRUST_ARGS --trust $BUILD_ROLE_ARN"
fi

# Execute bootstrap (idempotent - safe to re-run)
npx cdk bootstrap aws://$ACCOUNT/$REGION \
  $TRUST_ARGS \
  --cloudformation-execution-policies "arn:aws:iam::aws:policy/AdministratorAccess" \
  --verbose

echo ""
echo "================================================"
echo "SUCCESS: CDK bootstrap completed successfully"
echo "================================================"
echo ""
echo "The pipeline can now deploy CDK stacks."
echo ""
