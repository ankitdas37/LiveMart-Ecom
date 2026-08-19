import { Jimp } from 'jimp';
import path from 'path';

const publicDir = path.resolve('public');
const logoPath = path.join(publicDir, 'logo.png');

async function resize() {
  try {
    const image = await Jimp.read(logoPath);
    
    // Create 192x192
    const img192 = image.clone();
    img192.resize({ w: 192, h: 192 });
    await img192.write(path.join(publicDir, 'logo-192.png'));
    console.log('Created logo-192.png');
    
    // Create 512x512
    const img512 = image.clone();
    img512.resize({ w: 512, h: 512 });
    await img512.write(path.join(publicDir, 'logo-512.png'));
    console.log('Created logo-512.png');
    
  } catch (err) {
    console.error('Error resizing icons:', err);
  }
}

resize();
