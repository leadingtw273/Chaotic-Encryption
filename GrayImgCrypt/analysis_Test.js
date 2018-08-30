const jimp = require('jimp');
const fs = require('fs');

const fileName = 'lena512';
const fileExtension = '.png';

const imageHW = 512; // 圖片長寬
const reportPath = `./reportFile/${fileName}`; // 分析表存放路徑

// const typeFile = 'aes_ECB';
// const typeFile = 'aes_CBC';
// const typeFile = 'chaos_ECB';
const typeFile = 'chaos_CBC';
const inputPath = `./cryptFile/enc/${typeFile}/`;

// const typeFile = 'org';
// const inputPath = `./cryptFile/${typeFile}/`;

let inputFileName = fileName + fileExtension;

jimp.read(inputPath + inputFileName, (err, img) => {
  if (err) throw err;

  class CCA {
    constructor(args) {
      // HOR: 水平, VER: 垂直, DIA: 斜角
      let def = {
        round: 6,
        typeFile: 'default',
        fileName: 'test',
        reportPath: './'
      };
      Object.assign(this, def, args);

      try {
        this.reportPath = this.reportPath + '/CCA';
        fs.accessSync(this.reportPath, fs.constants.F_OK);
      } catch (err) {
        fs.mkdirSync(this.reportPath);
      }

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

      let Data = {
        HOR: {
          A: deepCopy(arrayData),
          B: deepCopy(arrayData)
        },
        VER: {
          A: deepCopy(arrayData),
          B: deepCopy(arrayData)
        },
        DIA: {
          A: deepCopy(arrayData),
          B: deepCopy(arrayData)
        }
      };

      for (let i = 0; i < 512; i++) {
        Data.HOR.A[i].pop();
        Data.HOR.B[i].shift();

        Data.DIA.A[i].pop();
        Data.DIA.B[i].shift();
      }

      Data.VER.A.pop();
      Data.VER.B.shift();

      Data.DIA.A.pop();
      Data.DIA.B.shift();

      const HOR = this.compute(Data.HOR.A, Data.HOR.B);
      const VER = this.compute(Data.VER.A, Data.VER.B);
      const DIA = this.compute(Data.DIA.A, Data.DIA.B);

      const rData = {
        HOR,
        VER,
        DIA
      };

      this.ouputCSV(Data);

      return rData;
    }
    compute(dataA, dataB) {
      return (this.cov(dataA, dataB) / (Math.sqrt(this.D(dataA)) * Math.sqrt(this.D(dataB)))).toFixed(this.round);
    }
    ouputCSV(Data) {
      // 輸出csv檔
      const dataHOR_A = Data.HOR.A.reduce((a, b) => a.concat(b), []);
      const dataHOR_B = Data.HOR.B.reduce((a, b) => a.concat(b), []);
      const dataVER_A = Data.VER.A.reduce((a, b) => a.concat(b), []);
      const dataVER_B = Data.VER.B.reduce((a, b) => a.concat(b), []);
      const dataDIA_A = Data.DIA.A.reduce((a, b) => a.concat(b), []);
      const dataDIA_B = Data.DIA.B.reduce((a, b) => a.concat(b), []);

      let writeStream = fs.createWriteStream(this.reportPath + `/${this.typeFile}_CCA.csv`);
      writeStream.write('INDEX,HOR_dataA,HOR_dataB,VER_dataA,VER_dataB,DIA_dataA,DIA_dataB\n');

      for (let i = 0; i < (dataHOR_A.length); i++) {
        writeStream.write(`${i},` +
          `${(dataHOR_A[i] !== undefined) ? dataHOR_A[i] : ''},` +
          `${(dataHOR_B[i] !== undefined) ? dataHOR_B[i] : ''},` +
          `${(dataVER_A[i] !== undefined) ? dataVER_A[i] : ''},` +
          `${(dataVER_B[i] !== undefined) ? dataVER_B[i] : ''},` +
          `${(dataDIA_A[i] !== undefined) ? dataDIA_A[i] : ''},` +
          `${(dataDIA_B[i] !== undefined) ? dataDIA_B[i] : ''}\n`);
      }
    }
  }

  class IE {
    constructor(args) {
      let def = {
        total: 256 * 256,
        GRAYSCALE: 256,
        round: 6,
        typeFile: 'default',
        reportPath: './'
      };
      Object.assign(this, def, args);

      try {
        this.reportPath = this.reportPath + '/IE';
        fs.accessSync(this.reportPath, fs.constants.F_OK);
      } catch (err) {
        fs.mkdirSync(this.reportPath);
      }
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
      let writeStream = fs.createWriteStream(this.reportPath + `/${this.typeFile}.csv`);
      writeStream.write(`${this.typeFile}_gray_value, ${this.typeFile}_count \n`);
      arr.forEach((ele, index) => {
        writeStream.write(`${index}, ${ele} \n`);
      });

      return -(avg).toFixed(this.round);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////

  // 宣告圖片二維陣列
  let arrayData = new Array(imageHW);
  for (let i = 0; i < imageHW; i++) {
    arrayData[i] = new Array(imageHW);
  }

  // 掃描整張圖片取出像素
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
    arrayData[y][x] = img.bitmap.data[idx + 0];
    // console.log(`total: ${(idx / (512 * 512 * 4) * 100).toFixed(3)} %, idx: ${ idx }, [x, y]: [${ x }, ${ y }], gray: ${ img.bitmap.data[idx + 0] } `);
  });

  // 建立資料夾
  try {
    fs.accessSync(reportPath, fs.constants.F_OK);
  } catch (err) {
    fs.mkdirSync(reportPath);
  }

  // HOR: 水平, VER: 垂直, DIA: 斜角
  const cca = new CCA({ round: 6, typeFile, fileName, reportPath });
  const ie = new IE({ typeFile, total: imageHW * imageHW, fileName, reportPath });

  console.log(typeFile);
  console.log('CCA_HOR: ', cca.r(arrayData));
  console.log('IE: ', ie.H(arrayData));

  ////////////////////////////////////////////////////////////////////////////////////

});
