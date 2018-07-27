const jimp = require('jimp');
// const fs = require('fs');
// const AES256 = require('./models/aes256_model.js');
// const Chaos = require('./models/HENMAP_chaos_model.js');
// const streamifier = require('streamifier');

// const chaos = new Chaos(0.1, [-0.3, 0.02]);
// //const iv = Buffer.from(['0x00', '0x11', '0x22', '0x33', '0x44', '0x55', '0x66', '0x77', '0x88', '0x99', '0xaa', '0xbb', '0xcc', '0xdd', '0xee', '0xff']);
// const AES = new AES256('aes-256-ecb');

const fileName = 'lena';
const fileExtension = '.png';

const inputPath = './cryptFile/org/';
// const outputAesPath = './cryptFile/enc/';
// const outputChaosPath = './cryptFile/enc/';

// const bufferAesData = fs.createWriteStream(
//   'C:/NIST/data/img/bufAesLena.txt',
//   { flags: 'a' }
// );
// const bufferChaosData = fs.createWriteStream(
//   'C:/NIST/data/img/bufChaosLena.txt',
//   { flags: 'a' }
// );
let inputFileName = fileName + fileExtension;

jimp.read(inputPath + inputFileName, (err, img) => {
  if (err) throw err;

  // for (const b of img.bitmap.data.entries()) {
  //   if (b[0] % 4 === 1) {
  //     console.log(b[1]);
  //   }
  // }

  // let CCA = {
  //   E:'',
  //   D:'',
  //   cov:'',
  //   r: ''
  // };

  class CCA {
    constructor(args) {
      // HOR: 水平, VER: 垂直, DIA: 斜角
      let def = {
        model: 'HOR',
        round: 4
      };
      Object.assign(this, def, args);
    }
    E(arrayData) {
      let sizeX = arrayData[0].length;
      let sizeY = arrayData.length;

      let arr = arrayData.reduce((acc, cur) => acc.concat(cur), []);
      let total = arr.reduce((prev, curr) => prev + curr);

      return (total / (sizeX * sizeY)).toFixed(this.round);
    }
    D(arrayData) {
      const e = this.E(arrayData);
      let sizeX = arrayData[0].length;
      let sizeY = arrayData.length;

      let total = 0;
      for (let y = 0; y < sizeY; y++) {
        for (let x = 0; x < sizeX; x++) {
          total = total + Math.pow((arrayData[y][x] - e), 2);

        }
      }

      return (total / (sizeX * sizeY)).toFixed(this.round);
    }
    cov(dataA, dataB) {
      const EofDataA = this.E(dataA);
      const EofDataB = this.E(dataB);
      let sizeX = dataA[0].length;
      let sizeY = dataA.length;

      let total = 0;
      for (let y = 0; y < sizeY; y++) {
        for (let x = 0; x < sizeX; x++) {
          total = total + (dataA[y][x] - EofDataA) * (dataB[y][x] - EofDataB);
        }
      }

      return (total / (sizeX * sizeY)).toFixed(this.round);
    }
    r(arrayData) {
      // HOR
      function deepCopy(obj) {
        if (typeof obj !== 'object') return;
        let str = JSON.stringify(obj);
        return JSON.parse(str);
      }

      let dataA = deepCopy(arrayData);
      let dataB = deepCopy(arrayData);

      switch (this.model) {
        case 'HOR':
          console.log('HOR');
          for (let i = 0; i < dataA.length; i++) {
            dataA[i].pop();
            dataB[i].shift();
          }
          break;
        case 'VER':
          console.log('VER');
          dataA.pop();
          dataB.shift();
          break;
        case 'DIA':
          console.log('DIA');
          for (let i = 0; i < dataA.length; i++) {
            dataA[i].pop();
            dataB[i].shift();
          }
          dataA.pop();
          dataB.shift();
          break;
      }

      return (this.cov(dataA, dataB) / (Math.sqrt(this.D(dataA)) * Math.sqrt(this.D(dataB)))).toFixed(this.round);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////

  let arrayData = new Array(512);
  for (let i = 0; i < 512; i++) {
    arrayData[i] = new Array(512);
  }

  console.log('Scan image start');
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
    arrayData[y][x] = img.bitmap.data[idx + 0];
    // console.log(`total: ${(idx / (512 * 512 * 4) * 100).toFixed(3)} %, idx: ${idx}, [x,y]: [${x},${y}], gray: ${img.bitmap.data[idx + 0]}`);
  });
  console.log('Scan image finish');

  const cca = new CCA({ model: 'DIA' });
  console.log(cca.r(arrayData));

  ////////////////////////////////////////////////////////////////////////////////////

  // const readStream = streamifier.createReadStream(img.bitmap.data);
  // let count = 0;
  // let aesBuf = Buffer.alloc(0);
  // let cryptBuf = Buffer.alloc(0);
  // readStream.on('readable', () => {
  //   let chunk = '';
  //   while (null !== (chunk = readStream.read(16))) {
  //     count++;

  //     let ae = aes(chunk);
  //     let cry = crypt(chunk, count);

  //     if (chunk.length % 16 != 0) {
  //       aesBuf = Buffer.concat([aesBuf, chunk]);
  //       cryptBuf = Buffer.concat([cryptBuf, chunk]);
  //     } else {
  //       aesBuf = Buffer.concat([aesBuf, ae]);
  //       cryptBuf = Buffer.concat([cryptBuf, cry]);
  //     }
  //   }
  // });
  // readStream.on('end', () => {
  //   console.log(aesBuf);
  //   console.log(aesBuf.length);
  //   console.log(cryptBuf);
  //   console.log(cryptBuf.length);

  //   console.log(inputFileName + ' end!');

  //   bufferAesData.write(aesBuf);
  //   bufferAesData.end();
  //   bufferChaosData.write(cryptBuf);
  //   bufferChaosData.end();

  //   X = [0.5, -0.3, 0.4];

  //   img.bitmap.data = aesBuf;
  //   img.write(outputAesPath + '/aes/' + inputFileName);
  //   img.bitmap.data = cryptBuf;
  //   img.write(outputChaosPath + '/chaos/' + inputFileName);
  // });
});

// let X = [0.18, -1.01, 2.1];
// let crypt = (data, i) => {
//   X = chaos.runChaos(i, X);

//   let buf1 = Buffer.alloc(8);
//   let buf2 = Buffer.alloc(8);
//   buf1.writeDoubleBE(X[0]);
//   buf2.writeDoubleBE(X[1]);
//   let sourceKey = Buffer.concat([buf1, buf2], 16);

//   let encdata = AES.encryp(data, sourceKey);
//   return encdata;
// };

// let aes = data => {
//   let buf1 = Buffer.alloc(8);
//   let buf2 = Buffer.alloc(8);
//   buf1.writeDoubleBE(0.5);
//   buf2.writeDoubleBE(-0.3);

//   let sourceKey = Buffer.concat([buf1, buf2], 16);

//   let encdata = AES.encryp(data, sourceKey);
//   return encdata;
// };
