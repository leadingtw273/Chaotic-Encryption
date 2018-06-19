const fs = require('fs');
const Chaos = require('./models/HENMAP_chaos_model.js');
const AES256 = require('./models/aes256_model.js');

//const infileName = './Input.txt';
const infileName = './500.jpg';
const aesfileName = 'C:/NIST/data/aesOutput.txt';
const aesfileName_hsah = 'C:/NIST/data/aesOutput_hash.txt';
const chaosfileName = 'C:/NIST/data/chaosOutput.txt';
const chaosfileName_hash = 'C:/NIST/data/chaosOutput_hash.txt';

const chaos = new Chaos(0.1, [-0.3, 0.02]);
const AES = new AES256('sha256', 'aes-256-ecb');

const readStream = fs.createReadStream(infileName);

const wChaosStream = fs.createWriteStream(chaosfileName);
const wAesStream = fs.createWriteStream(aesfileName);

const wChaosStream_hash = fs.createWriteStream(chaosfileName_hash);
const wAesStream_hash = fs.createWriteStream(aesfileName_hsah);

let X = [0.5, -0.3, 0.4];

let count = 0;
let chunk = '';

//readStream.setEncoding('UTF8');

readStream.on('readable', () => {
  while (null !== (chunk = readStream.read(5))) {
    count++;
    
    console.log(chunk + ' = ' + count);

    wAesStream.write(aes(chunk,false), 'UTF8');
    wChaosStream.write(crypt(chunk, count,false), 'UTF8');
    
    wAesStream_hash.write(aes(chunk,true), 'UTF8');
    wChaosStream_hash.write(crypt(chunk, count,true), 'UTF8');
  }
});
readStream.on('end', () => writeS());
readStream.on('error', err => console.log(err.strck));

let writeS = () => {

  wAesStream.end();
  wAesStream.on('finish', () => console.log('AES輸出完成'));
  wAesStream.on('error', err => console.log(err.stack));

  wChaosStream.end();
  wChaosStream.on('finish', () => console.log('CHAOS輸出完成'));
  wChaosStream.on('error', err => console.log(err.stack));
  
  wAesStream_hash.end();
  wAesStream_hash.on('finish', () => console.log('AES have hash輸出完成'));
  wAesStream_hash.on('error', err => console.log(err.stack));

  wChaosStream_hash.end();
  wChaosStream_hash.on('finish', () => console.log('CHAOS have hash輸出完成'));
  wChaosStream_hash.on('error', err => console.log(err.stack));
};

let crypt = (data, i,dohash) => {

  X = chaos.runChaos(i, X);
  let sourceKey = X[0];

  if(dohash){
    AES.setKey(sourceKey.toFixed(6));
  }else{
    AES.setNoHashKey(sourceKey.toFixed(6));
  }

  let encdata = AES.encryp(data);
  let procdata = proc(encdata);
  return procdata;
};

let aes = (data,dohash) => {

  let sourceKey = 1.63;
  if(dohash){
    AES.setKey(sourceKey.toFixed(6));
  }else{
    AES.setNoHashKey(sourceKey.toFixed(6));
  }
  let encdata = AES.encryp(data);
  let procdata = proc(encdata);
  return procdata;
};

let proc = (_str) => {

  let str = _str, result = '';

  let n = 32;//指定第n位换行

  let sd = {
    0:'0000',
    1:'0001',
    2:'0010',
    3:'0011',
    4:'0100',
    5:'0101',
    6:'0110',
    7:'0111',
    8:'1000',
    9:'1001',
    a:'1010',
    b:'1011',
    c:'1100',
    d:'1101',
    e:'1110',
    f:'1111'
  };

  for (let i = 0; i < str.length; i++) {

    result += sd[str[i]];
    if ((i + 1) % n == 0) result += '   \n';

  }
  return result;
};