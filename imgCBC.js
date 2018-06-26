const jimp = require('jimp');
const fs = require('fs');
const AES256 = require('./models/aes256_model.js');

//const iv = Buffer.from(['0x00', '0x11', '0x22', '0x33', '0x44', '0x55', '0x66', '0x77', '0x88', '0x99', '0xaa', '0xbb', '0xcc', '0xdd', '0xee', '0xff']);
const AES = new AES256('aes-256-cbc');

const imgNum = 50;
const fileName = 'img';
const fileExtension = '.png';

const inputPath = './cryptFile/org/';
const outputAesPath = './cryptFile/enc/cbc';

for (let i = 0; i < imgNum; i++) {
  const bufferAesData = fs.createWriteStream('C:/NIST/data/img/bufAesDataCBC.txt', { flags: 'a' });
  let inputFileName = fileName + i + fileExtension;

  jimp.read(inputPath + inputFileName, (err, img) => {
    if (err) throw err;

    console.log(inputFileName + ' start!');
    
    img.bitmap.data = aes(img.bitmap.data);      
    bufferAesData.write(img.bitmap.data);
    bufferAesData.end();
    img.write(outputAesPath + '/aes/' + inputFileName);

  });
}

let aes = (data) => {

  let buf1 = Buffer.alloc(8);
  let buf2 = Buffer.alloc(8);
  buf1.writeDoubleBE(0.5);
  buf2.writeDoubleBE(-0.3);

  let sourceKey = Buffer.concat([buf1, buf2], 16);

  let encdata = AES.encryp(data, sourceKey);
  return encdata;
};