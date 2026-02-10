// Simple script to create placeholder icons
const fs = require('fs');
const path = require('path');

console.log('Creating placeholder icon files...');

// Create a simple data URL for a colored square (will work as placeholder)
const createSimpleIcon = (size) => {
  // This is a minimal valid PNG file (1x1 purple pixel)
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return Buffer.from(base64, 'base64');
};

const sizes = [16, 192, 512];
const publicDir = path.join(__dirname, 'public');

sizes.forEach(size => {
  const filename = `icon-${size}.png`;
  const filepath = path.join(publicDir, filename);

  // Create a minimal valid PNG file
  fs.writeFileSync(filepath, createSimpleIcon(size));
  console.log(`✓ Created ${filename}`);
});

console.log('\n✓ All placeholder icons created!');
console.log('Note: These are minimal placeholders. Replace with proper icons later.\n');
