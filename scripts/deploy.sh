#!/bin/bash

################################################################################
# Deployment Script for Gatsby Site
# 
# This script automates the complete deployment process:
# 1. Build the Gatsby application
# 2. Bootstrap AWS CDK (if needed)
# 3. Deploy infrastructure to AWS using CDK
#
# Deployment ID: gatsby-site-1772712371
# Framework: Gatsby
# AWS Services: S3, CloudFront, Lambda
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

################################################################################
# Configuration
################################################################################

DEPLOYMENT_ID="gatsby-site-1772712371"
STACK_NAME="${DEPLOYMENT_ID}-stack"
BUILD_OUTPUT_DIR="public"
INFRA_DIR="infra"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

################################################################################
# Helper Functions
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

################################################################################
# Pre-flight Checks
################################################################################

preflight_checks() {
    log_section "Pre-flight Checks"
    
    log_info "Checking required tools..."
    
    # Check Node.js
    if check_command node; then
        NODE_VERSION=$(node --version)
        log_success "Node.js installed: $NODE_VERSION"
    fi
    
    # Check npm
    if check_command npm; then
        NPM_VERSION=$(npm --version)
        log_success "npm installed: $NPM_VERSION"
    fi
    
    # Check AWS CLI
    if check_command aws; then
        AWS_VERSION=$(aws --version 2>&1 | cut -d' ' -f1)
        log_success "AWS CLI installed: $AWS_VERSION"
    fi
    
    # Check CDK
    if check_command cdk; then
        CDK_VERSION=$(cdk --version 2>&1)
        log_success "AWS CDK installed: $CDK_VERSION"
    fi
    
    # Check AWS credentials
    log_info "Checking AWS credentials..."
    if aws sts get-caller-identity &> /dev/null; then
        AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
        AWS_USER=$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2)
        log_success "AWS credentials configured"
        log_info "  Account: $AWS_ACCOUNT"
        log_info "  User/Role: $AWS_USER"
        log_info "  Region: $AWS_REGION"
    else
        log_error "AWS credentials not configured!"
        log_error "Please run 'aws configure' or set AWS environment variables"
        exit 1
    fi
    
    # Check if we're in the correct directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    if [ ! -d "$INFRA_DIR" ]; then
        log_error "Infrastructure directory '$INFRA_DIR' not found!"
        exit 1
    fi
    
    log_success "All pre-flight checks passed!"
}

################################################################################
# Install Dependencies
################################################################################

install_dependencies() {
    log_section "Installing Dependencies"
    
    # Install root dependencies
    log_info "Installing project dependencies..."
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    log_success "Project dependencies installed"
    
    # Install CDK dependencies
    log_info "Installing CDK infrastructure dependencies..."
    cd "$INFRA_DIR"
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    cd ..
    log_success "CDK dependencies installed"
}

################################################################################
# Build Gatsby Site
################################################################################

build_site() {
    log_section "Building Gatsby Site"
    
    log_info "Starting Gatsby build process..."
    log_info "Build output directory: $BUILD_OUTPUT_DIR"
    
    # Clean previous build
    if [ -d "$BUILD_OUTPUT_DIR" ]; then
        log_info "Cleaning previous build..."
        rm -rf "$BUILD_OUTPUT_DIR"
    fi
    
    # Run Gatsby build
    log_info "Running: npm run build"
    npm run build
    
    # Verify build output
    if [ ! -d "$BUILD_OUTPUT_DIR" ]; then
        log_error "Build failed! Output directory '$BUILD_OUTPUT_DIR' not found."
        exit 1
    fi
    
    # Count files
    FILE_COUNT=$(find "$BUILD_OUTPUT_DIR" -type f | wc -l | tr -d ' ')
    BUILD_SIZE=$(du -sh "$BUILD_OUTPUT_DIR" | cut -f1)
    
    log_success "Gatsby build completed successfully!"
    log_info "  Files: $FILE_COUNT"
    log_info "  Size: $BUILD_SIZE"
    
    # List key files
    log_info "Key files in build output:"
    if [ -f "$BUILD_OUTPUT_DIR/index.html" ]; then
        log_info "  ✓ index.html"
    fi
    if [ -f "$BUILD_OUTPUT_DIR/404.html" ]; then
        log_info "  ✓ 404.html"
    fi
    if [ -d "$BUILD_OUTPUT_DIR/static" ]; then
        log_info "  ✓ static/ directory"
    fi
}

################################################################################
# CDK Bootstrap
################################################################################

