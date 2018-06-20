const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const AES256 = require('./models/aes256_model.js');

const out = fs.createWriteStream('./imgD.png');

const AES = new AES256('sha256', 'aes-256-ecb');

const canvas = createCanvas(100, 100);
const ctx = canvas.getContext('2d');

// Draw cat with lime helmet
loadImage('./img.png').then((image) => {
  ctx.drawImage(image, 0, 0, 100, 100);
  let imgData = ctx.getImageData(0, 0, 100, 100);

  let buf = Buffer.from(imgData.data);

  let ae = aes(buf, true);
  
  let arr = new Uint8ClampedArray(ae);

  for (var i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i + 0] = arr[i + 0];
    imgData.data[i + 1] = arr[i + 1];
    imgData.data[i + 2] = arr[i + 2];
    imgData.data[i + 3] = arr[i + 3];
  }

  ctx.putImageData(imgData, 0, 0);

  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => console.log('The PNG file was created.'));
});

let aes = (data, dohash) => {

  let sourceKey = 1.63;
  if (dohash) {
    AES.setKey(sourceKey.toFixed(6));
  } else {
    AES.setNoHashKey(sourceKey.toFixed(6));
  }
  let encdata = AES.encryp(data);
  return encdata;
};