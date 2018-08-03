const jimp = require('jimp');
const streamifier = require('streamifier');
const AES256 = require('../models/aes256_model.js');
const Chaos = require('../models/HENMAP_chaos_model.js');

const iv = Buffer.from(['0x00', '0x11', '0x22', '0x33', '0x44', '0x55', '0x66', '0x77', '0x88', '0x99', '0xaa', '0xbb', '0xcc', '0xdd', '0xee', '0xff']);
const AES_CBC = new AES256('aes-256-cbc', 'sha256', iv);
const AES_ECB = new AES256('aes-256-ecb', 'sha256');

const chaos = new Chaos(0.1, [-0.3, 0.02]);
let aesKey = 0;
let X = [0.18, -1.01, 2.1];
let step = 0;
while (step < 1000) {
  X = chaos.runChaos(step, X);
  step++;
}
aesKey = X[0];

const fileName = 'lena256';
const fileExtension = '.png';
const inputFileName = fileName + fileExtension;

const inputPath = './cryptFile/enc/';
const outputPath = './cryptFile/dec/';

jimp.read(inputPath + '/aes_ECB/' + inputFileName, (err, img) => {
  if (err) throw err;

  const orgBuf = inputImg(img);

  let aesBuf = Buffer.alloc(0);
  const readStream = streamifier.createReadStream(orgBuf);
  readStream.on('readable', () => {
    let chunk = '';
    while (null !== (chunk = readStream.read(16))) {
      aesBuf = Buffer.concat([aesBuf, chunk]);
    }
  });
  readStream.on('end', () => {
    outputImg(aesCrypt(aesBuf, aesKey, AES_ECB), img, 'aes_ECB');
  });
});

jimp.read(inputPath + '/aes_CBC/' + inputFileName, (err, img) => {
  if (err) throw err;

  const orgBuf = inputImg(img);

  let aesBuf = Buffer.alloc(0);
  const readStream = streamifier.createReadStream(orgBuf);
  readStream.on('readable', () => {
    let chunk = '';
    while (null !== (chunk = readStream.read(16))) {
      aesBuf = Buffer.concat([aesBuf, chunk]);
    }
  });
  readStream.on('end', () => {
    outputImg(aesCrypt(aesBuf, aesKey, AES_CBC), img, 'aes_CBC');
  });
});

jimp.read(inputPath + '/chaos_ECB/' + inputFileName, (err, img) => {
  if (err) throw err;

  const orgBuf = inputImg(img);
  let X_ECB = Array.from(X);

  let chaosBuf_ECB = Buffer.alloc(0);
  const readStream = streamifier.createReadStream(orgBuf);
  readStream.on('readable', () => {
    let chunk = '';
    while (null !== (chunk = readStream.read(16))) {
      if (chunk.length % 16 != 0) {
        chaosBuf_ECB = Buffer.concat([chaosBuf_ECB, chunk]);
      } else {
        chaosBuf_ECB = Buffer.concat([chaosBuf_ECB, chaosCrypt(chunk, X_ECB, AES_ECB)]);
      }
      step++;
      X_ECB = chaos.runChaos(step, X_ECB);
    }
  });
  readStream.on('end', () => {
    outputImg(chaosBuf_ECB, img, 'chaos_ECB');
  });
});

jimp.read(inputPath + '/chaos_CBC/' + inputFileName, (err, img) => {
  if (err) throw err;

  const orgBuf = inputImg(img);
  let X_CBC = Array.from(X);

  let chaosBuf_CBC = Buffer.alloc(0);
  const readStream = streamifier.createReadStream(orgBuf);
  readStream.on('readable', () => {
    let chunk = '';
    while (null !== (chunk = readStream.read(16))) {
      if (chunk.length % 16 != 0) {
        chaosBuf_CBC = Buffer.concat([chaosBuf_CBC, chunk]);
      } else {
        chaosBuf_CBC = Buffer.concat([chaosBuf_CBC, chaosCrypt(chunk, X_CBC, AES_CBC)]);
      }
      step++;
      X_CBC = chaos.runChaos(step, X_CBC);
    }
  });
  readStream.on('end', () => {
    outputImg(chaosBuf_CBC, img, 'chaos_CBC');
  });
});

const inputImg = (img) => {
  let orgData = [];
  let orgBuf = Buffer.alloc(0);
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
    orgData.push(img.bitmap.data[idx + 0]);
    if (x == img.bitmap.width - 1 && y == img.bitmap.height - 1) {
      orgBuf = Buffer.from(orgData);
    }
  });
  return orgBuf;
};

const outputImg = (data, img, name) => {
  let i = 0;
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
    img.bitmap.data[idx + 0] = data[i];
    img.bitmap.data[idx + 1] = data[i];
    img.bitmap.data[idx + 2] = data[i];
    if (x == img.bitmap.width - 1 && y == img.bitmap.height - 1) {
      img.write(`${outputPath}/${name}/${inputFileName}`);
    }
    i++;
  });
};

const chaosCrypt = (data, x, aesMethod) => {
  return aesMethod.decryp(data, Buffer.from(new String(x[0])));
};

const aesCrypt = (data, key, aesMethod) => {
  return aesMethod.decryp(data, Buffer.from(new String(key)));
};
