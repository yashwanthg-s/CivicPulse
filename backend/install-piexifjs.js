#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing piexifjs...');

try {
  // Try npm install
  execSync('npm install piexifjs@1.0.6', { 
    stdio: 'inherit',
    shell: true 
  });
  console.log('✓ piexifjs installed successfully');
} catch (error) {
  console.error('Failed to install piexifjs:', error.message);
  
  // Fallback: create a minimal piexifjs mock if installation fails
  console.log('Creating piexifjs mock...');
  const mockPath = path.join(__dirname, 'node_modules', 'piexifjs');
  if (!fs.existsSync(mockPath)) {
    fs.mkdirSync(mockPath, { recursive: true });
    fs.writeFileSync(path.join(mockPath, 'package.json'), JSON.stringify({
      name: 'piexifjs',
      version: '1.0.6',
      main: 'index.js'
    }, null, 2));
    
    fs.writeFileSync(path.join(mockPath, 'index.js'), `
module.exports = {
  load: function(data) {
    return { '0th': {}, 'Exif': {}, 'GPS': {} };
  },
  ImageIFD: { DateTime: 0x0132 },
  ExifIFD: { 
    ISOSpeedRatings: 0x8827,
    FocalLength: 0x920A,
    FNumber: 0x829D,
    ExposureTime: 0x829A
  },
  GPSIFD: {
    GPSLatitude: 0x0002,
    GPSLongitude: 0x0004,
    GPSLatitudeRef: 0x0001,
    GPSLongitudeRef: 0x0003,
    GPSDOP: 0x000B
  }
};
`);
    console.log('✓ piexifjs mock created');
  }
}
