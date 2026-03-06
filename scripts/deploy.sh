#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Build and deploy gatsby-site-1772791448 to AWS (S3 + CloudFront)
# =============================================================================
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
DEPLOYMENT_ID="gatsby-site-1772791448"
STACK_NAME="gatsby-site-1772791448"
S3_BUCKET="gatsby-site-1772791448"
BUILD_DIR="public"
INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/infra"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Colour

log()    { echo -e "${CYAN}[deploy]${NC} $*"; }
success(){ echo -e "${GREEN}[✔]${NC} $*"; }
warn()   { echo -e "${YELLOW}[warn]${NC} $*"; }
error()  { echo -e "${RED}[✖]${NC} $*" >&2; exit 1; }

# ── Step 0: Pre-flight checks ─────────────────────────────────────────────────
log "Pre-flight checks..."

command -v node  >/dev/null 2>&1 || error "node is not installed"
command -v npm   >/dev/null 2>&1 || error "npm is not installed"
command -v aws   >/dev/null 2>&1 || error "AWS CLI is not installed"
command -v npx   >/dev/null 2>&1 || error "npx is not installed"

# Verify AWS credentials are configured
aws sts get-caller-identity --region "$REGION" >/dev/null 2>&1 \
  || error "AWS credentials not configured or invalid. Run 'aws configure' first."

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
success "AWS credentials OK — Account: ${ACCOUNT_ID}, Region: ${REGION}"

# ── Step 1: Install site dependencies ─────────────────────────────────────────
log "Step 1/5 — Installing site dependencies..."
cd "$REPO_DIR"
npm install --prefer-offline
success "Site dependencies installed."

# ── Step 2: Build Gatsby site ─────────────────────────────────────────────────
log "Step 2/5 — Building Gatsby site (gatsby build)..."
npm run build
success "Gatsby build complete → ./${BUILD_DIR}/"

# Sanity check: ensure build output exists
[[ -d "${REPO_DIR}/${BUILD_DIR}" ]] \
  || error "Build output directory '${BUILD_DIR}/' not found after build."

# ── Step 3: Install CDK dependencies & compile ────────────────────────────────
log "Step 3/5 — Preparing CDK infrastructure..."
cd "$INFRA_DIR"
npm install --prefer-offline
npm run build   # tsc compile
success "CDK infrastructure compiled."

# ── Step 4: CDK Bootstrap ─────────────────────────────────────────────────────
log "Step 4/5 — Bootstrapping CDK environment (account: ${ACCOUNT_ID}, region: ${REGION})..."
npx cdk bootstrap \
  "aws://${ACCOUNT_ID}/${REGION}" \
  --toolkit-stack-name "CDKToolkit" \
  --cloudformation-execution-policies "arn:aws:iam::aws:policy/AdministratorAccess"
success "CDK bootstrap complete."

# ── Step 5: CDK Deploy ────────────────────────────────────────────────────────
log "Step 5/5 — Deploying CDK stack '${STACK_NAME}'..."
cd "$INFRA_DIR"
npx cdk deploy "$STACK_NAME" \
  --require-approval never \
  --outputs-file "${REPO_DIR}/cdk-outputs.json"
success "CDK stack deployed."

# ── Step 6: Sync build output to S3 ──────────────────────────────────────────
log "Step 6/6 — Syncing build output to s3://${S3_BUCKET}..."
cd "$REPO_DIR"

# Sync immutable hashed assets with long cache TTL
aws s3 sync "${BUILD_DIR}/" "s3://${S3_BUCKET}/" \
  --region "$REGION" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.txt" \
  --exclude "*.xml" \
  --exclude "*.json"

# Sync HTML, txt, xml, json with no-cache (always revalidate)
aws s3 sync "${BUILD_DIR}/" "s3://${S3_BUCKET}/" \
  --region "$REGION" \
  --cache-control "public, max-age=0, must-revalidate" \
  --include "*.html" \
  --include "*.txt" \
  --include "*.xml" \
  --include "*.json"

success "Build assets synced to S3."

# ── Step 7: Invalidate CloudFront cache ───────────────────────────────────────
log "Step 7 — Invalidating CloudFront cache..."

if [[ -f "${REPO_DIR}/cdk-outputs.json" ]]; then
  DISTRIBUTION_ID=$(python3 -c "
import json, sys
data = json.load(open('${REPO_DIR}/cdk-outputs.json'))
stack = data.get('${STACK_NAME}', {})
for k, v in stack.items():
    if 'DistributionId' in k:
        print(v)
        sys.exit(0)
" 2>/dev/null || echo "")

  if [[ -n "$DISTRIBUTION_ID" ]]; then
    aws cloudfront create-invalidation \
      --distribution-id "$DISTRIBUTION_ID" \
      --paths "/*"
    success "CloudFront invalidation created for distribution: ${DISTRIBUTION_ID}"
  else
    warn "Could not extract DistributionId from cdk-outputs.json — skipping invalidation."
  fi
else
  warn "cdk-outputs.json not found — skipping CloudFront invalidation."
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  Deployment complete! — ${DEPLOYMENT_ID}${NC}"
echo -e "${GREEN}============================================================${NC}"

if [[ -f "${REPO_DIR}/cdk-outputs.json" ]]; then
  DIST_URL=$(python3 -c "
import json
data = json.load(open('${REPO_DIR}/cdk-outputs.json'))
stack = data.get('${STACK_NAME}', {})
for k, v in stack.items():
    if 'DistributionUrl' in k:
        print(v)
" 2>/dev/null || echo "")
  if [[ -n "$DIST_URL" ]]; then
    echo -e "  ${CYAN}Site URL:${NC} ${DIST_URL}"
  fi
fi
echo ""
