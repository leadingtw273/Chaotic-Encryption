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
const CHAOS_INIT_VALUE = [0.123, 0.456, 0.789];
const CHAOS_INIT_STEP = 1000;
const chaos = new Chaos(0.1, [0.2, 0.3]);

// 圖片檔名設置
const fileName = 'img0';
const fileExtension = '.png';
const inputFileName = fileName + fileExtension;

// 圖片路徑設置
const inputPath = './cryptFile/org/';
const outputPath = './cryptFile/enc/';

// 排除初始影響
const chaosInit = (initValue, timeStep) => {
  let step = 0;
  let finValue = initValue;
  while (step < timeStep) {
    finValue = chaos.runChaos(step, finValue);
    step++;
  }
  return finValue;
};

// CHAOS 金鑰設置 使用[let]代表其值將會隨成是執行而改變
let chaosKey = chaosInit(CHAOS_INIT_VALUE, CHAOS_INIT_STEP);
// AES金鑰設置 使用[const]代表其值將無法做任何改變
const aesKey = chaosInit(CHAOS_INIT_VALUE, CHAOS_INIT_STEP);

// 讀取圖像像素
jimp.read(inputPath + inputFileName, (err, img) => {
  if (err) throw err;

  // 取得原圖像素buffer
  const orgPixBuf = inputImg(img);

  // AES加密
  const aesBuf_ECB = dataCrypt(orgPixBuf, aesKey, AES_ECB);
  const aesBuf_CBC = dataCrypt(orgPixBuf, aesKey, AES_CBC);

  // 改良式AES加密
  let chaosBuf_ECB = Buffer.alloc(0);
  let chaosBuf_CBC = Buffer.alloc(0);
  let chaosStep = CHAOS_INIT_STEP;
  let cbcXorData = iv;

  // 創建讀取資料流
  const readStream = streamifier.createReadStream(orgPixBuf);

  readStream.on('readable', () => {
    let chunk = '';
    // 明文區塊分割，每16byte(128bit)
    while (null !== (chunk = readStream.read(16))) {
      // ECB 區塊加密
      const chunk_ECB_data = dataCrypt(chunk, chaosKey, AES_ECB);

      // CBC 區塊加密
      cbcXorData = xor(cbcXorData, chunk); // 執行XOR運算，此為CBC
      cbcXorData = dataCrypt(cbcXorData, chaosKey, AES_ECB);
      const chunk_CBC_data = cbcXorData;

      // 將密文區塊串接
      chaosBuf_ECB = Buffer.concat([chaosBuf_ECB, chunk_ECB_data]);
      chaosBuf_CBC = Buffer.concat([chaosBuf_CBC, chunk_CBC_data]);

      // 混沌金鑰運算
      chaosStep++;
      chaosKey = chaos.runChaos(chaosStep, chaosKey);
    }
  });

  readStream.on('end', () => {
    // 測試算法是否正確
    console.log(inputFileName + ' fin');
    console.log(aesBuf_ECB.equals(chaosBuf_ECB));
    console.log(aesBuf_CBC.equals(chaosBuf_CBC));

    // 輸出圖像檔
    outputImg(aesBuf_ECB, img, 'aes_ECB', inputFileName);
    outputImg(aesBuf_CBC, img, 'aes_CBC', inputFileName);
    outputImg(chaosBuf_ECB, img, 'chaos_ECB', inputFileName);
    outputImg(chaosBuf_CBC, img, 'chaos_CBC', inputFileName);
  });
});

// 取得圖片上像素資料
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

// XOR運算
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
