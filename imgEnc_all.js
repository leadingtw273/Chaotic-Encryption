const jimp = require('jimp');
const fs = require('fs');
const streamifier = require('streamifier');
const AES256 = require('./models/aes256_model.js');
const Chaos = require('./models/HENMAP_chaos_model.js');

// AES 加解密模組實作
const iv = Buffer.from([
  '0x00',
  '0x11',
  '0x22',
  '0x33',
  '0x44',
  '0x55',
  '0x66',
  '0x77',
  '0x88',
  '0x99',
  '0xaa',
  '0xbb',
  '0xcc',
  '0xdd',
  '0xee',
  '0xff'
]);
const AES_CBC = new AES256('aes-256-cbc', 'sha256', iv);
const AES_ECB = new AES256('aes-256-ecb', 'sha256');

// henon map 混沌系統模組實作
const chaos = new Chaos(0.001, [0.002, 0.003]);
const chaosInitValue = [0.123456, 0.456789, 0.789123];
const chaosInitStep = 1000;

// 圖片檔名設置
const imgNum = 50;
const fileName = 'img';
const fileExtension = '.png';

// 圖片路徑設置
const inputPath = './cryptFile/org/';
const outputPath = './cryptFile/enc/';

// 混沌初始值跑 timeStep 次數 避免初始影響
const chaosInit = (y, timeStep) => {
  let step = 0;
  while (step < timeStep) {
    y = chaos.runChaos(step, y);
    step++;
  }
  return y;
};
let chaos_X = chaosInit(chaosInitValue, chaosInitStep);

// AES金鑰設置
const aesKey = chaosInit(chaosInitValue, chaosInitStep);

// 主要加密程式執行
for (let i = 0; i < imgNum; i++) {
  const inputFileName = fileName + i + fileExtension;
  let step = chaosInitStep;

  jimp.read(inputPath + inputFileName, (err, img) => {
    if (err) throw err;

    let tmp = iv;
    const orgBuf = inputImg(img);

    const aesBuf_ECB = dataCrypt(orgBuf, aesKey, AES_ECB);
    const aesBuf_CBC = dataCrypt(orgBuf, aesKey, AES_CBC);

    let chaosBuf_ECB = Buffer.alloc(0);
    let chaosBuf_CBC = Buffer.alloc(0);

    const readStream = streamifier.createReadStream(orgBuf);

    readStream.on('readable', () => {
      let chunk = '';
      while (null !== (chunk = readStream.read(16))) {
        chaosBuf_ECB = Buffer.concat([
          chaosBuf_ECB,
          dataCrypt(chunk, chaos_X, AES_ECB)
        ]);

        tmp = xor(tmp, chunk);
        tmp = dataCrypt(tmp, chaos_X, AES_ECB);
        dataCrypt(orgBuf, aesKey, AES_CBC);
        chaosBuf_CBC = Buffer.concat([chaosBuf_CBC, tmp]);

        step++;
        chaos_X = chaos.runChaos(step, chaos_X);
      }
    });

    readStream.on('end', () => {
      console.log(`${inputFileName} fin`);

      nistOutput({
        aesBuf_ECB,
        aesBuf_CBC,
        chaosBuf_ECB,
        chaosBuf_CBC
      });

      chaos_X = chaosInit(chaosInitValue, 1000);

      outputImg(aesBuf_ECB, img, 'aes_ECB', inputFileName);
      outputImg(aesBuf_CBC, img, 'aes_CBC', inputFileName);
      outputImg(chaosBuf_ECB, img, 'chaos_ECB', inputFileName);
      outputImg(chaosBuf_CBC, img, 'chaos_CBC', inputFileName);
    });
  });
}

// NIST 數值資料產出
const nistOutput = dataBuf => {
  const NIST_AES_ECB_DATA = fs.createWriteStream(
    'C:/NIST/data/img/NIST_AES_ECB_DATA.bin',
    { flags: 'a' }
  );
  const NIST_AES_CBC_DATA = fs.createWriteStream(
    'C:/NIST/data/img/NIST_AES_CBC_DATA.bin',
    { flags: 'a' }
  );
  const NIST_CHAOS_ECB_DATA = fs.createWriteStream(
    'C:/NIST/data/img/NIST_CHAOS_ECB_DATA.bin',
    { flags: 'a' }
  );
  const NIST_CHAOS_CBC_DATA = fs.createWriteStream(
    'C:/NIST/data/img/NIST_CHAOS_CBC_DATA.bin',
    { flags: 'a' }
  );

  NIST_AES_ECB_DATA.write(dataBuf.aesBuf_ECB);
  NIST_AES_ECB_DATA.end();
  NIST_AES_CBC_DATA.write(dataBuf.aesBuf_CBC);
  NIST_AES_CBC_DATA.end();
  NIST_CHAOS_ECB_DATA.write(dataBuf.chaosBuf_ECB);
  NIST_CHAOS_ECB_DATA.end();
  NIST_CHAOS_CBC_DATA.write(dataBuf.chaosBuf_CBC);
  NIST_CHAOS_CBC_DATA.end();
};

// 取得圖片上像素RGB數值
const inputImg = img => {
  let orgData = [];
  let orgBuf = Buffer.alloc(0);
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
    orgData.push(img.bitmap.data[idx + 0]);
    orgData.push(img.bitmap.data[idx + 1]);
    orgData.push(img.bitmap.data[idx + 2]);
    if (x == img.bitmap.width - 1 && y == img.bitmap.height - 1) {
      orgBuf = Buffer.from(orgData);
    }
  });
  return orgBuf;
};

// 將像素資料複寫至圖像上
const outputImg = (data, img, name, inputFileName) => {
  let i = 0;
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
    img.bitmap.data[idx + 0] = data[i + 0];
    img.bitmap.data[idx + 1] = data[i + 1];
    img.bitmap.data[idx + 2] = data[i + 2];
    if (x == img.bitmap.width - 1 && y == img.bitmap.height - 1) {
      img.write(`${outputPath}/${name}/${inputFileName}`);
    }
    i += 3;
  });
};

const xor = (a, b) => {
  if (!Buffer.isBuffer(a)) a = new Buffer(a);
  if (!Buffer.isBuffer(b)) b = new Buffer(b);
  const res = [];
  if (a.length > b.length) {
    for (let i = 0; i < b.length; i++) {
      res.push(a[i] ^ b[i]);
    }
  } else {
    for (let i = 0; i < a.length; i++) {
      res.push(a[i] ^ b[i]);
    }
  }
  return new Buffer(res);
};

// 加密Function
const dataCrypt = (data, key, aesMethod) => {
  return aesMethod.encryp(data, Buffer.from(new String(key[0])));
};
