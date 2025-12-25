#!/bin/bash

# Image Optimization Script
# This script compresses images and converts them to WebP format

echo "=================================="
echo "Image Optimization Script"
echo "=================================="
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Install with:"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   Mac: brew install imagemagick"
    echo "   Or use online tools like TinyPNG.com"
    exit 1
fi

# Check if cwebp is installed (for WebP conversion)
if ! command -v cwebp &> /dev/null; then
    echo "⚠️  cwebp not found (WebP support). Install with:"
    echo "   Ubuntu/Debian: sudo apt-get install webp"
    echo "   Mac: brew install webp"
    echo ""
    echo "Continuing without WebP conversion..."
    WEBP_AVAILABLE=false
else
    WEBP_AVAILABLE=true
fi

# Create backup directory
BACKUP_DIR="original_images_backup"
mkdir -p "$BACKUP_DIR"

echo "📁 Optimizing images in assets/img/..."
echo ""

# Function to optimize JPEG/PNG
optimize_image() {
    local file="$1"
    local filename=$(basename "$file")
    local extension="${filename##*.}"
    
    echo "🔧 Optimizing: $filename"
    
    # Backup original
    cp "$file" "$BACKUP_DIR/"
    
    # Get original size
    original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
    
    # Optimize based on type
    if [[ "$extension" == "jpg" || "$extension" == "jpeg" ]]; then
        # Optimize JPEG - quality 85, strip metadata
        convert "$file" -quality 85 -strip "$file"
    elif [[ "$extension" == "png" ]]; then
        # Optimize PNG
        convert "$file" -strip "$file"
    fi
    
    # Get new size
    new_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
    
    # Calculate savings
    savings=$((original_size - new_size))
    percent=$((savings * 100 / original_size))
    
    echo "   ✅ Saved: $(numfmt --to=iec $savings 2>/dev/null || echo $savings bytes) ($percent%)"
    
    # Create WebP version if available
    if [ "$WEBP_AVAILABLE" = true ]; then
        webp_file="${file%.*}.webp"
        cwebp -q 80 "$file" -o "$webp_file" 2>/dev/null
        echo "   🖼️  Created WebP: ${webp_file##*/}"
    fi
    
    echo ""
}

# Find and optimize all images
if [ -d "assets/img" ]; then
    # Optimize portfolio images
    if [ -d "assets/img/portfolio" ]; then
        echo "📂 Portfolio Images:"
        for img in assets/img/portfolio/*.{jpg,jpeg,png,gif}; do
            [ -f "$img" ] && optimize_image "$img"
        done
    fi
    
    # Optimize hero and other images
    echo "📂 Main Images:"
    for img in assets/img/*.{jpg,jpeg,png}; do
        [ -f "$img" ] && optimize_image "$img"
    done
else
    echo "❌ Directory 'assets/img' not found!"
    echo "   Please run this script from your website root directory"
    exit 1
fi

echo "=================================="
echo "✅ Optimization Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Test your website to ensure images display correctly"
echo "2. Original images backed up to: $BACKUP_DIR/"
echo "3. Consider using <picture> tags to serve WebP with fallbacks"
echo "4. Upload optimized images to your hosting"
echo ""
echo "Example <picture> tag usage:"
echo '<picture>'
echo '  <source srcset="image.webp" type="image/webp">'
echo '  <img src="image.jpg" alt="Description">'
echo '</picture>'
