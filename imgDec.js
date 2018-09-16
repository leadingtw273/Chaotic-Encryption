const jimp = require('jimp');
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
const chaos = new Chaos(0.1, [0.2, 0.3]);
const chaosInitValue = [0.123, 0.456, 0.789];
const chaosInitStep = 1000;

// 圖片檔名設置
const fileName = 'img4';
const fileExtension = '.png';
const inputFileName = fileName + fileExtension;

// 圖片路徑設置
const inputPath = './cryptFile/enc/';
const outputPath = './cryptFile/dec/';

// 混沌初始值跑 timeStep 次數 避免初始影響
const chaosInit = (y, timeStep) => {
  let step = 0;
  while (step < timeStep) {
    y = chaos.runChaos(step, y);
    step++;
  }
  return y;
};
let X = chaosInit(chaosInitValue, chaosInitStep);

// AES金鑰設置
const aesKey = chaosInitValue[0];

// AES_ECB 解密部分
jimp.read(inputPath + '/aes_ECB/' + inputFileName, (err, img) => {
  if (err) throw err;

  const orgBuf = inputImg(img);
  outputImg(aesCrypt(orgBuf, aesKey, AES_ECB), img, 'aes_ECB');
});

// AES_CBC 解密部分
jimp.read(inputPath + '/aes_CBC/' + inputFileName, (err, img) => {
  if (err) throw err;

  const orgBuf = inputImg(img);
  outputImg(aesCrypt(orgBuf, aesKey, AES_CBC), img, 'aes_CBC');
});

// CHAOS_ECB 解密部分
jimp.read(inputPath + '/chaos_ECB/' + inputFileName, (err, img) => {
  if (err) throw err;

  const orgBuf = inputImg(img);
  let X_ECB = Array.from(X);
  let step = chaosInitStep;

  let chaosBuf_ECB = Buffer.alloc(0);
  const readStream = streamifier.createReadStream(orgBuf);
  readStream.on('readable', () => {
    let chunk = '';
    while (null !== (chunk = readStream.read(16))) {
      chaosBuf_ECB = Buffer.concat([
        chaosBuf_ECB,
        chaosCrypt(chunk, X_ECB, AES_ECB)
      ]);

      step++;
      X_ECB = chaos.runChaos(step, X_ECB);
    }
  });
  readStream.on('end', () => {
    outputImg(chaosBuf_ECB, img, 'chaos_ECB');
  });
});

// CHAOS_CBC 解密部分
jimp.read(inputPath + '/chaos_CBC/' + inputFileName, (err, img) => {
  if (err) throw err;

  const orgBuf = inputImg(img);
  let X_CBC = Array.from(X);
  let step = chaosInitStep;

  let chaosBuf_CBC = Buffer.alloc(0);
  const readStream = streamifier.createReadStream(orgBuf);
  readStream.on('readable', () => {
    let chunk = '';
    while (null !== (chunk = readStream.read(16))) {
      chaosBuf_CBC = Buffer.concat([
        chaosBuf_CBC,
        chaosCrypt(chunk, X_CBC, AES_CBC)
      ]);

      step++;
      X_CBC = chaos.runChaos(step, X_CBC);
    }
  });
  readStream.on('end', () => {
    outputImg(chaosBuf_CBC, img, 'chaos_CBC');
  });
});

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
const outputImg = (data, img, name) => {
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

// 混沌解密Function
const chaosCrypt = (data, x, aesMethod) => {
  return aesMethod.decryp(data, Buffer.from(new String(x[0])));
};

// AES解密Function
const aesCrypt = (data, key, aesMethod) => {
  return aesMethod.decryp(data, Buffer.from(new String(key)));
};
