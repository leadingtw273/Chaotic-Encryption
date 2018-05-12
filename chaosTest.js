const chaos = require('./chaos_model.js');

const N = 1000;

let X = [0.5, -0.3, 0.4];
let Y = [-0.3, -0.1, 0.8];

let Um = 0;
let Us = 0;

let count = 0;

for (let i = 1; i <= N; i++) {

  X = chaos.runMaster(i, X);

  Y = chaos.runSlave(i, Y, Um);

  Um = chaos.createUm(X);

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
