const fs = require('fs');
const Chaos = require('./models/HENMAP_chaos_model.js');
const AES256 = require('./models/aes256_model.js');

const chaos = new Chaos(0.1, [-0.3, 0.02]);
const AES = new AES256('sha256', 'aes-256-ecb');

const inputFileName = '500.jpg';
const outputAesFileName = 'enc_aes_500.txt';
const outputChaosFileName = 'enc_chaos_500.txt';

const readStream = fs.createReadStream('./cryptFile/org/' + inputFileName);

const wAesImgStream = fs.createWriteStream('./cryptFile/enc/' + outputAesFileName);
const wChaosImgStream = fs.createWriteStream('./cryptFile/enc/' + outputChaosFileName);

//readStream.setEncoding('UTF8');

let count = 0;
let chunk = '';
readStream.on('readable', () => {
  while (null !== (chunk = readStream.read(16))) {
    count++;

    let cry = crypt(chunk, count, true);
    let ae = aes(chunk, true);

    console.log('==================================');
    console.log(chunk);
    console.log(chunk.length);
    console.log('--------------------');
    console.log(cry);
    console.log(cry.length);

    if (chunk.length%16 != 0) {
      wAesImgStream.write(chunk);
      wChaosImgStream.write(chunk);
    } else {
      wAesImgStream.write(ae);
      wChaosImgStream.write(cry);
    }

  }
});
readStream.on('end', () => writeS());
readStream.on('error', err => console.log(err.strck));

let writeS = () => {

  wChaosImgStream.end();
  wChaosImgStream.on('finish', () => console.log('CHAOS輸出完成'));
  wChaosImgStream.on('error', err => console.log(err.stack));

  wAesImgStream.end();
  wAesImgStream.on('finish', () => console.log('AES輸出完成'));
  wAesImgStream.on('error', err => console.log(err.stack));

};

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
