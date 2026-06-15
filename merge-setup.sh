#!/bin/bash
# GitHub Merge & CI/CD Setup Script
# This script merges local changes with GitHub and sets up continuous deployment

echo "=========================================="
echo "Horns & Heritage - GitHub Merge & CI/CD Setup"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}→${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

print_success "Git is installed"
echo ""

# Step 1: Clone repository
print_step "Step 1: Clone your GitHub repository"
echo "Enter your GitHub username (default: TWEBAZEHILLARY):"
read -p "> " GITHUB_USER
GITHUB_USER=${GITHUB_USER:-TWEBAZEHILLARY}

REPO_DIR="horns-heritage-merged"
if [ -d "$REPO_DIR" ]; then
    print_warning "Directory $REPO_DIR already exists. Using existing clone."
else
    print_step "Cloning repository..."
    git clone https://github.com/$GITHUB_USER/horns-heritage.git $REPO_DIR
    if [ $? -ne 0 ]; then
        echo "❌ Failed to clone repository"
        exit 1
    fi
fi
cd $REPO_DIR
print_success "Repository cloned/opened"
echo ""

# Step 2: Create directory structure
print_step "Step 2: Creating directory structure..."
mkdir -p public
mkdir -p src
mkdir -p .github/workflows
mkdir -p assets
mkdir -p _ds
print_success "Directories created"
echo ""

# Step 3: Show what will be merged
print_step "Step 3: Files to merge from local project"
echo ""
echo "Files that will be added/updated:"
echo "  - wrangler.toml"
echo "  - package.json"
echo "  - .gitignore"
echo "  - src/index.js"
echo "  - .github/workflows/deploy.yml"
echo "  - Documentation files"
echo "  - Move project/* → root"
echo ""

# Step 4: Show next steps
print_step "Step 4: Next Manual Steps Required"
echo ""
echo "You need to manually:"
echo "1. Copy these files from your workspace to this directory:"
echo "   - wrangler.toml"
echo "   - package.json"
echo "   - .gitignore"
echo "   - src/index.js"
echo "   - .github/workflows/deploy.yml"
echo "   - public/* (all files from public folder)"
echo ""
echo "2. Run these commands:"
echo ""
echo "   git add ."
echo "   git commit -m \"Merge: Add deployment config and move files to root\""
echo "   git push origin master"
echo ""
echo "3. Go to GitHub Settings > Secrets and add:"
echo "   - CLOUDFLARE_API_TOKEN"
echo "   - CLOUDFLARE_ACCOUNT_ID"
echo ""

# Step 5: Create a summary file
print_step "Step 5: Creating merge summary..."

cat > MERGE_SUMMARY.txt << 'EOF'
GITHUB MERGE & CI/CD SETUP SUMMARY
==================================

Files to Copy (from workspace to this repo):
✓ wrangler.toml → ./wrangler.toml
✓ package.json → ./package.json
✓ .gitignore → ./.gitignore
✓ src/index.js → ./src/index.js
✓ .github/workflows/deploy.yml → ./.github/workflows/deploy.yml
✓ public/* → ./public/ (all files)
✓ assets/* → ./assets/ (all files)
✓ _ds/* → ./_ds/ (all files)

Commands to Run:
1. cd horns-heritage-merged
2. Copy files (see above)
3. git add .
4. git commit -m "Merge: Add deployment configuration"
5. git push origin master

GitHub Secrets to Add (Settings > Secrets and variables > Actions):
1. CLOUDFLARE_API_TOKEN = (your API token from Cloudflare)
2. CLOUDFLARE_ACCOUNT_ID = (your account ID from Cloudflare)

Verify:
- Go to Actions tab
- Run a test push to trigger deployment
- Check https://horns-heritage.workers.dev

Questions? See:
- CI_CD_SETUP_GUIDE.md
- GITHUB_MERGE_GUIDE.md
- CI_CD_VISUAL_GUIDE.html
EOF

print_success "Merge summary created: MERGE_SUMMARY.txt"
echo ""

# Step 6: List current structure
print_step "Step 6: Current repository structure"
echo ""
ls -la
echo ""

# Final message
echo "=========================================="
echo -e "${GREEN}Setup Ready!${NC}"
echo "=========================================="
echo ""
echo "Current directory: $(pwd)"
echo ""
echo "Next steps:"
echo "1. Copy files from workspace to this directory"
echo "2. Run: git add . && git commit -m 'Merge deployment config' && git push origin master"
echo "3. Add GitHub secrets (see MERGE_SUMMARY.txt)"
echo "4. Test by making a small change and pushing"
echo ""
echo "For detailed instructions, see: GITHUB_MERGE_GUIDE.md"
echo ""
