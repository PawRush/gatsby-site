#!/bin/bash

################################################################################
# Deployment Script for Gatsby Site to AWS
################################################################################
#
# This script automates the deployment of a Gatsby site to AWS using:
# - Amazon S3 for static file hosting
# - Amazon CloudFront for global CDN distribution
# - AWS CDK for infrastructure as code
#
# The script performs the following steps:
# 1. Environment validation and prerequisites check
# 2. Gatsby site build
# 3. CDK bootstrap (first-time setup)
# 4. CDK deployment
# 5. Output retrieval and display
#
################################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Deployment configuration
DEPLOYMENT_ID="${DEPLOYMENT_ID:-gatsby-site-1772716889}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INFRA_DIR="${REPO_ROOT}/infra"
BUILD_OUTPUT_DIR="${REPO_ROOT}/public"

################################################################################
# Utility Functions
################################################################################

print_header() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_step() {
    echo -e "${CYAN}➜ $1${NC}"
}

################################################################################
# Prerequisite Checks
################################################################################

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local all_ok=true
    
    # Check Node.js
    print_step "Checking Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed"
        all_ok=false
    fi
    
    # Check npm
    print_step "Checking npm..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm installed: $NPM_VERSION"
    else
        print_error "npm is not installed"
        all_ok=false
    fi
    
    # Check AWS CLI
    print_step "Checking AWS CLI..."
    if command -v aws &> /dev/null; then
        AWS_VERSION=$(aws --version 2>&1 | cut -d' ' -f1)
        print_success "AWS CLI installed: $AWS_VERSION"
    else
        print_error "AWS CLI is not installed"
        print_info "Install from: https://aws.amazon.com/cli/"
        all_ok=false
    fi
    
    # Check AWS credentials
    print_step "Checking AWS credentials..."
    if aws sts get-caller-identity &> /dev/null; then
        AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
        AWS_REGION=$(aws configure get region || echo "us-east-1")
        print_success "AWS credentials configured"
        print_info "Account ID: $AWS_ACCOUNT"
        print_info "Region: $AWS_REGION"
    else
        print_error "AWS credentials are not configured"
        print_info "Run: aws configure"
        all_ok=false
    fi
    
    # Check CDK
    print_step "Checking AWS CDK..."
    if command -v cdk &> /dev/null; then
        CDK_VERSION=$(cdk --version)
        print_success "AWS CDK installed: $CDK_VERSION"
    else
        print_warning "AWS CDK CLI not found globally"
        print_info "Will use npx cdk from infra directory"
    fi
    
    if [ "$all_ok" = false ]; then
        print_error "Prerequisites check failed. Please install missing dependencies."
        exit 1
    fi
    
    print_success "All prerequisites satisfied"
}

################################################################################
# Build Gatsby Site
################################################################################

build_gatsby_site() {
    print_header "Building Gatsby Site"
    
    print_step "Installing dependencies..."
    cd "$REPO_ROOT"
    
    if [ ! -d "node_modules" ]; then
        print_info "node_modules not found, running npm install..."
        npm install
        print_success "Dependencies installed"
    else
        print_info "node_modules found, skipping install"
        print_warning "Run 'npm install' manually if you need to update dependencies"
    fi
    
    print_step "Building Gatsby site..."
    print_info "Build output will be in: $BUILD_OUTPUT_DIR"
    
    # Clean previous build
    if [ -d "$BUILD_OUTPUT_DIR" ]; then
        print_info "Removing previous build..."
        rm -rf "$BUILD_OUTPUT_DIR"
    fi
    
    # Run Gatsby build
    npm run build
    
    if [ -d "$BUILD_OUTPUT_DIR" ]; then
        BUILD_SIZE=$(du -sh "$BUILD_OUTPUT_DIR" | cut -f1)
        FILE_COUNT=$(find "$BUILD_OUTPUT_DIR" -type f | wc -l | tr -d ' ')
        print_success "Build completed successfully"
        print_info "Build size: $BUILD_SIZE"
        print_info "Files: $FILE_COUNT"
    else
        print_error "Build failed - output directory not found"
        exit 1
    fi
}

################################################################################
# Install CDK Dependencies
################################################################################

install_cdk_dependencies() {
    print_header "Installing CDK Dependencies"
    
    cd "$INFRA_DIR"
    
    if [ ! -d "node_modules" ]; then
        print_info "Installing CDK dependencies..."
        npm install
        print_success "CDK dependencies installed"
    else
        print_info "CDK dependencies already installed"
    fi
}

################################################################################
# Bootstrap CDK
################################################################################

