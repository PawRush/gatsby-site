#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Build and deploy gatsby-site-1772804382 to AWS (S3 + CloudFront)
# Deployment ID: gatsby-site-1772804382
# =============================================================================
set -euo pipefail

# --------------------------------------------------------------------------- #
# Configuration                                                                #
# --------------------------------------------------------------------------- #
DEPLOYMENT_ID="gatsby-site-1772804382"
STACK_NAME="gatsby-site-1772804382"
BUILD_DIR="public"
INFRA_DIR="infra"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Colours for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Colour

log()    { echo -e "${BLUE}[deploy]${NC} $*"; }
success(){ echo -e "${GREEN}[✔]${NC} $*"; }
warn()   { echo -e "${YELLOW}[warn]${NC} $*"; }
error()  { echo -e "${RED}[✖]${NC} $*" >&2; }

# --------------------------------------------------------------------------- #
# Step 0 — Preflight checks                                                    #
# --------------------------------------------------------------------------- #
log "=== Step 0: Preflight checks ==="

command -v node   >/dev/null 2>&1 || { error "node is not installed"; exit 1; }
command -v npm    >/dev/null 2>&1 || { error "npm is not installed";  exit 1; }
command -v aws    >/dev/null 2>&1 || { error "AWS CLI is not installed"; exit 1; }
command -v npx    >/dev/null 2>&1 || { error "npx is not installed";  exit 1; }

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_DEFAULT_REGION:-${CDK_DEFAULT_REGION:-us-east-1}}

success "Node  : $(node --version)"
success "npm   : $(npm --version)"
success "AWS   : $(aws --version 2>&1 | head -1)"
success "Account: ${AWS_ACCOUNT}"
success "Region : ${AWS_REGION}"

# --------------------------------------------------------------------------- #
# Step 1 — Install site dependencies                                           #
# --------------------------------------------------------------------------- #
log "=== Step 1: Install site dependencies ==="
cd "${REPO_ROOT}"
npm ci --prefer-offline
success "Site dependencies installed"

# --------------------------------------------------------------------------- #
# Step 2 — Build the Gatsby site                                               #
# --------------------------------------------------------------------------- #
log "=== Step 2: Build Gatsby site ==="
cd "${REPO_ROOT}"
npm run build
success "Gatsby build complete → ${BUILD_DIR}/"

# --------------------------------------------------------------------------- #
# Step 3 — Install CDK infrastructure dependencies                             #
# --------------------------------------------------------------------------- #
log "=== Step 3: Install CDK infra dependencies ==="
cd "${REPO_ROOT}/${INFRA_DIR}"
npm ci --prefer-offline
success "CDK dependencies installed"

# --------------------------------------------------------------------------- #
# Step 4 — CDK Bootstrap (idempotent — safe to run every time)                #
# --------------------------------------------------------------------------- #
log "=== Step 4: CDK Bootstrap (account: ${AWS_ACCOUNT}, region: ${AWS_REGION}) ==="
cd "${REPO_ROOT}/${INFRA_DIR}"
npx cdk bootstrap \
  "aws://${AWS_ACCOUNT}/${AWS_REGION}" \
  --toolkit-stack-name "CDKToolkit-${DEPLOYMENT_ID}" \
  --cloudformation-execution-policies "arn:aws:iam::aws:policy/AdministratorAccess"
success "CDK bootstrap complete"

# --------------------------------------------------------------------------- #
# Step 5 — CDK Deploy (infrastructure: S3 + CloudFront)                       #
# --------------------------------------------------------------------------- #
log "=== Step 5: CDK Deploy stack ${STACK_NAME} ==="
cd "${REPO_ROOT}/${INFRA_DIR}"
npx cdk deploy "${STACK_NAME}" \
  --require-approval never \
  --outputs-file "${REPO_ROOT}/cdk-outputs.json"
success "CDK stack deployed"

# --------------------------------------------------------------------------- #
# Step 6 — Read CDK outputs                                                    #
# --------------------------------------------------------------------------- #
log "=== Step 6: Read CDK outputs ==="
OUTPUTS_FILE="${REPO_ROOT}/cdk-outputs.json"

if [[ ! -f "${OUTPUTS_FILE}" ]]; then
  error "CDK outputs file not found: ${OUTPUTS_FILE}"
  exit 1
fi

BUCKET_NAME=$(jq -r ".\"${STACK_NAME}\".BucketName" "${OUTPUTS_FILE}")
DISTRIBUTION_ID=$(jq -r ".\"${STACK_NAME}\".DistributionId" "${OUTPUTS_FILE}")
DISTRIBUTION_URL=$(jq -r ".\"${STACK_NAME}\".DistributionDomainName" "${OUTPUTS_FILE}")

if [[ -z "${BUCKET_NAME}" || "${BUCKET_NAME}" == "null" ]]; then
  error "Could not read BucketName from CDK outputs"
  exit 1
fi

success "Bucket          : ${BUCKET_NAME}"
success "Distribution ID : ${DISTRIBUTION_ID}"
success "Site URL        : ${DISTRIBUTION_URL}"

# --------------------------------------------------------------------------- #
# Step 7 — Sync build output to S3                                             #
# --------------------------------------------------------------------------- #
log "=== Step 7: Sync ${BUILD_DIR}/ → s3://${BUCKET_NAME} ==="
cd "${REPO_ROOT}"

# Upload hashed assets (JS/CSS chunks) with long-lived cache
aws s3 sync "${BUILD_DIR}/" "s3://${BUCKET_NAME}/" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html" \
  --exclude "*.xml" \
  --exclude "*.txt" \
  --exclude "page-data/*" \
  --exclude "*.json"

# Upload HTML, XML, JSON, and page-data with no-cache (always revalidate)
aws s3 sync "${BUILD_DIR}/" "s3://${BUCKET_NAME}/" \
  --delete \
  --cache-control "public,max-age=0,must-revalidate" \
  --include "*.html" \
  --include "*.xml" \
  --include "*.txt" \
  --include "page-data/*" \
  --include "*.json"

success "S3 sync complete"

# --------------------------------------------------------------------------- #
# Step 8 — Invalidate CloudFront cache                                         #
# --------------------------------------------------------------------------- #
log "=== Step 8: Invalidate CloudFront distribution ${DISTRIBUTION_ID} ==="
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)
success "Invalidation created: ${INVALIDATION_ID}"

# --------------------------------------------------------------------------- #
# Done                                                                         #
# --------------------------------------------------------------------------- #
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  Deployment complete!${NC}"
echo -e "${GREEN}  Deployment ID : ${DEPLOYMENT_ID}${NC}"
echo -e "${GREEN}  S3 Bucket     : ${BUCKET_NAME}${NC}"
echo -e "${GREEN}  Distribution  : ${DISTRIBUTION_ID}${NC}"
echo -e "${GREEN}  Site URL      : ${DISTRIBUTION_URL}${NC}"
echo -e "${GREEN}============================================================${NC}"
