const jimp = require('jimp');
const streamifier = require('streamifier');
const AES256 = require('../models/aes256_model.js');
const Chaos = require('../models/HENMAP_chaos_model.js');

//const iv = Buffer.from(['0x00', '0x11', '0x22', '0x33', '0x44', '0x55', '0x66', '0x77', '0x88', '0x99', '0xaa', '0xbb', '0xcc', '0xdd', '0xee', '0xff']);
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

const inputPath = './cryptFile/org/';
const outputPath = './cryptFile/enc/';

jimp.read(inputPath + inputFileName, (err, img) => {
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
  let chaosBuf = Buffer.alloc(0);
  const readStream = streamifier.createReadStream(orgBuf);
  readStream.on('readable', () => {
    let chunk = '';
    while (null !== (chunk = readStream.read(16))) {
      let ae = aesCrypt(chunk);
      let cry = chaosCrypt(chunk, step);

      if (chunk.length % 16 != 0) {
        aesBuf = Buffer.concat([aesBuf, chunk]);
        chaosBuf = Buffer.concat([chaosBuf, chunk]);
      } else {
        aesBuf = Buffer.concat([aesBuf, ae]);
        chaosBuf = Buffer.concat([chaosBuf, cry]);
      }
      step++;
    }
  });
  readStream.on('end', () => {
    outputImg(aesBuf, img, 'aes');
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

  return AES.encryp(data, sourceKey);
};

let aesCrypt = data => {
  let buf1 = Buffer.alloc(8);
  let buf2 = Buffer.alloc(8);
  let sourceKey = Buffer.alloc(16);

  buf1.writeDoubleBE(0.5);
  buf2.writeDoubleBE(-0.3);
  sourceKey = Buffer.concat([buf1, buf2], 16);

  return AES.encryp(data, sourceKey);
};
