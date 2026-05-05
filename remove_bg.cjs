const { Jimp } = require('jimp');

async function removeWhiteBg() {
  try {
    const image = await Jimp.read('public/assets/logo.png');
    
    // Iterate over all pixels
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If the pixel is close to white
      if (red > 230 && green > 230 && blue > 230) {
        // Set alpha to 0 (transparent)
        this.bitmap.data[idx + 3] = 0;
      }
    });

    await image.write('public/assets/logo_transparent.png');
    console.log('SUCCESS');
  } catch (err) {
    console.error('ERROR:', err);
  }
}

removeWhiteBg();
