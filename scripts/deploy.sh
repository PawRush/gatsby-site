#!/bin/bash

################################################################################
# Gatsby Frontend Deployment Script
################################################################################
# This script automates the complete deployment process:
# 1. Build the Gatsby site
# 2. Bootstrap CDK (if needed)
# 3. Deploy infrastructure to AWS
################################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Deployment configuration
DEPLOYMENT_ID="${DEPLOYMENT_ID:-gatsby-site-1772715714}"
STACK_NAME="${DEPLOYMENT_ID}-stack"
AWS_REGION="${AWS_REGION:-us-east-1}"
CDK_QUALIFIER="${CDK_QUALIFIER:-hnb659fds}"

# Project paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
INFRA_DIR="${PROJECT_ROOT}/infra"
BUILD_DIR="${PROJECT_ROOT}/public"

################################################################################
# Utility Functions
################################################################################

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_step() {
    echo -e "${BLUE}→ $1${NC}"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        return 1
    fi
    return 0
}

################################################################################
# Pre-flight Checks
################################################################################

preflight_checks() {
    print_header "Pre-flight Checks"
    
    local all_checks_passed=true
    
    # Check Node.js
    print_step "Checking Node.js installation..."
    if check_command node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js ${NODE_VERSION} is installed"
    else
        all_checks_passed=false
    fi
    
    # Check npm
    print_step "Checking npm installation..."
    if check_command npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm ${NPM_VERSION} is installed"
    else
        all_checks_passed=false
    fi
    
    # Check AWS CLI
    print_step "Checking AWS CLI installation..."
    if check_command aws; then
        AWS_VERSION=$(aws --version 2>&1 | cut -d' ' -f1)
        print_success "${AWS_VERSION} is installed"
    else
        all_checks_passed=false
    fi
    
    # Check AWS credentials
    print_step "Checking AWS credentials..."
    if aws sts get-caller-identity &> /dev/null; then
        AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
        AWS_USER=$(aws sts get-caller-identity --query Arn --output text 2>/dev/null | cut -d'/' -f2)
        print_success "AWS credentials configured (Account: ${AWS_ACCOUNT}, User: ${AWS_USER})"
    else
        print_error "AWS credentials not configured. Run 'aws configure' first."
        all_checks_passed=false
    fi
    
    # Check CDK
    print_step "Checking AWS CDK installation..."
    if check_command cdk; then
        CDK_VERSION=$(cdk --version 2>&1)
        print_success "AWS CDK ${CDK_VERSION} is installed"
    else
        print_error "AWS CDK not installed. Run 'npm install -g aws-cdk' first."
        all_checks_passed=false
    fi
    
    # Check project structure
    print_step "Checking project structure..."
    if [ -f "${PROJECT_ROOT}/package.json" ]; then
        print_success "Root package.json found"
    else
        print_error "Root package.json not found"
        all_checks_passed=false
    fi
    
    if [ -d "${INFRA_DIR}" ]; then
        print_success "Infrastructure directory found"
    else
        print_error "Infrastructure directory not found"
        all_checks_passed=false
    fi
    
    if [ "$all_checks_passed" = false ]; then
        print_error "Pre-flight checks failed. Please fix the issues above."
        exit 1
    fi
    
    print_success "All pre-flight checks passed!"
}

################################################################################
# Install Dependencies
################################################################################

install_dependencies() {
    print_header "Installing Dependencies"
    
    # Install root dependencies
    print_step "Installing Gatsby site dependencies..."
    cd "${PROJECT_ROOT}"
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    print_success "Gatsby dependencies installed"
    
    # Install CDK dependencies
    print_step "Installing CDK infrastructure dependencies..."
    cd "${INFRA_DIR}"
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    print_success "CDK dependencies installed"
    
    cd "${PROJECT_ROOT}"
}

################################################################################
# Build Gatsby Site
################################################################################

