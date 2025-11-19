#!/bin/bash

# Backup original
cp src/styles.css src/styles.css.backup

# Remove all border-radius
sed -i '' 's/border-radius: [0-9]*px;//' src/styles.css

# Update colors
sed -i '' 's/#667eea/#01BEE7/g' src/styles.css
sed -i '' 's/#764ba2/#002233/g' src/styles.css  
sed -i '' 's/#5568d3/#01BEE7/g' src/styles.css

# Remove emojis from CSS (if any mentions)
sed -i '' 's/[🎯🔍👥📚✓👨‍💻👩‍💻👨‍💼👩‍💼✨💡]//g' src/styles.css

echo "✅ Styles updated!"
