const jimp = require('jimp');
const streamifier = require('streamifier');
const AES256 = require('../models/aes256_model.js');
const Chaos = require('../models/HENMAP_chaos_model.js');

const AES = new AES256('aes-256-ecb');
const chaos = new Chaos(0.1, [-0.3, 0.02]);
let X = [0.18, -1.01, 2.1];
let step = 0;
while (step < 1000) {
  X = chaos.runChaos(step, X);
  step++;
}

const fileName = 'lena256';
const fileExtension = '.png';
const inputFileName = fileName + fileExtension;

const inputPath = './cryptFile/enc/';
const outputPath = './cryptFile/dec/';

jimp.read(inputPath + '/aes/' + inputFileName, (err, img) => {
  if (err) throw err;

  let orgData = [];
  let orgBuf = Buffer.alloc(0);
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
    orgData.push(img.bitmap.data[idx + 0]);
    if (x == img.bitmap.width - 1 && y == img.bitmap.height - 1) {
      orgBuf = Buffer.from(orgData);
    }
  });

  let aesBuf = Buffer.alloc(0);
  const readStream = streamifier.createReadStream(orgBuf);
  readStream.on('readable', () => {
    let chunk = '';
    while (null !== (chunk = readStream.read(16))) {
      let ae = aesCrypt(chunk);

      if (chunk.length % 16 != 0) {
        aesBuf = Buffer.concat([aesBuf, chunk]);
      } else {
        aesBuf = Buffer.concat([aesBuf, ae]);
      }
    }
  });
  readStream.on('end', () => {
    outputImg(aesBuf, img, 'aes');
  });
});

jimp.read(inputPath + '/chaos/' + inputFileName, (err, img) => {
  if (err) throw err;

  let orgData = [];
  let orgBuf = Buffer.alloc(0);
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
    orgData.push(img.bitmap.data[idx + 0]);
    if (x == img.bitmap.width - 1 && y == img.bitmap.height - 1) {
      orgBuf = Buffer.from(orgData);
    }
  });

  let chaosBuf = Buffer.alloc(0);
  const readStream = streamifier.createReadStream(orgBuf);
  readStream.on('readable', () => {
    let chunk = '';
    while (null !== (chunk = readStream.read(16))) {
      let cry = chaosCrypt(chunk, step);

      if (chunk.length % 16 != 0) {
        chaosBuf = Buffer.concat([chaosBuf, chunk]);
      } else {
        chaosBuf = Buffer.concat([chaosBuf, cry]);
      }
      step++;
    }
  });
  readStream.on('end', () => {
    outputImg(chaosBuf, img, 'chaos');
  });
});

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

const chaosCrypt = (data, i) => {
  let buf1 = Buffer.alloc(8);
  let buf2 = Buffer.alloc(8);
  let sourceKey = Buffer.alloc(16);

  X = chaos.runChaos(i, X);
  buf1.writeDoubleBE(X[0]);
  buf2.writeDoubleBE(X[1]);
  sourceKey = Buffer.concat([buf1, buf2], 16);

  return AES.decryp(data, sourceKey);
};

const aesCrypt = data => {
  let buf1 = Buffer.alloc(8);
  let buf2 = Buffer.alloc(8);
  let sourceKey = Buffer.alloc(16);

  buf1.writeDoubleBE(0.5);
  buf2.writeDoubleBE(-0.3);
  sourceKey = Buffer.concat([buf1, buf2], 16);

  return AES.decryp(data, sourceKey);
};