bootstrap_cdk() {
    print_header "Bootstrapping AWS CDK"
    
    cd "$INFRA_DIR"
    
    print_step "Checking if CDK is already bootstrapped..."
    
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    AWS_REGION=$(aws configure get region || echo "us-east-1")
    
    # Check if bootstrap stack exists
    if aws cloudformation describe-stacks --stack-name CDKToolkit --region "$AWS_REGION" &> /dev/null; then
        print_success "CDK is already bootstrapped in $AWS_REGION"
        print_info "Bootstrap stack: CDKToolkit"
        print_warning "Skipping bootstrap (already exists)"
    else
        print_warning "CDK not bootstrapped in $AWS_REGION"
        print_step "Bootstrapping CDK..."
        print_info "This is a one-time setup per AWS account/region"
        
        DEPLOYMENT_ID="$DEPLOYMENT_ID" npx cdk bootstrap \
            aws://$AWS_ACCOUNT/$AWS_REGION \
            --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
        
        print_success "CDK bootstrapped successfully"
    fi
}

################################################################################
# Synthesize CDK Stack
################################################################################

synthesize_stack() {
    print_header "Synthesizing CDK Stack"
    
    cd "$INFRA_DIR"
    
    print_step "Generating CloudFormation template..."
    print_info "Deployment ID: $DEPLOYMENT_ID"
    print_info "Stack name: ${DEPLOYMENT_ID}-stack"
    
    DEPLOYMENT_ID="$DEPLOYMENT_ID" npx cdk synth
    
    print_success "CloudFormation template generated"
    print_info "Template location: ${INFRA_DIR}/cdk.out/${DEPLOYMENT_ID}-stack.template.json"
}

################################################################################
# Deploy CDK Stack
################################################################################

deploy_stack() {
    print_header "Deploying CDK Stack to AWS"
    
    cd "$INFRA_DIR"
    
    print_step "Deploying infrastructure..."
    print_info "Stack name: ${DEPLOYMENT_ID}-stack"
    print_info "This may take several minutes (CloudFront distribution creation is slow)"
    echo ""
    
    # Deploy with auto-approval
    DEPLOYMENT_ID="$DEPLOYMENT_ID" npx cdk deploy \
        --require-approval never \
        --outputs-file "${REPO_ROOT}/cdk-outputs.json"
    
    print_success "Deployment completed successfully"
}

################################################################################
# Display Outputs
################################################################################

display_outputs() {
    print_header "Deployment Outputs"
    
    cd "$REPO_ROOT"
    
    if [ -f "cdk-outputs.json" ]; then
        print_step "Extracting deployment information..."
        
        # Parse outputs using grep and sed (works without jq)
        STACK_NAME="${DEPLOYMENT_ID}-stack"
        
        # Try to extract distribution URL
        DISTRIBUTION_URL=$(grep -A 1 "DistributionUrl" cdk-outputs.json | grep -v "DistributionUrl" | sed 's/[",]//g' | tr -d ' ' || echo "")
        
        # Try to extract distribution ID
        DISTRIBUTION_ID=$(grep -A 1 "DistributionId" cdk-outputs.json | grep -v "DistributionId" | sed 's/[",]//g' | tr -d ' ' || echo "")
        
        # Try to extract bucket name
        BUCKET_NAME=$(grep -A 1 "BucketName" cdk-outputs.json | grep -v "BucketName" | sed 's/[",]//g' | tr -d ' ' || echo "")
        
        echo ""
        print_success "Your Gatsby site has been deployed!"
        echo ""
        
        if [ -n "$DISTRIBUTION_URL" ]; then
            echo -e "${GREEN}🌐 Website URL:${NC}"
            echo -e "   ${CYAN}$DISTRIBUTION_URL${NC}"
            echo ""
        fi
        
        if [ -n "$DISTRIBUTION_ID" ]; then
            echo -e "${BLUE}📊 CloudFront Distribution ID:${NC}"
            echo -e "   $DISTRIBUTION_ID"
            echo ""
        fi
        
        if [ -n "$BUCKET_NAME" ]; then
            echo -e "${BLUE}🪣 S3 Bucket Name:${NC}"
            echo -e "   $BUCKET_NAME"
            echo ""
        fi
        
        echo -e "${BLUE}📋 Stack Name:${NC}"
        echo -e "   ${DEPLOYMENT_ID}-stack"
        echo ""
        
        print_info "Full outputs saved to: cdk-outputs.json"
        
    else
        print_warning "Output file not found, fetching from CloudFormation..."
        
        AWS_REGION=$(aws configure get region || echo "us-east-1")
        
        echo ""
        print_info "Stack Name: ${DEPLOYMENT_ID}-stack"
        print_info "Region: $AWS_REGION"
        echo ""
        
        # Get stack outputs from CloudFormation
        print_step "Fetching stack outputs..."
        aws cloudformation describe-stacks \
            --stack-name "${DEPLOYMENT_ID}-stack" \
            --region "$AWS_REGION" \
            --query 'Stacks[0].Outputs' \
            --output table 2>/dev/null || print_warning "Could not fetch outputs"
    fi
}

################################################################################
# Cleanup on Error
################################################################################

