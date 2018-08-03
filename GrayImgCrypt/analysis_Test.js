const jimp = require('jimp');
const fs = require('fs');

const fileName = 'lena256';
const fileExtension = '.png';

// const typeFile = 'aes_ECB';
// const typeFile = 'aes_CBC';
// const typeFile = 'chaos_ECB';
const typeFile = 'chaos_CBC';
const inputPath = `./cryptFile/enc/${typeFile}/`;

// const typeFile = 'org';
// const inputPath = './cryptFile/org/';

let inputFileName = fileName + fileExtension;

jimp.read(inputPath + inputFileName, (err, img) => {
  if (err) throw err;

  class CCA {
    constructor(args) {
      // HOR: 水平, VER: 垂直, DIA: 斜角
      let def = {
        model: 'HOR',
        round: 4,
        fileName: 'default'
      };
      Object.assign(this, def, args);
    }
    E(arrayData) {
      let sizeX = arrayData[0].length;
      let sizeY = arrayData.length;

      let total = arrayData
        .reduce((acc, cur) => acc.concat(cur), [])
        .reduce((prev, curr) => prev + curr);

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
          total = total + ((dataA[y][x] - EofDataA) * (dataB[y][x] - EofDataB));
        }
      }

      return (total / (sizeX * sizeY)).toFixed(this.round);
    }
    r(arrayData) {
      // 深層複製
      function deepCopy(obj) {
        if (typeof obj !== 'object') return;
        let str = JSON.stringify(obj);
        return JSON.parse(str);
      }
      let dataA = deepCopy(arrayData);
      let dataB = deepCopy(arrayData);

      // 選擇模式
      switch (this.model) {
        case 'HOR':
          for (let i = 0; i < dataA.length; i++) {
            dataA[i].pop();
            dataB[i].shift();
          }
          break;
        case 'VER':
          dataA.pop();
          dataB.shift();
          break;
        case 'DIA':
          for (let i = 0; i < dataA.length; i++) {
            dataA[i].pop();
            dataB[i].shift();
          }
          dataA.pop();
          dataB.shift();
          break;
      }

      // 輸出csv檔
      let writeStream = fs.createWriteStream(`./reportFile/CCA/${this.fileName}_CCA.csv`);
      writeStream.write(`INDEX,${this.fileName}_dataA, ${this.fileName}_dataB \n`);
      for (let X = 0; X < dataA[0].length; X += 1) {
        for (let Y = 0; Y < dataA.length; Y += 1) {
          writeStream.write(`${(X * 256) + Y}, ${dataA[Y][X]}, ${dataB[Y][X]} \n`);

        }
      }

      return (this.cov(dataA, dataB) / (Math.sqrt(this.D(dataA)) * Math.sqrt(this.D(dataB)))).toFixed(this.round);
    }
  }

  class IE {
    constructor(args) {
      let def = {
        total: 256 * 256,
        GRAYSCALE: 256,
        round: 6,
        fileName: 'default'
      };
      Object.assign(this, def, args);
    }
    P(m) {
      return (m / this.total).toFixed(this.round);
    }
    H(arrayData) {

      let arr = [];
      for (let i = 0; i < this.GRAYSCALE; i++) {
        arr.push(0);
      }
      arrayData.forEach(ele1 => {
        ele1.forEach(ele2 => {
          arr[ele2]++;
        });
      });

      let avg = 0;
      arr.forEach(ele => {
        if (ele !== 0) {
          avg = avg + (Number(this.P(ele)) * Math.log2(this.P(ele)));
        }
      });

      // 輸出csv檔
      let writeStream = fs.createWriteStream(`./reportFile/IE/${this.fileName}_IE.csv`);
      writeStream.write(`${this.fileName}_gray_value, ${this.fileName}_count \n`);
      arr.forEach((ele, index) => {
        writeStream.write(`${index}, ${ele} \n`);
      });

      return -(avg).toFixed(this.round);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////

  // 宣告圖片二維陣列
  let arrayData = new Array(256);
  for (let i = 0; i < 256; i++) {
    arrayData[i] = new Array(256);
  }

  // 掃描整張圖片取出像素
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
    arrayData[y][x] = img.bitmap.data[idx + 0];
    // console.log(`total: ${(idx / (512 * 512 * 4) * 100).toFixed(3)} %, idx: ${ idx }, [x, y]: [${ x }, ${ y }], gray: ${ img.bitmap.data[idx + 0] } `);
  });

  console.log(typeFile);
  // HOR: 水平, VER: 垂直, DIA: 斜角
  const cca = new CCA({ model: 'DIA', round: 6, fileName: typeFile });
  console.log('CCA: ', cca.r(arrayData));
  const ie = new IE({ fileName: typeFile });
  console.log('IE: ', ie.H(arrayData));

  ////////////////////////////////////////////////////////////////////////////////////

});
