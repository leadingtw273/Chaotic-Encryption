const fs = require('fs');
const Chaos = require('./models/HENMAP_chaos_model.js');
const AES256 = require('./models/aes256_model.js');

const infileName = './Input.txt';
const chaosfileName = 'C:/NIST/data/chaosOutput.txt';
const aesfileName = 'C:/NIST/data/aesOutput.txt';

const chaos = new Chaos(0.1, [-0.3, 0.02]);
const AES = new AES256('sha256', 'aes-256-ecb');

let X = [0.5, -0.3, 0.4];

let readStream = fs.createReadStream(infileName);
let wChaosStream = fs.createWriteStream(chaosfileName);
let wAesStream = fs.createWriteStream(aesfileName);

let count = 0;

readStream.setEncoding('UTF8');

readStream.on('readable', () => {
  while (null !== (chunk = readStream.read(5))) {
    count++;
    console.log(readStream.bytesRead + ' = ' + count);
    wAesStream.write(aes(chunk), "UTF8");
    wChaosStream.write(crypt(chunk, count), "UTF8");
  }
});
readStream.on('end', () => writeS());
readStream.on("error", err => console.log(err.strck));

let writeS = dataS => {
  wAesStream.end();
  wAesStream.on("finish", () => console.log("AES輸出完成"));
  wAesStream.on("error", err => console.log(err.stack));

  wChaosStream.end();
  wChaosStream.on("finish", () => console.log("CHAOS輸出完成"));
  wChaosStream.on("error", err => console.log(err.stack));
}

let crypt = (data, i) => {

  X = chaos.runChaos(i, X);
  sourceKey = X[0];
  AES.setNoHashKey(sourceKey.toFixed(6));
  let encdata = AES.encryp(data);
  let procdata = proc(encdata);
  return procdata;
};

let aes = (data) => {

  sourceKey = 1.63;
  AES.setNoHashKey(sourceKey.toFixed(6));
  let encdata = AES.encryp(data);
  let procdata = proc(encdata);
  return procdata;
};

let proc = (_str) => {

  let str = _str, result = "";

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
    if ((i + 1) % n == 0) result += "   \n";

  }
  return result;
};