build_gatsby_site() {
    print_header "Building Gatsby Site"
    
    cd "${PROJECT_ROOT}"
    
    print_step "Cleaning previous build..."
    if [ -d "${BUILD_DIR}" ]; then
        rm -rf "${BUILD_DIR}"
        print_success "Previous build cleaned"
    fi
    
    print_step "Running Gatsby build..."
    npm run build
    
    if [ ! -d "${BUILD_DIR}" ]; then
        print_error "Build failed: output directory not found"
        exit 1
    fi
    
    # Verify build output
    FILE_COUNT=$(find "${BUILD_DIR}" -type f | wc -l)
    BUILD_SIZE=$(du -sh "${BUILD_DIR}" | cut -f1)
    
    print_success "Gatsby build completed successfully"
    print_info "Output directory: ${BUILD_DIR}"
    print_info "Files generated: ${FILE_COUNT}"
    print_info "Total size: ${BUILD_SIZE}"
    
    # Check for index.html
    if [ -f "${BUILD_DIR}/index.html" ]; then
        print_success "index.html found"
    else
        print_error "index.html not found in build output"
        exit 1
    fi
}

################################################################################
# Compile CDK Infrastructure
################################################################################

compile_cdk() {
    print_header "Compiling CDK Infrastructure"
    
    cd "${INFRA_DIR}"
    
    print_step "Compiling TypeScript..."
    npm run build
    
    print_success "CDK infrastructure compiled successfully"
}

################################################################################
# Bootstrap CDK
################################################################################

bootstrap_cdk() {
    print_header "CDK Bootstrap Check"
    
    cd "${INFRA_DIR}"
    
    print_step "Checking if CDK is already bootstrapped..."
    
    # Check if bootstrap stack exists
    if aws cloudformation describe-stacks \
        --stack-name "CDKToolkit" \
        --region "${AWS_REGION}" &> /dev/null; then
        print_success "CDK already bootstrapped in ${AWS_REGION}"
        return 0
    fi
    
    print_info "CDK not bootstrapped. Starting bootstrap process..."
    print_step "Bootstrapping CDK in ${AWS_REGION}..."
    
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    
    cdk bootstrap "aws://${AWS_ACCOUNT}/${AWS_REGION}" \
        --region "${AWS_REGION}" \
        --qualifier "${CDK_QUALIFIER}"
    
    print_success "CDK bootstrapped successfully"
}

################################################################################
# Synthesize CDK Stack
################################################################################

synthesize_stack() {
    print_header "Synthesizing CDK Stack"
    
    cd "${INFRA_DIR}"
    
    print_step "Running CDK synth..."
    DEPLOYMENT_ID="${DEPLOYMENT_ID}" cdk synth
    
    print_success "Stack synthesized successfully"
    
    # Show stack info
    if [ -d "cdk.out" ]; then
        print_info "CDK output directory: ${INFRA_DIR}/cdk.out"
    fi
}

################################################################################
# Deploy Stack
################################################################################

deploy_stack() {
    print_header "Deploying Stack to AWS"
    
    cd "${INFRA_DIR}"
    
    print_info "Stack name: ${STACK_NAME}"
    print_info "Region: ${AWS_REGION}"
    print_info "Deployment ID: ${DEPLOYMENT_ID}"
    
    print_step "Deploying CDK stack..."
    
    # Deploy with automatic approval in CI/CD, or require confirmation locally
    if [ -n "${CI}" ] || [ -n "${SKIP_CONFIRMATION}" ]; then
        DEPLOYMENT_ID="${DEPLOYMENT_ID}" cdk deploy \
            --require-approval never \
            --region "${AWS_REGION}"
    else
        DEPLOYMENT_ID="${DEPLOYMENT_ID}" cdk deploy \
            --region "${AWS_REGION}"
    fi
    
    print_success "Stack deployed successfully!"
}

################################################################################
# Get Stack Outputs
################################################################################