bootstrap_cdk() {
    log_section "CDK Bootstrap"
    
    log_info "Checking if CDK bootstrap is needed..."
    
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    
    # Check if already bootstrapped
    BOOTSTRAP_STACK="CDKToolkit"
    if aws cloudformation describe-stacks --stack-name "$BOOTSTRAP_STACK" --region "$AWS_REGION" &> /dev/null; then
        log_success "CDK already bootstrapped in region $AWS_REGION"
        return 0
    fi
    
    log_info "Bootstrapping CDK in region $AWS_REGION..."
    log_info "This is a one-time operation per AWS account/region"
    
    cd "$INFRA_DIR"
    cdk bootstrap aws://$AWS_ACCOUNT/$AWS_REGION
    cd ..
    
    log_success "CDK bootstrap completed!"
}

################################################################################
# Synthesize CDK Stack
################################################################################

synthesize_stack() {
    log_section "Synthesizing CDK Stack"
    
    log_info "Synthesizing CloudFormation template..."
    
    cd "$INFRA_DIR"
    cdk synth
    cd ..
    
    log_success "CDK synthesis completed!"
    log_info "CloudFormation template: $INFRA_DIR/cdk.out/$STACK_NAME.template.json"
}

################################################################################
# Deploy CDK Stack
################################################################################

deploy_stack() {
    log_section "Deploying CDK Stack to AWS"
    
    log_info "Deploying stack: $STACK_NAME"
    log_info "Region: $AWS_REGION"
    log_info "Deployment ID: $DEPLOYMENT_ID"
    
    cd "$INFRA_DIR"
    
    # Deploy with auto-approval
    log_info "Running CDK deploy (this may take 15-20 minutes)..."
    cdk deploy --require-approval never --outputs-file ../cdk-outputs.json
    
    cd ..
    
    log_success "CDK deployment completed!"
}

################################################################################
# Display Output
################################################################################

display_outputs() {
    log_section "Deployment Outputs"
    
    if [ -f "cdk-outputs.json" ]; then
        log_info "Stack outputs saved to: cdk-outputs.json"
        
        # Extract CloudFront URL if available
        if command -v jq &> /dev/null; then
            DISTRIBUTION_URL=$(jq -r ".[\"$STACK_NAME\"].DistributionUrl // empty" cdk-outputs.json 2>/dev/null)
            DISTRIBUTION_ID=$(jq -r ".[\"$STACK_NAME\"].DistributionId // empty" cdk-outputs.json 2>/dev/null)
            BUCKET_NAME=$(jq -r ".[\"$STACK_NAME\"].BucketName // empty" cdk-outputs.json 2>/dev/null)
            
            if [ -n "$DISTRIBUTION_URL" ]; then
                echo -e "\n${GREEN}🎉 Deployment Successful!${NC}\n"
                echo -e "${CYAN}Your site is now live at:${NC}"
                echo -e "${GREEN}$DISTRIBUTION_URL${NC}\n"
                
                if [ -n "$DISTRIBUTION_ID" ]; then
                    echo -e "${CYAN}CloudFront Distribution ID:${NC} $DISTRIBUTION_ID"
                fi
                if [ -n "$BUCKET_NAME" ]; then
                    echo -e "${CYAN}S3 Bucket:${NC} $BUCKET_NAME"
                fi
            fi
        else
            log_info "Install 'jq' to see formatted outputs"
            cat cdk-outputs.json
        fi
    else
        log_warning "Output file not found. Check CloudFormation console for outputs."
    fi
    
    log_info "\nTo view your stack in AWS Console:"
    echo -e "https://console.aws.amazon.com/cloudformation/home?region=$AWS_REGION#/stacks/stackinfo?stackId=$STACK_NAME"
}

################################################################################
# Cleanup on Error
################################################################################

cleanup_on_error() {
    log_error "Deployment failed!"
    log_info "Check the error messages above for details."
    exit 1
}

################################################################################
# Main Execution
################################################################################

main() {
    # Trap errors
    trap cleanup_on_error ERR
    
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         Gatsby Site Deployment to AWS                        ║
║         S3 + CloudFront via AWS CDK                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    log_info "Deployment ID: $DEPLOYMENT_ID"
    log_info "Stack Name: $STACK_NAME"
    log_info "Region: $AWS_REGION"
    log_info "Started at: $(date)"
    
    # Execute deployment steps
    preflight_checks
    install_dependencies
    build_site
    bootstrap_cdk
    synthesize_stack
    deploy_stack
    display_outputs
    
    log_section "Deployment Complete"
    log_success "All steps completed successfully!"
    log_info "Finished at: $(date)"
    
    echo -e "\n${GREEN}✓ Deployment completed successfully!${NC}\n"
}

################################################################################
# Script Entry Point
################################################################################

# Parse command line arguments
SKIP_BUILD=false
SKIP_DEPS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --region)
            AWS_REGION="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-build    Skip the Gatsby build step"
            echo "  --skip-deps     Skip dependency installation"
            echo "  --region REGION Set AWS region (default: us-east-1)"
            echo "  --help          Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  AWS_REGION      AWS region for deployment (default: us-east-1)"
            echo "  AWS_PROFILE     AWS profile to use for deployment"
            echo ""
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"
