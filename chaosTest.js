const chaos = require('./chaos_model.js');
const f = require('float');


const N = 10000;
const SYNC = 0;

let X = [0.5, -0.3, 0.4];
let Y = [-0.3, -0.1, 0.8];

let tempX = [];
let tempY = [];

let Um = 0;
let Us = 0;

let count = 0;

for (let i = 1; i <= N; i++) {

  tempX = chaos.runMaster(i, X);

  tempY = chaos.runSlave(i, Y, Um);

  if (i >= SYNC) {
    tempY[0] = f.round(tempY[0] + Um + Us, 10);
  }

  X = tempX;
  Y = tempY;

  Um = chaos.createUm(X);
  Us = chaos.createUs(Y);

  if (chaos.arraysEqual(X, Y)) {

    if (count >= 10) {
      break;
    } else {
      count++;
    }

  } else {
    count = 0;
  }

  console.log(`X1(${i}) = ${X[0].toFixed(6)}\t\t, Y1(${i}) = ${Y[0].toFixed(6)}\t\t, Uk = ${(Um + Us).toFixed(10)}\t\t, count = ${count}`);
}
