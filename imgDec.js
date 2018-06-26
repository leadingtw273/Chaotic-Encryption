const jimp = require('jimp');
const AES256 = require('./models/aes256_model.js');
const Chaos = require('./models/HENMAP_chaos_model.js');
const streamifier = require('streamifier');

const chaos = new Chaos(0.1, [-0.3, 0.02]);
const AES = new AES256('aes-256-ecb');

const fileName = 'img25';
const fileExtension = '.png';

const inputFileName = fileName + fileExtension;

const inputAesPath = './cryptFile/enc/';
const inputChaosPath = './cryptFile/enc/';
const outputAesPath = './cryptFile/dec/';
const outputChaosPath = './cryptFile/dec/';

jimp.read(inputAesPath + '/aes/' + inputFileName, (err, img) => {
  if (err) throw err;

  console.log(img.bitmap.data);

  const readStream = streamifier.createReadStream(img.bitmap.data);
  let aesBuf = Buffer.alloc(0);
  readStream.on('readable', () => {
    let chunk = '';
    while (null !== (chunk = readStream.read(16))) {

      let ae = aes(chunk);

      if (chunk.length % 16 != 0) {
        aesBuf = Buffer.concat([aesBuf, chunk]);
      } else {
        aesBuf = Buffer.concat([aesBuf, ae]);
      }

    }
  });
  readStream.on('end', () => {
    img.bitmap.data = aesBuf;
    img.write(outputAesPath + '/aes/' + inputFileName);
  });

});

jimp.read(inputChaosPath + '/chaos/' + inputFileName, (err, img) => {
  if (err) throw err;

  console.log(img.bitmap.data);

  const readStream = streamifier.createReadStream(img.bitmap.data);
  let count = 0;
  let cryptBuf = Buffer.alloc(0);
  readStream.on('readable', () => {
    let chunk = '';
    while (null !== (chunk = readStream.read(16))) {
      count++;

      let cry = crypt(chunk, count);

      if (chunk.length % 16 != 0) {
        cryptBuf = Buffer.concat([cryptBuf, chunk]);
      } else {
        cryptBuf = Buffer.concat([cryptBuf, cry]);
      }

    }
  });
  readStream.on('end', () => {
    img.bitmap.data = cryptBuf;
    img.write(outputChaosPath + '/chaos/' + inputFileName);
  });

});

let X = [0.5, -0.3, 0.4];
let crypt = (data, i) => {

  X = chaos.runChaos(i, X);

  let buf1 = Buffer.alloc(8);
  let buf2 = Buffer.alloc(8);
  buf1.writeDoubleBE(X[0]);
  buf2.writeDoubleBE(X[1]);
  let sourceKey = Buffer.concat([buf1, buf2], 16);

  let encdata = AES.decryp(data, sourceKey);
  return encdata;
};

let aes = (data) => {

  let buf1 = Buffer.alloc(8);
  let buf2 = Buffer.alloc(8);
  buf1.writeDoubleBE(0.5);
  buf2.writeDoubleBE(-0.3);

  let sourceKey = Buffer.concat([buf1, buf2], 16);

  let encdata = AES.decryp(data, sourceKey);
  return encdata;
};