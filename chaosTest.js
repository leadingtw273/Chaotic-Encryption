const chaos = require('./chaos_model.js');
const f = require('float');


let X = [0.5, -0.3, 0.4];
let Y = [-0.3, -0.1, 0.8];

const N = 10000;
const SYNC = 0;

let tempX = [];
let tempY = [];

let Um = 0;
let Us = 0;

let count = 0;

for (let i = 1; i <= N; i++) {

  tempX = chaos.runHenonmap(i, X);

  tempY = chaos.runHenonmap(i, Y);

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

  console.log(`X1(${i}) = ${X[0]}\t\t, Y1(${i}) = ${Y[0]}\t\t, ${count}`);
}
