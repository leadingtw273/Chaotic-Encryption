const fs = require('fs');
const Chaos = require('./models/HENMAP_chaos_model.js');
const AES256 = require('./models/aes256_model.js');

const chaos = new Chaos(0.1, [-0.3, 0.02]);
const AES = new AES256('sha256', 'aes-256-ecb');

const inputAesFileName = 'enc_aes_5000.txt';
const inputChaosFileName = 'enc_chaos_5000.txt';
const outputAesFileName = 'dec_aes_5000.jpg';
const outputChaosFileName = 'dec_chaos_5000.jpg';

const rAesStream = fs.createReadStream('./cryptFile/enc/' + inputAesFileName);
const rChaosStream = fs.createReadStream('./cryptFile/enc/' + inputChaosFileName);

const wAesImgStream = fs.createWriteStream('./cryptFile/dec/' + outputAesFileName);
const wChaosImgStream = fs.createWriteStream('./cryptFile/dec/' + outputChaosFileName);

//readStream.setEncoding('UTF8');

let count = 0;
let chunk = '';
rChaosStream.on('readable', () => {
  while (null !== (chunk = rChaosStream.read(64))) {
    count++;

    let cry = crypt(chunk.toString(),count,true);

    let bufCh = '';
    let bufAr = [];
    for(let i = 0; i<cry.length; i++){
      bufCh += cry[i];
      if(bufCh.length >= 2 ){
        bufCh = '0x'.concat(bufCh);
        bufAr.push(bufCh);
        bufCh = '';
      }
    }
    let buf = Buffer.from(bufAr);

    console.log('============================');
    console.log(chunk.toString());
    console.log(chunk.toString().length);
    console.log('--------------------');
    console.log(cry);
    console.log(cry.length);
    console.log('--------------------');
    console.log(buf);
    console.log(buf.length);

    wChaosImgStream.write(buf);
    
  }
});
rChaosStream.on('end', () => chaosWriteS());
rChaosStream.on('error', err => console.log(err.strck));

rAesStream.on('readable', () => {
  while (null !== (chunk = rAesStream.read(64))) {
    
    let ae = aes(chunk.toString(),true);

    let bufCh = '';
    let bufAr = [];
    for(let i = 0; i<ae.length; i++){
      bufCh += ae[i];
      if(bufCh.length >= 2 ){
        bufCh = '0x'.concat(bufCh);
        bufAr.push(bufCh);
        bufCh = '';
      }
    }
    let buf = Buffer.from(bufAr);
    
    wAesImgStream.write(buf);
    
  }
});
rAesStream.on('end', () => aesWriteS());
rAesStream.on('error', err => console.log(err.strck));

let aesWriteS = () => {

  wAesImgStream.end();
  wAesImgStream.on('finish', () => console.log('AES輸出完成'));
  wAesImgStream.on('error', err => console.log(err.stack));
  
};

let chaosWriteS = () => {

  wChaosImgStream.end();
  wChaosImgStream.on('finish', () => console.log('CHAOS輸出完成'));
  wChaosImgStream.on('error', err => console.log(err.stack));
  
};

let X = [0.5, -0.3, 0.4];
let crypt = (data, i,dohash) => {

  X = chaos.runChaos(i, X);
  let sourceKey = X[0];

  if(dohash){
    AES.setKey(sourceKey.toFixed(6));
  }else{
    AES.setNoHashKey(sourceKey.toFixed(6));
  }

  let encdata = AES.decryp(data);
  return encdata;
};

let aes = (data,dohash) => {

  let sourceKey = 1.63;
  if(dohash){
    AES.setKey(sourceKey.toFixed(6));
  }else{
    AES.setNoHashKey(sourceKey.toFixed(6));
  }
  let encdata = AES.decryp(data);
  return encdata;
};
