const Chaos = require('./chaos_model.js');
const AES256 = require('./aes256_model');

const N = 1000;

let X = [0.5, -0.3, 0.4];
let Y = [-0.3, -0.1, 0.8];

let Um = 0;

let aes256 = new AES256('sha256','aes-256-ecb');
aes256.runHash('0.123456');

const chaos = new Chaos(0.9, [-1.7, 0.72]);

chaos.setModulation([1, 1, 1], [0, 0, 0]);

for (let i = 1; i <= N; i++) {

  // 主端
  if (chaos.checkSync(X, Y)) break;
  Um = chaos.createUm(X);
  X = chaos.runMaster(i, X);

  //僕端
  Y = chaos.runSlave(i, Y, Um);


  console.log(`(- ${(X[0] - Y[0]).toFixed(6)})\t, Um = ${Um.toFixed(6)}`);
  console.log(`X1(${i}) = ${X[0].toFixed(6)}`);
  console.log(`Y1(${i}) = ${Y[0].toFixed(6)}`);
  console.log('---------------------------------------------------');

}
