const fs = require('fs');
const streamifier = require('streamifier');
const { createCanvas, loadImage } = require('canvas');
const Chaos = require('./models/HENMAP_chaos_model.js');
const AES256 = require('./models/aes256_model.js');

const chaos = new Chaos(0.1, [-0.3, 0.02]);
const AES = new AES256('sha256', 'aes-256-ecb');

const fileName = 'img';
const fileExtension = '.png';

const inputFileName = fileName + fileExtension;
const outputAesFileName = 'enc_aes_' + inputFileName;
const outputChaosFileName = 'enc_chaos_' + inputFileName;

const wAesImgStream = fs.createWriteStream('./cryptFile/enc/' + outputAesFileName);
const wChaosImgStream = fs.createWriteStream('./cryptFile/enc/' + outputChaosFileName);

loadImage('./cryptFile/org/' + inputFileName).then((image) => {

  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0, 100, 100);
  let imgData = ctx.getImageData(0, 0, 100, 100);

  let buf = Buffer.from(imgData.data);

  const readStream = streamifier.createReadStream(buf);

  let count = 0;
  let chunk = '';
  let aesBuf = Buffer.alloc(0);
  let cryptBuf = Buffer.alloc(0);
  readStream.on('readable', () => {
    while (null !== (chunk = readStream.read(16))) {
      count++;

      let cry = crypt(chunk, count, true);
      let ae = aes(chunk, true);

      // console.log('==================================');
      // console.log(chunk);
      // console.log(chunk.length);
      // console.log('--------------------');
      // console.log(cry);
      // console.log(cry.length);

      if (chunk.length % 16 != 0) {
        aesBuf = Buffer.concat([aesBuf, chunk]);
        cryptBuf = Buffer.concat([cryptBuf, chunk]);
      } else {
        aesBuf = Buffer.concat([aesBuf, ae]);
        cryptBuf = Buffer.concat([cryptBuf, cry]);
      }

    }
  });
  readStream.on('end', () => {

    writePng(image, aesBuf, wAesImgStream);
    writePng(image, cryptBuf, wChaosImgStream);

  });
  readStream.on('error', err => console.log(err.strck));

});

let writePng = (image, dataBuf, writeStream) => {
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0, 100, 100);
  let imgData = ctx.getImageData(0, 0, 100, 100);

  let dataArr = new Uint8ClampedArray(dataBuf);


  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i + 0] = dataArr[i + 0];
    imgData.data[i + 1] = dataArr[i + 1];
    imgData.data[i + 2] = dataArr[i + 2];
    imgData.data[i + 3] = dataArr[i + 3];
  }

  ctx.putImageData(imgData, 0, 0);
  const stream = canvas.createPNGStream();
  stream.pipe(writeStream);
  writeStream.on('error', err => console.log(err.stack));
  writeStream.on('finish', () => console.log('The PNG file was created.'));

};

let X = [0.5, -0.3, 0.4];
let crypt = (data, i, dohash) => {

  X = chaos.runChaos(i, X);
  let sourceKey = X[0];

  if (dohash) {
    AES.setKey(sourceKey.toFixed(6));
  } else {
    AES.setNoHashKey(sourceKey.toFixed(6));
  }

  let encdata = AES.encryp(data);
  return encdata;
};

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