cleanup_on_error() {
    print_error "Deployment failed!"
    print_info "Check the error messages above for details"
    exit 1
}

trap cleanup_on_error ERR

################################################################################
# Display Usage
################################################################################

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy a Gatsby site to AWS using CDK infrastructure.

OPTIONS:
    --skip-build        Skip the Gatsby build step
    --skip-bootstrap    Skip CDK bootstrap step
    --synth-only        Only synthesize the CDK stack (no deployment)
    --help              Show this help message

ENVIRONMENT VARIABLES:
    DEPLOYMENT_ID       Unique deployment identifier (default: gatsby-site-1772716889)
    AWS_PROFILE         AWS profile to use (optional)
    AWS_REGION          AWS region to deploy to (default: us-east-1)

EXAMPLES:
    # Full deployment (recommended)
    ./scripts/deploy.sh

    # Skip build if already built
    ./scripts/deploy.sh --skip-build

    # Only synthesize (dry-run)
    ./scripts/deploy.sh --synth-only

    # Use specific AWS profile
    AWS_PROFILE=production ./scripts/deploy.sh

    # Deploy to specific region
    AWS_REGION=eu-west-1 ./scripts/deploy.sh

DEPLOYMENT WORKFLOW:
    1. Check prerequisites (Node.js, npm, AWS CLI, credentials)
    2. Build Gatsby site (npm run build)
    3. Install CDK dependencies
    4. Bootstrap CDK (first-time setup)
    5. Synthesize CloudFormation template
    6. Deploy to AWS (S3 + CloudFront)
    7. Display deployment outputs

RESOURCES CREATED:
    - S3 Bucket: ${DEPLOYMENT_ID}-bucket
    - CloudFront Distribution (HTTPS, global CDN)
    - CloudFront Function (URL rewriting for SPA routing)
    - Origin Access Identity (secure S3 access)

For more information, see:
    - infra/README.md
    - infra/STACK_README.md
    - CDK_STACK_SUMMARY.md

EOF
}

################################################################################
# Parse Arguments
################################################################################

SKIP_BUILD=false
SKIP_BOOTSTRAP=false
SYNTH_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-bootstrap)
            SKIP_BOOTSTRAP=true
            shift
            ;;
        --synth-only)
            SYNTH_ONLY=true
            shift
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

################################################################################
# Main Deployment Flow
################################################################################

main() {
    print_header "Gatsby Site Deployment to AWS"
    
    echo -e "${BLUE}Repository:${NC} $REPO_ROOT"
    echo -e "${BLUE}Deployment ID:${NC} $DEPLOYMENT_ID"
    echo -e "${BLUE}Stack Name:${NC} ${DEPLOYMENT_ID}-stack"
    echo -e "${BLUE}Build Output:${NC} $BUILD_OUTPUT_DIR"
    echo ""
    
    # Step 1: Check prerequisites
    check_prerequisites
    
    # Step 2: Build Gatsby site
    if [ "$SKIP_BUILD" = false ]; then
        build_gatsby_site
    else
        print_warning "Skipping Gatsby build (--skip-build)"
        if [ ! -d "$BUILD_OUTPUT_DIR" ]; then
            print_error "Build output directory not found: $BUILD_OUTPUT_DIR"
            print_info "Run without --skip-build flag"
            exit 1
        fi
    fi
    
    # Step 3: Install CDK dependencies
    install_cdk_dependencies
    
    # Step 4: Bootstrap CDK
    if [ "$SKIP_BOOTSTRAP" = false ]; then
        bootstrap_cdk
    else
        print_warning "Skipping CDK bootstrap (--skip-bootstrap)"
    fi
    
    # Step 5: Synthesize stack
    synthesize_stack
    
    # Step 6: Deploy (or stop if synth-only)
    if [ "$SYNTH_ONLY" = true ]; then
        print_warning "Synth-only mode (--synth-only)"
        print_info "CloudFormation template generated but not deployed"
        print_info "To deploy, run: cd infra && DEPLOYMENT_ID=$DEPLOYMENT_ID npx cdk deploy"
        exit 0
    fi
    
    deploy_stack
    
    # Step 7: Display outputs
    display_outputs
    
    # Final success message
    print_header "Deployment Complete! 🚀"
    
    echo -e "${GREEN}Your Gatsby site is now live on AWS!${NC}"
    echo ""
    print_info "Next steps:"
    echo "  • Visit your website at the CloudFront URL above"
    echo "  • Set up a custom domain (optional)"
    echo "  • Configure AWS WAF for security (optional)"
    echo "  • Monitor with CloudWatch (logs available in AWS Console)"
    echo ""
    print_info "To update your site:"
    echo "  1. Make changes to your Gatsby site"
    echo "  2. Run: ./scripts/deploy.sh"
    echo "  3. CDK will automatically update S3 and invalidate CloudFront cache"
    echo ""
    print_success "Deployment completed successfully!"
}

# Run main function
main

