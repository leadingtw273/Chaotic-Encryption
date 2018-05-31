const fs = require('fs');
const Chaos = require('./models/chaos_model.js');
const AES256 = require('./models/aes256_model.js');
const bs = require('./models/bitset_model.js');

const infileName = './Input.txt';
const outfileName = './outInput.txt'

const chaos = new Chaos(0.1, [-0.3, 0.02]);
const AES = new AES256('sha256', 'aes-256-ecb');

let X = [0.5, -0.3, 0.4];

let readStream = fs.createReadStream(infileName);
let writeStream = fs.createWriteStream(outfileName);

let count = 0;

readStream.setEncoding('UTF8');

readStream.on('readable', () => {
  while (null !== (chunk = readStream.read(5))) {
    count++;
    console.log(readStream.bytesRead + ' = ' + count);
    writeStream.write(huanhang(crypt(chunk, count)), "UTF8");
  }
});
readStream.on('end', () => writeS());
readStream.on("error", err => console.log(err.strck));

let writeS = dataS => {

  writeStream.end();

  writeStream.on("finish", () => console.log("輸出完成"));
  writeStream.on("error", err => console.log(err.stack));
}

let crypt = (data, i) => {

  X = chaos.runChaos(i, X);
  sourceKey = X[0];
  AES.setNoHashKey(sourceKey.toFixed(6));

  return bs.toBinary(AES.encryp(data));
};

let huanhang = (_str) => {

  let str = _str, result = "";

  let n = 25;//指定第n位换行

  for (let i = 0; i < str.length; i++) {

    result += str[i];
    if ((i + 1) % n == 0)
      result += "\n";

  }
  return result;
};