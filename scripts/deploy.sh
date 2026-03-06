#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Full deployment pipeline for Gatsby site to AWS S3 + CloudFront
# Deployment ID: gatsby-site-1772795009
# =============================================================================
set -euo pipefail

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
DEPLOYMENT_ID="gatsby-site-1772795009"
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT="${AWS_ACCOUNT:-002255676568}"
STACK_NAME="${DEPLOYMENT_ID}"
BUILD_OUTPUT_DIR="public"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INFRA_DIR="${REPO_ROOT}/infra"

# Colours for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Colour

log()    { echo -e "${BLUE}[deploy]${NC} $*"; }
success(){ echo -e "${GREEN}[✔]${NC} $*"; }
warn()   { echo -e "${YELLOW}[warn]${NC} $*"; }
error()  { echo -e "${RED}[✘]${NC} $*" >&2; exit 1; }

# -----------------------------------------------------------------------------
# 0. Pre-flight checks
# -----------------------------------------------------------------------------
log "Running pre-flight checks..."

command -v node  >/dev/null 2>&1 || error "node is not installed"
command -v npm   >/dev/null 2>&1 || error "npm is not installed"
command -v aws   >/dev/null 2>&1 || error "AWS CLI is not installed"
command -v npx   >/dev/null 2>&1 || error "npx is not installed"

# Verify AWS credentials are configured and active
aws sts get-caller-identity --region "${AWS_REGION}" >/dev/null 2>&1 \
  || error "AWS credentials are not configured or have expired. Run 'aws configure' or refresh your session."

