const jimp = require('jimp');
const fs = require('fs');
const AES256 = require('./models/aes256_model.js');
const Chaos = require('./models/HENMAP_chaos_model.js');
const streamifier = require('streamifier');

const chaos = new Chaos(0.1, [-0.3, 0.02]);
//const iv = Buffer.from(['0x00', '0x11', '0x22', '0x33', '0x44', '0x55', '0x66', '0x77', '0x88', '0x99', '0xaa', '0xbb', '0xcc', '0xdd', '0xee', '0xff']);
const AES = new AES256('aes-256-ecb');

const imgNum = 50;
const fileName = 'img';
const fileExtension = '.png';

const inputPath = './cryptFile/org/';
const outputAesPath = './cryptFile/enc/';
const outputChaosPath = './cryptFile/enc/';

for (let i = 22; i < 23; i++) {
  const bufferAesData = fs.createWriteStream(
    'C:/NIST/data/img/bufAesData.txt',
    { flags: 'a' }
  );
  const bufferChaosData = fs.createWriteStream(
    'C:/NIST/data/img/bufChaosData.txt',
    { flags: 'a' }
  );
  let inputFileName = fileName + i + fileExtension;

  jimp.read(inputPath + inputFileName, (err, img) => {
    if (err) throw err;

    console.log(inputFileName + ' start!');

    const readStream = streamifier.createReadStream(img.bitmap.data);
    let count = 0;
    let aesBuf = Buffer.alloc(0);
    let cryptBuf = Buffer.alloc(0);
    readStream.on('readable', () => {
      let chunk = '';
      while (null !== (chunk = readStream.read(16))) {
        count++;

        let ae = aes(chunk);
        let cry = crypt(chunk, count);

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
      console.log(aesBuf);
      console.log(aesBuf.length);
      console.log(cryptBuf);
      console.log(cryptBuf.length);

      console.log(inputFileName + ' end!');

      bufferAesData.write(aesBuf);
      bufferAesData.end();
      bufferChaosData.write(cryptBuf);
      bufferChaosData.end();

      X = [0.5, -0.3, 0.4];

      img.bitmap.data = aesBuf;
      img.write(outputAesPath + '/aes/' + inputFileName);
      img.bitmap.data = cryptBuf;
      img.write(outputChaosPath + '/chaos/' + inputFileName);
    });
  });
}

let X = [0.18, -1.01, 2.1];
let crypt = (data, i) => {
  X = chaos.runChaos(i, X);

  let buf1 = Buffer.alloc(8);
  let buf2 = Buffer.alloc(8);
  buf1.writeDoubleBE(X[0]);
  buf2.writeDoubleBE(X[1]);
  let sourceKey = Buffer.concat([buf1, buf2], 16);

  let encdata = AES.encryp(data, sourceKey);
  return encdata;
};

let aes = data => {
  let buf1 = Buffer.alloc(8);
  let buf2 = Buffer.alloc(8);
  buf1.writeDoubleBE(0.5);
  buf2.writeDoubleBE(-0.3);

  let sourceKey = Buffer.concat([buf1, buf2], 16);

  let encdata = AES.encryp(data, sourceKey);
  return encdata;
};