get_stack_outputs() {
    print_header "Deployment Complete"
    
    print_step "Fetching stack outputs..."
    
    # Get CloudFront URL
    CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --region "${AWS_REGION}" \
        --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" \
        --output text 2>/dev/null || echo "")
    
    # Get S3 Bucket
    S3_BUCKET=$(aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --region "${AWS_REGION}" \
        --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
        --output text 2>/dev/null || echo "")
    
    # Get CloudFront Distribution ID
    DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --region "${AWS_REGION}" \
        --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
        --output text 2>/dev/null || echo "")
    
    echo ""
    print_success "🎉 Deployment successful!"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  Deployment Information${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${BLUE}Stack Name:${NC}       ${STACK_NAME}"
    echo -e "  ${BLUE}Region:${NC}           ${AWS_REGION}"
    echo -e "  ${BLUE}Deployment ID:${NC}    ${DEPLOYMENT_ID}"
    echo ""
    
    if [ -n "${CLOUDFRONT_URL}" ]; then
        echo -e "  ${BLUE}Website URL:${NC}      ${GREEN}${CLOUDFRONT_URL}${NC}"
    fi
    
    if [ -n "${S3_BUCKET}" ]; then
        echo -e "  ${BLUE}S3 Bucket:${NC}        ${S3_BUCKET}"
    fi
    
    if [ -n "${DISTRIBUTION_ID}" ]; then
        echo -e "  ${BLUE}Distribution ID:${NC}  ${DISTRIBUTION_ID}"
    fi
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -n "${CLOUDFRONT_URL}" ]; then
        print_info "Your site is being deployed and will be available shortly at:"
        echo -e "  ${GREEN}${CLOUDFRONT_URL}${NC}"
        echo ""
        print_info "Note: CloudFront distribution may take 5-15 minutes to fully propagate."
    fi
}

################################################################################
# Cleanup
################################################################################

cleanup() {
    print_header "Cleanup"
    print_step "Returning to project root..."
    cd "${PROJECT_ROOT}"
    print_success "Cleanup complete"
}

################################################################################
# Main Execution
################################################################################

main() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                                                                   ║${NC}"
    echo -e "${BLUE}║           Gatsby Frontend Deployment to AWS                      ║${NC}"
    echo -e "${BLUE}║           S3 + CloudFront via AWS CDK                            ║${NC}"
    echo -e "${BLUE}║                                                                   ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    print_info "Deployment ID: ${DEPLOYMENT_ID}"
    print_info "Stack Name: ${STACK_NAME}"
    print_info "Region: ${AWS_REGION}"
    echo ""
    
    # Trap errors and cleanup
    trap cleanup EXIT
    
    # Execute deployment steps
    preflight_checks
    install_dependencies
    build_gatsby_site
    compile_cdk
    bootstrap_cdk
    synthesize_stack
    deploy_stack
    get_stack_outputs
    
    print_success "All deployment steps completed successfully!"
}

################################################################################
# Script Entry Point
################################################################################

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h              Show this help message"
        echo "  --skip-confirmation     Skip deployment confirmation prompts"
        echo ""
        echo "Environment Variables:"
        echo "  DEPLOYMENT_ID           Deployment identifier (default: gatsby-site-1772715714)"
        echo "  AWS_REGION              AWS region for deployment (default: us-east-1)"
        echo "  CDK_QUALIFIER           CDK bootstrap qualifier (default: hnb659fds)"
        echo "  SKIP_CONFIRMATION       Skip confirmation prompts (any value)"
        echo "  CI                      Set in CI/CD environments (auto-skips confirmations)"
        echo ""
        echo "Examples:"
        echo "  $0                                    # Standard deployment"
        echo "  $0 --skip-confirmation                # Deploy without prompts"
        echo "  DEPLOYMENT_ID=my-app-123 $0           # Custom deployment ID"
        echo "  AWS_REGION=eu-west-1 $0               # Deploy to specific region"
        echo ""
        exit 0
        ;;
    --skip-confirmation)
        SKIP_CONFIRMATION=true
        main
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Run '$0 --help' for usage information"
        exit 1
        ;;
esac