CALLER_IDENTITY=$(aws sts get-caller-identity --region "${AWS_REGION}" --output json)
log "AWS identity: $(echo "${CALLER_IDENTITY}" | grep -o '"Arn": "[^"]*"' | head -1)"

success "Pre-flight checks passed"

# -----------------------------------------------------------------------------
# 1. Install Gatsby site dependencies
# -----------------------------------------------------------------------------
log "Installing Gatsby site dependencies..."
cd "${REPO_ROOT}"
npm ci --prefer-offline 2>&1 | tail -5
success "Site dependencies installed"

# -----------------------------------------------------------------------------
# 2. Build Gatsby site
# -----------------------------------------------------------------------------
log "Building Gatsby site (npm run build)..."
cd "${REPO_ROOT}"

# Clean previous build artifacts (prebuild script handles this, but be explicit)
rm -rf public/ .cache/

npm run build
success "Gatsby build complete — output in ${BUILD_OUTPUT_DIR}/"

# Verify build output exists and is non-empty
[[ -d "${REPO_ROOT}/${BUILD_OUTPUT_DIR}" ]] \
  || error "Build output directory '${BUILD_OUTPUT_DIR}/' not found after build"
[[ -f "${REPO_ROOT}/${BUILD_OUTPUT_DIR}/index.html" ]] \
  || error "index.html not found in '${BUILD_OUTPUT_DIR}/' — build may have failed"

BUILD_FILE_COUNT=$(find "${REPO_ROOT}/${BUILD_OUTPUT_DIR}" -type f | wc -l | tr -d ' ')
log "Build produced ${BUILD_FILE_COUNT} files in ${BUILD_OUTPUT_DIR}/"

# -----------------------------------------------------------------------------
# 3. Install CDK infrastructure dependencies
# -----------------------------------------------------------------------------
log "Installing CDK infrastructure dependencies..."
cd "${INFRA_DIR}"
npm ci --prefer-offline 2>&1 | tail -5
success "CDK dependencies installed"

# -----------------------------------------------------------------------------
# 4. Compile TypeScript CDK stack
# -----------------------------------------------------------------------------
log "Compiling CDK TypeScript stack..."
cd "${INFRA_DIR}"
npx tsc --noEmit
success "TypeScript compilation passed"

# -----------------------------------------------------------------------------
# 5. CDK Bootstrap
# -----------------------------------------------------------------------------
log "Bootstrapping CDK environment: aws://${AWS_ACCOUNT}/${AWS_REGION}..."
cd "${INFRA_DIR}"
npx cdk bootstrap "aws://${AWS_ACCOUNT}/${AWS_REGION}" \
  --toolkit-stack-name CDKToolkit \
  --tags DeploymentId="${DEPLOYMENT_ID}" \
  --tags ManagedBy=cdk
success "CDK bootstrap complete"

# -----------------------------------------------------------------------------
# 6. CDK Synth (validate CloudFormation template)
# -----------------------------------------------------------------------------
log "Synthesizing CloudFormation template (cdk synth)..."
cd "${INFRA_DIR}"
npx cdk synth "${STACK_NAME}" --quiet
success "CDK synth passed — CloudFormation template is valid"

# -----------------------------------------------------------------------------
# 7. CDK Deploy (provision S3 + CloudFront)
# -----------------------------------------------------------------------------
log "Deploying CDK stack '${STACK_NAME}' to ${AWS_ACCOUNT}/${AWS_REGION}..."
cd "${INFRA_DIR}"
npx cdk deploy "${STACK_NAME}" \
  --require-approval never \
  --outputs-file "${REPO_ROOT}/cdk-outputs.json"

success "CDK stack deployed"

# -----------------------------------------------------------------------------
# 8. Parse CDK outputs
# -----------------------------------------------------------------------------
log "Parsing CDK outputs from cdk-outputs.json..."

OUTPUTS_FILE="${REPO_ROOT}/cdk-outputs.json"
[[ -f "${OUTPUTS_FILE}" ]] || error "cdk-outputs.json not found — deploy may have failed"

BUCKET_NAME=$(node -e "
  const o = require('${OUTPUTS_FILE}');
  const stack = o['${STACK_NAME}'];
  const key = Object.keys(stack).find(k => k.toLowerCase().includes('bucketname') || k === 'BucketName');
  console.log(stack[key]);
")

DISTRIBUTION_ID=$(node -e "
  const o = require('${OUTPUTS_FILE}');
  const stack = o['${STACK_NAME}'];
  const key = Object.keys(stack).find(k => k.toLowerCase().includes('distributionid') && !k.toLowerCase().includes('domain'));
  console.log(stack[key]);
")

CLOUDFRONT_URL=$(node -e "
  const o = require('${OUTPUTS_FILE}');
  const stack = o['${STACK_NAME}'];
  const key = Object.keys(stack).find(k => k.toLowerCase().includes('domain') || k.toLowerCase().includes('url'));
  console.log(stack[key]);
")

log "S3 Bucket:          ${BUCKET_NAME}"
log "Distribution ID:    ${DISTRIBUTION_ID}"
log "CloudFront URL:     ${CLOUDFRONT_URL}"

# -----------------------------------------------------------------------------
# 9. Sync build output to S3
# -----------------------------------------------------------------------------
log "Syncing '${BUILD_OUTPUT_DIR}/' to s3://${BUCKET_NAME}..."
cd "${REPO_ROOT}"

aws s3 sync "${BUILD_OUTPUT_DIR}/" "s3://${BUCKET_NAME}/" \
  --delete \
  --region "${AWS_REGION}" \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "page-data/*" \
  --exclude "sw.js" \
  --exclude "app-*.json"

# HTML files and page-data should revalidate more frequently
aws s3 sync "${BUILD_OUTPUT_DIR}/" "s3://${BUCKET_NAME}/" \
  --delete \
  --region "${AWS_REGION}" \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html" \
  --include "page-data/*" \
  --include "sw.js" \
  --include "app-*.json"

SYNCED_COUNT=$(aws s3 ls "s3://${BUCKET_NAME}/" --recursive --region "${AWS_REGION}" | wc -l | tr -d ' ')
log "S3 bucket now contains ${SYNCED_COUNT} objects"
success "S3 sync complete"

# -----------------------------------------------------------------------------
# 10. Invalidate CloudFront cache
# -----------------------------------------------------------------------------
log "Creating CloudFront invalidation for distribution ${DISTRIBUTION_ID}..."

INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

success "CloudFront invalidation created: ${INVALIDATION_ID}"
log "Waiting for invalidation to complete (this may take 1-2 minutes)..."

aws cloudfront wait invalidation-completed \
  --distribution-id "${DISTRIBUTION_ID}" \
  --id "${INVALIDATION_ID}"

success "CloudFront cache invalidated"

# -----------------------------------------------------------------------------
# Done!
# -----------------------------------------------------------------------------
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  🚀 Deployment complete!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo -e "  Deployment ID : ${DEPLOYMENT_ID}"
echo -e "  S3 Bucket     : ${BUCKET_NAME}"
echo -e "  Distribution  : ${DISTRIBUTION_ID}"
echo -e "  Site URL      : ${CLOUDFRONT_URL}"
echo -e "${GREEN}============================================================${NC}"
echo ""
