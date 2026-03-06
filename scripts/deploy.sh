#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Build and deploy gatsby-site-1772785016 to AWS (S3 + CloudFront)
# =============================================================================
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
DEPLOYMENT_ID="gatsby-site-1772785016"
FRAMEWORK="gatsby"
BUILD_COMMAND="npm run build"
OUTPUT_DIR="public"
INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/infra"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CDK_STACK_NAME="FrontendStack-${DEPLOYMENT_ID}"

# Colours
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

log()    { echo -e "${CYAN}[deploy]${NC} $*"; }
ok()     { echo -e "${GREEN}[  ok  ]${NC} $*"; }
warn()   { echo -e "${YELLOW}[ warn ]${NC} $*"; }
err()    { echo -e "${RED}[error ]${NC} $*" >&2; exit 1; }

# ── 1. Pre-flight checks ──────────────────────────────────────────────────────
log "=== Pre-flight checks ==="

command -v node  >/dev/null 2>&1 || err "node is not installed"
command -v npm   >/dev/null 2>&1 || err "npm is not installed"
command -v aws   >/dev/null 2>&1 || err "aws CLI is not installed"
command -v cdk   >/dev/null 2>&1 || err "aws-cdk is not installed (run: npm install -g aws-cdk)"

ok "node  $(node --version)"
ok "npm   $(npm --version)"
ok "aws   $(aws --version 2>&1 | head -1)"
ok "cdk   $(cdk --version)"

# Verify AWS credentials
aws sts get-caller-identity --query 'Arn' --output text >/dev/null 2>&1 \
  || err "AWS credentials not configured. Run 'aws configure' or set AWS_* env vars."

AWS_ACCOUNT=$(aws sts get-caller-identity --query 'Account' --output text)
AWS_REGION=${AWS_DEFAULT_REGION:-${CDK_DEFAULT_REGION:-us-east-1}}
ok "AWS account: ${AWS_ACCOUNT}, region: ${AWS_REGION}"

# ── 2. Install site dependencies ──────────────────────────────────────────────
log "=== Installing site dependencies ==="
cd "${REPO_ROOT}"
npm ci --prefer-offline 2>&1 | tail -5
ok "Site dependencies installed"

# ── 3. Build the Gatsby site ──────────────────────────────────────────────────
log "=== Building ${FRAMEWORK} site ==="
cd "${REPO_ROOT}"
${BUILD_COMMAND}
ok "Build complete — output in ${OUTPUT_DIR}/"

[ -d "${REPO_ROOT}/${OUTPUT_DIR}" ] \
  || err "Build output directory '${OUTPUT_DIR}' not found after build"

# ── 4. Install CDK dependencies ───────────────────────────────────────────────
log "=== Installing CDK dependencies ==="
cd "${INFRA_DIR}"
npm ci --prefer-offline 2>&1 | tail -5
ok "CDK dependencies installed"

# ── 5. CDK Bootstrap ─────────────────────────────────────────────────────────
log "=== CDK Bootstrap (aws://${AWS_ACCOUNT}/${AWS_REGION}) ==="
cd "${INFRA_DIR}"
cdk bootstrap "aws://${AWS_ACCOUNT}/${AWS_REGION}" \
  --toolkit-stack-name "CDKToolkit" \
  --tags "DeploymentId=${DEPLOYMENT_ID}" \
  --tags "Framework=${FRAMEWORK}" \
  --tags "ManagedBy=cdk"
ok "CDK bootstrap complete"

# ── 6. CDK Deploy (provision S3 + CloudFront) ─────────────────────────────────
log "=== CDK Deploy — stack: ${CDK_STACK_NAME} ==="
cd "${INFRA_DIR}"
cdk deploy "${CDK_STACK_NAME}" \
  --require-approval never \
  --outputs-file "${REPO_ROOT}/cdk-outputs.json" \
  --tags "DeploymentId=${DEPLOYMENT_ID}" \
  --tags "Framework=${FRAMEWORK}" \
  --tags "ManagedBy=cdk"
ok "CDK deploy complete"

# ── 7. Read CDK outputs ───────────────────────────────────────────────────────
log "=== Reading CDK outputs ==="
OUTPUTS_FILE="${REPO_ROOT}/cdk-outputs.json"
[ -f "${OUTPUTS_FILE}" ] || err "cdk-outputs.json not found at ${OUTPUTS_FILE}"

BUCKET_NAME=$(jq -r ".\"${CDK_STACK_NAME}\".BucketName"           "${OUTPUTS_FILE}")
DISTRIBUTION_ID=$(jq -r ".\"${CDK_STACK_NAME}\".DistributionId"   "${OUTPUTS_FILE}")
SITE_URL=$(jq -r ".\"${CDK_STACK_NAME}\".SiteUrl"                 "${OUTPUTS_FILE}")

[ "${BUCKET_NAME}"     != "null" ] || err "BucketName not found in CDK outputs"
[ "${DISTRIBUTION_ID}" != "null" ] || err "DistributionId not found in CDK outputs"
[ "${SITE_URL}"        != "null" ] || err "SiteUrl not found in CDK outputs"

ok "S3 bucket:        ${BUCKET_NAME}"
ok "Distribution ID:  ${DISTRIBUTION_ID}"
ok "Site URL:         ${SITE_URL}"

# ── 8. Sync build output to S3 ────────────────────────────────────────────────
log "=== Syncing ${OUTPUT_DIR}/ to s3://${BUCKET_NAME} ==="
cd "${REPO_ROOT}"

# Long-lived assets (hashed filenames) — 1 year cache
aws s3 sync "${OUTPUT_DIR}/" "s3://${BUCKET_NAME}/" \
  --delete \
  --exclude "*" \
  --include "*.js" \
  --include "*.css" \
  --include "*.woff" \
  --include "*.woff2" \
  --include "*.ttf" \
  --include "*.eot" \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE

# HTML and page-data — no cache (always fresh)
aws s3 sync "${OUTPUT_DIR}/" "s3://${BUCKET_NAME}/" \
  --delete \
  --exclude "*" \
  --include "*.html" \
  --include "*.json" \
  --include "page-data/*" \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type-based-cache \
  --metadata-directive REPLACE 2>/dev/null || \
aws s3 sync "${OUTPUT_DIR}/" "s3://${BUCKET_NAME}/" \
  --delete \
  --exclude "*" \
  --include "*.html" \
  --include "*.json" \
  --cache-control "public, max-age=0, must-revalidate" \
  --metadata-directive REPLACE

# Everything else (images, fonts not already uploaded, etc.)
aws s3 sync "${OUTPUT_DIR}/" "s3://${BUCKET_NAME}/" \
  --delete \
  --cache-control "public, max-age=86400"

ok "S3 sync complete"

# ── 9. Invalidate CloudFront cache ────────────────────────────────────────────
log "=== Invalidating CloudFront distribution ${DISTRIBUTION_ID} ==="
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)
ok "Invalidation created: ${INVALIDATION_ID}"

log "Waiting for invalidation to complete (this may take ~30–60 s)..."
aws cloudfront wait invalidation-completed \
  --distribution-id "${DISTRIBUTION_ID}" \
  --id "${INVALIDATION_ID}"
ok "CloudFront cache invalidated"

# ── 10. Summary ───────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  Deployment complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "  Deployment ID : ${DEPLOYMENT_ID}"
echo -e "  Framework     : ${FRAMEWORK}"
echo -e "  S3 Bucket     : ${BUCKET_NAME}"
echo -e "  Distribution  : ${DISTRIBUTION_ID}"
echo -e "  Site URL      : ${SITE_URL}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
