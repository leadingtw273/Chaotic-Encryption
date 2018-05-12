const f = require('float');

let c = [-1.7, 0.72];
let A = 0.9;

let ax = [1,1,1];
let dx = [1,1,1];

let g = [];
let h = [];
let j = [];

g[0] = -(ax[0] / (ax[1] * ax[1]));
g[1] = 2 * ax[0] * dx[1] / (ax[1] * ax[1]);
g[2] = -0.1 * ax[0] / ax[2];
g[3] = ax[0] * (1.76 - (dx[1] * dx[1]) / (ax[1] * ax[1]) + 0.1 * ax[0] * dx[2] / ax[2]) + dx[0];

h[0] = ax[1] / ax[0];
h[1] = -(ax[1] * dx[0]) / ax[0] + dx[1];

j[0] = ax[2] / ax[1];
j[1] = -(ax[2] * dx[1]) / ax[1] + dx[2];

const chaos = {
  runChaos: (k, x) => {
    let t = x.slice();

    if (k > 1) {

      t[0] = f.round(g[0] * (x[1] * x[1]) + g[1] * x[1] + g[2] * x[2] + g[3], 10);
      t[1] = f.round(h[0] * x[0] + h[1], 10);
      t[2] = f.round(j[0] * x[1] + j[1], 10);

    }

    return t;
  },
  runMaster: (k, x) => {
    return chaos.runChaos(k, x);
  },
  runSlave: (k, x, Um) => {
    let t = chaos.runChaos(k, x);
    if (k > 1) {
      t[0] = f.round(t[0] + chaos.createUs(x) + Um, 10);
    }
    return t;
  },
  createUk: (X, Y) => {

    let Um = chaos.createUm(X);
    let Us = chaos.createUs(Y);

    return f.round(Um + Us, 10);
  },
  createUm: (x) => {

    let Um = ((x[1] * x[1]) * g[0]) + (x[1] * g[1]) + (x[2] * g[2]) + (x[0] * c[0] * h[0]) + (x[1] * c[1] * j[0]) - (x[0] * 0.9) - (x[1] * c[0] * A) - (x[2] * c[1] * A);

    return f.round(Um, 10);

  },
  createUs: (y) => {

    let Us = (-(-y[1] * -y[1]) * g[0]) - (y[1] * g[1]) - (y[2] * g[2]) - (y[0] * c[0] * h[0]) - (y[1] * c[1] * j[0]) + (y[0] * 0.9) + (y[1] * c[0] * A) + (y[2] * c[1] * A);

    return f.round(Us, 10);

  },
  arraysEqual: (a1, a2) => {

    let p1 = a1[0].toFixed(6) == a2[0].toFixed(6);
    let p2 = a1[1].toFixed(6) == a2[1].toFixed(6);
    let p3 = a1[2].toFixed(6) == a2[2].toFixed(6);

    return p1 && p2 && p3;
  }
};

module.exports = chaos;
