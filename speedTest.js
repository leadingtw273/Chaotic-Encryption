const AES256 = require('./aes256_model');
const Chaos = require('./chaos_model.js');

const AES = new AES256('sha256', 'aes-256-ecb');
const chaos = new Chaos(0.1, [-0.3, 0.02]);

let X = [0.5, -0.3, 0.4];

const N = 10000;
const data = 'leadingtw';

let sourceKey = '';
let encData = '';
let decData = '';

for (let i = 0; i < N; i++) {

  // 固定金鑰
  sourceKey = 0.123456;
  AES.setKey(sourceKey.toFixed(6));
  try {
    encData = AES.encryp(data);
    decData = AES.decryp(encData);
  }
  catch (e) {
    console.log(e);
  }

  console.log('--------------------------------------------------------------------------------------------');

  // chaos產生金鑰
  X = chaos.runChaos(i,X);
  sourceKey = X[0];
  AES.setKey(sourceKey.toFixed(6));
  try {
    encData = AES.encryp(data);
    decData = AES.decryp(encData);
  }
  catch (e) {
    console.log(e);
  }

  console.log('--------------------------------------------------------------------------------------------');

}


// chaos產生金鑰
// random產生金鑰
