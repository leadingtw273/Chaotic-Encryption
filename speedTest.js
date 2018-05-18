const AES256 = require('./aes256_model');
const Chaos = require('./chaos_model.js');

const AES = new AES256('sha256', 'aes-256-ecb');
const chaos = new Chaos(0.1, [-0.3, 0.02]);
chaos.runModulation();

let X = [0.5, -0.3, 0.4];

const N = 100;
const data = 'leadingtw';

let sourceKey = '';
let encData = '';
let decData = '';

let setkeyTime = [];
let chaosTime = [];
let randomTime = [];

let startTime = 0;
let encTime = 0;
let decTime = 0;

let allTime = new Date().getTime();;
for (let i = 1; i <= N; i++) {

  console.log('--------------------------------------------------------------------------------------------');
  console.log(`狀態 ( ${i} ) : 固定金鑰`);

  // 固定金鑰
  startTime = new Date().getTime();
  sourceKey = 0.123456;
  AES.setKey(sourceKey.toFixed(6));
  try {
    encData = AES.encryp(data);
    encTime = new Date().getTime();
    decData = AES.decryp(encData);
    decTime = new Date().getTime();
  }
  catch (e) {
    console.log(e);
  }
  setkeyTime.push([decTime - startTime, encTime - startTime, decTime - encTime]);

  console.log('--------------------------------------------------------------------------------------------');
  console.log(`狀態 ( ${i} ) : chaos產生金鑰`);

  // chaos產生金鑰
  startTime = new Date().getTime();
  X = chaos.runChaos(i, X);
  sourceKey = X[0];
  AES.setKey(sourceKey.toFixed(6));
  try {
    encData = AES.encryp(data);
    encTime = new Date().getTime();
    decData = AES.decryp(encData);
    decTime = new Date().getTime();
  }
  catch (e) {
    console.log(e);
  }
  chaosTime.push([decTime - startTime, encTime - startTime, decTime - encTime]);

  console.log('--------------------------------------------------------------------------------------------');
  console.log(`狀態 ( ${i} ) : random產生金鑰`);

  // random產生金鑰
  startTime = new Date().getTime();
  sourceKey = Math.random() * 2 - 1;
  AES.setKey(sourceKey.toFixed(6));
  try {
    encData = AES.encryp(data);
    encTime = new Date().getTime();
    decData = AES.decryp(encData);
    decTime = new Date().getTime();
  }
  catch (e) {
    console.log(e);
  }
  randomTime.push([decTime - startTime, encTime - startTime, decTime - encTime]);

}
let endTime = new Date().getTime();

console.log('============================================================================================');
console.log(allTime - endTime);
