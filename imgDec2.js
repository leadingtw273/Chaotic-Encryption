const jimp = require('jimp');
const AES256 = require('./models/aes256_model.js');
const Chaos = require('./models/HENMAP_chaos_model.js');
const streamifier = require('streamifier');

const chaos = new Chaos(0.1, [-0.3, 0.02]);
const AES = new AES256('sha256', 'aes-256-ecb');

const fileName = 'img';
const fileExtension = '.png';

const inputFileName = fileName + fileExtension;

const inputAesPath = './cryptFile/enc/';
const inputChaosPath = './cryptFile/enc/';
const outputAesPath = './cryptFile/dec/';
const outputChaosPath = './cryptFile/dec/';

jimp.read(inputAesPath + 'enc_aes_' + inputFileName, (err, img) => {
  if (err) throw err;

  console.log(img.bitmap.data);

  const readStream = streamifier.createReadStream(img.bitmap.data);
  let chunk = '';
  let aesBuf = Buffer.alloc(0);
  readStream.on('readable', () => {
    while (null !== (chunk = readStream.read(16))) {

      let ae = aes(chunk, true);

      if (chunk.length % 16 != 0) {
        aesBuf = Buffer.concat([aesBuf, chunk]);
      } else {
        aesBuf = Buffer.concat([aesBuf, ae]);
      }

    }
  });
  readStream.on('end', () => {
    img.bitmap.data = aesBuf;
    img.write(outputAesPath + 'dec_aes_' + inputFileName);
  });

});

jimp.read(inputChaosPath + 'enc_chaos_' + inputFileName, (err, img) => {
  if (err) throw err;

  console.log(img.bitmap.data);

  const readStream = streamifier.createReadStream(img.bitmap.data);
  let chunk = '';
  let count = 0;
  let cryptBuf = Buffer.alloc(0);
  readStream.on('readable', () => {
    while (null !== (chunk = readStream.read(16))) {
      count++;

      let cry = crypt(chunk, count, true);

      if (chunk.length % 16 != 0) {
        cryptBuf = Buffer.concat([cryptBuf, chunk]);
      } else {
        cryptBuf = Buffer.concat([cryptBuf, cry]);
      }

    }
  });
  readStream.on('end', () => {
    img.bitmap.data = cryptBuf;
    img.write(outputChaosPath + 'dec_chaos_' + inputFileName);
  });

});

let X = [0.5, -0.3, 0.4];
let crypt = (data, i, dohash) => {

  X = chaos.runChaos(i, X);
  let sourceKey = X[0];

  if (dohash) {
    AES.setKey(sourceKey.toFixed(6));
  } else {
    AES.setNoHashKey(sourceKey.toFixed(6));
  }

  let encdata = AES.decryp(data);
  return encdata;
};

let aes = (data, dohash) => {

  let sourceKey = 1.63;
  if (dohash) {
    AES.setKey(sourceKey.toFixed(6));
  } else {
    AES.setNoHashKey(sourceKey.toFixed(6));
  }
  let encdata = AES.decryp(data);
  return encdata;
};