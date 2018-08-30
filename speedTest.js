const AES256 = require('./models/aes256_model');
const Chaos = require('./models/HENMAP_chaos_model.js');
const avg = require('./models/avg_model.js');

const iv = Buffer.from(['0x00', '0x11', '0x22', '0x33', '0x44', '0x55', '0x66', '0x77', '0x88', '0x99', '0xaa', '0xbb', '0xcc', '0xdd', '0xee', '0xff']);
const AES = new AES256('aes-256-cbc', 'sha256', iv);

const chaos = new Chaos(0.00001, [-0.0001, 0.0001]);
let X = [0.054199, 0.213309, -0.602458];

const N = 100;
const detN = 0.1;
const data = '超混沌測試';

let sourceKey = '';
let hashKey = '';
let encData = '';
let decData = '';

let setkeyTime = [];
let chaosTime = [];
let randomTime = [];

let Time_ENC_START = [];
let Time_ENC_END = [];
let Time_DEC_START = [];
let Time_DEC_END = [];

const NS_PER_SEC = 1e9;
const tranNS = (hr) => {
  return hr[0] * NS_PER_SEC + hr[1];
};

for (let i = 1; i <= N; i++) {

  // 固定金鑰----------------------------------
  try {

    Time_ENC_START = process.hrtime();

    sourceKey = 0.123456;
    hashKey = AES.setKey(sourceKey.toFixed(6));
    encData = AES.encryp(Buffer.from(data), Buffer.from(sourceKey.toFixed(6)));

    Time_ENC_END = process.hrtime(Time_ENC_START);

    Time_DEC_START = process.hrtime();

    decData = AES.decryp(Buffer.from(encData), Buffer.from(sourceKey.toFixed(6)));

    Time_DEC_END = process.hrtime(Time_DEC_START);

  }
  catch (e) {
    console.log(`固定金鑰: ${e}`);
  }
  //------------------------------------------

  setkeyTime.push([tranNS(Time_ENC_END) + tranNS(Time_DEC_END), tranNS(Time_ENC_END), tranNS(Time_DEC_END)]);
  console.log('--------------------------------------------------------------------------------------------');
  console.log(`狀態 ( ${i} ) : 固定金鑰`);
  console.log(`金鑰 key \t= ${hashKey}`);
  console.log(`輸入 data  \t= ${data}`);
  console.log(`加密 data  \t= ${encData}`);
  console.log(`解密 data  \t= ${encData}`);
  console.log(`輸出 data  \t= ${decData}`);
  console.log(`time = ${tranNS(Time_ENC_END) + tranNS(Time_DEC_END)} ns, enctime = ${tranNS(Time_ENC_END)} ns, dectime = ${tranNS(Time_DEC_END)} ns`);

  // chaos產生金鑰-----------------------------
  try {

    Time_ENC_START = process.hrtime();
    X = chaos.runChaos(i, X);
    sourceKey = X[0];
    hashKey = AES.setKey(sourceKey.toFixed(6));
    encData = AES.encryp(Buffer.from(data), Buffer.from(sourceKey.toFixed(6)));
    Time_ENC_END = process.hrtime(Time_ENC_START);

    Time_DEC_START = process.hrtime();
    decData = AES.decryp(Buffer.from(encData), Buffer.from(sourceKey.toFixed(6)));
    Time_DEC_END = process.hrtime(Time_DEC_START);

  }
  catch (e) {
    console.log(`chaos產生金鑰: ${e}`);
  }
  //------------------------------------------

  chaosTime.push([tranNS(Time_ENC_END) + tranNS(Time_DEC_END), tranNS(Time_ENC_END), tranNS(Time_DEC_END)]);
  console.log('--------------------------------------------------------------------------------------------');
  console.log(`狀態 ( ${i} ) : chaos產生金鑰`);
  console.log(`金鑰 key \t= ${hashKey}`);
  console.log(`輸入 data  \t= ${data}`);
  console.log(`加密 data  \t= ${encData}`);
  console.log(`解密 data  \t= ${encData}`);
  console.log(`輸出 data  \t= ${decData}`);
  console.log(`time = ${tranNS(Time_ENC_END) + tranNS(Time_DEC_END)} ns, enctime = ${tranNS(Time_ENC_END)} ns, dectime = ${tranNS(Time_DEC_END)} ns`);

  // random產生金鑰----------------------------
  try {

    Time_ENC_START = process.hrtime();
    sourceKey = Math.random() * 2 - 1;
    hashKey = AES.setKey(sourceKey.toFixed(6));
    encData = AES.encryp(Buffer.from(data), Buffer.from(sourceKey.toFixed(6)));
    Time_ENC_END = process.hrtime(Time_ENC_START);

    Time_DEC_START = process.hrtime();
    decData = AES.decryp(Buffer.from(encData), Buffer.from(sourceKey.toFixed(6)));
    Time_DEC_END = process.hrtime(Time_DEC_START);

  }
  catch (e) {
    console.log(`random產生金鑰: ${e}`);
  }
  //------------------------------------------

  randomTime.push([tranNS(Time_ENC_END) + tranNS(Time_DEC_END), tranNS(Time_ENC_END), tranNS(Time_DEC_END)]);
  console.log('--------------------------------------------------------------------------------------------');
  console.log(`狀態 ( ${i} ) : random產生金鑰`);
  console.log(`金鑰 key \t= ${hashKey}`);
  console.log(`輸入 data  \t= ${data}`);
  console.log(`加密 data  \t= ${encData}`);
  console.log(`解密 data  \t= ${encData}`);
  console.log(`輸出 data  \t= ${decData}`);
  console.log(`time = ${tranNS(Time_ENC_END) + tranNS(Time_DEC_END)} ns, enctime = ${tranNS(Time_ENC_END)} ns, dectime = ${tranNS(Time_DEC_END)} ns`);

}

avg.init(N, detN);
setkeyTime = avg.avgTime(setkeyTime);
chaosTime = avg.avgTime(chaosTime);
randomTime = avg.avgTime(randomTime);

console.log('=========================================================================');
console.log(`setKEY: \t time = ${setkeyTime[0]} ns, enctime = ${setkeyTime[1]} ns, dectime = ${setkeyTime[2]} ns`);
console.log(`chaosTime: \t time = ${chaosTime[0]} ns, enctime = ${chaosTime[1]} ns, dectime = ${chaosTime[2]} ns`);
console.log(`randomTime: \t time = ${randomTime[0]} ns, enctime = ${randomTime[1]} ns, dectime = ${randomTime[2]} ns`);
console.log('=========================================================================');
