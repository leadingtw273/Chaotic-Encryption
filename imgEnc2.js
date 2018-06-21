const jimp = require('jimp');
const AES256 = require('./models/aes256_model.js');
const Chaos = require('./models/HENMAP_chaos_model.js');
const streamifier = require('streamifier');

const chaos = new Chaos(0.1, [-0.3, 0.02]);
const AES = new AES256('sha256', 'aes-256-ecb');

const fileName = 'img';
const fileExtension = '.png';

const inputFileName = fileName + fileExtension;

const inputPath = './cryptFile/org/';
const outputPath = './cryptFile/enc/';

jimp.read(inputPath + inputFileName, (err, img) => {
  if (err) throw err;

  console.log(img.bitmap.data);

  const readStream = streamifier.createReadStream(img.bitmap.data);
  let chunk = '';
  let count = 0;
  let aesBuf = Buffer.alloc(0);
  let cryptBuf = Buffer.alloc(0);
  readStream.on('readable', () => {
    while (null !== (chunk = readStream.read(16))) {
      count++;

      // console.log(chunk);
      // let nChunk = chunk.filter((data, index) => {
      //   if ((index + 1) % 4 == 0 ) {
      //     return false;
      //   } else {
      //     return true;
      //   }
      // });
      // console.log(nChunk);
      // console.log(nChunk.length);

      let ae = aes(chunk, true);
      let cry = crypt(chunk, count, true);

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
    console.log(cryptBuf);
    img.bitmap.data = aesBuf;
    img.write(outputPath + 'enc_aes_' + inputFileName);
    img.bitmap.data = cryptBuf;
    img.write(outputPath + 'enc_chaos_' + inputFileName);
  });

  // let count = 0;
  // let aesBuf = this.bitmap.data;
  // let cryptBuf = this.bitmap.data;
  // img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
  //   count++;

  //   let ae = aes(chunk, true);
  //   let cry = crypt(chunk, count, true);

  //   if (chunk.length % 16 != 0) {
  //     aesBuf = Buffer.concat([aesBuf, chunk]);
  //     cryptBuf = Buffer.concat([cryptBuf, chunk]);
  //   } else {
  //     aesBuf = Buffer.concat([aesBuf, ae]);
  //     cryptBuf = Buffer.concat([cryptBuf, cry]);
  //   }

  //   let red = this.bitmap.data[idx + 0];
  //   let green = this.bitmap.data[idx + 1];
  //   let blue = this.bitmap.data[idx + 2];
  //   let alpha = this.bitmap.data[idx + 3];

  //   if (x == img.bitmap.width - 1 &&
  //     y == img.bitmap.height - 1) {
  //     // image scan finished, do your stuff   
  //   }
  // });

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