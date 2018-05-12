const f = require('float');

let chaosPrt = {
  A: 0,
  c: [],
  ax: [1, 1, 1],
  dx: [0, 0, 0],
  g: [],
  h: [],
  j: []
};

class chaos {
  
  constructor(A, c) {
    chaosPrt.A = A;
    chaosPrt.c = c;
  }

  setModulation(ax, dx) {
    chaosPrt.ax = ax;
    chaosPrt.dx = dx;

    this.runModulation();
  }

  runModulation() {
    let ax = chaosPrt.ax;
    let dx = chaosPrt.dx;

    chaosPrt.g[0] = -(ax[0] / (ax[1] * ax[1]));
    chaosPrt.g[1] = 2 * ax[0] * dx[1] / (ax[1] * ax[1]);
    chaosPrt.g[2] = -0.1 * ax[0] / ax[2];
    chaosPrt.g[3] = ax[0] * (1.76 - (dx[1] * dx[1]) / (ax[1] * ax[1]) + 0.1 * ax[0] * dx[2] / ax[2]) + dx[0];

    chaosPrt.h[0] = ax[1] / ax[0];
    chaosPrt.h[1] = -(ax[1] * dx[0]) / ax[0] + dx[1];

    chaosPrt.j[0] = ax[2] / ax[1];
    chaosPrt.j[1] = -(ax[2] * dx[1]) / ax[1] + dx[2];
  }

  runChaos(k, x) {
    let t = x.slice();

    let g = chaosPrt.g;
    let h = chaosPrt.h;
    let j = chaosPrt.j;

    if (k > 1) {

      t[0] = f.round(g[0] * (x[1] * x[1]) + g[1] * x[1] + g[2] * x[2] + g[3], 10);
      t[1] = f.round(h[0] * x[0] + h[1], 10);
      t[2] = f.round(j[0] * x[1] + j[1], 10);

    }

    return t;
  }

  runMaster(k, x) {
    return this.runChaos(k, x);
  }

  runSlave(k, x, Um) {
    let t = this.runChaos(k, x);
    if (k > 1) {
      t[0] = f.round(t[0] + this.createUs(x) + Um, 10);
    }
    return t;
  }

  createUk(X, Y) {

    let Um = this.createUm(X);
    let Us = this.createUs(Y);

    return f.round(Um + Us, 10);
  }

  createUm(x) {
    let A = chaosPrt.A;
    let c = chaosPrt.c;
    let g = chaosPrt.g;
    let h = chaosPrt.h;
    let j = chaosPrt.j;

    let Um = ((x[1] * x[1]) * g[0]) + (x[1] * g[1]) + (x[2] * g[2]) + (x[0] * c[0] * h[0]) + (x[1] * c[1] * j[0]) - (x[0] * 0.9) - (x[1] * c[0] * A) - (x[2] * c[1] * A);

    return f.round(Um, 10);

  }

  createUs(y) {
    let A = chaosPrt.A;
    let c = chaosPrt.c;
    let g = chaosPrt.g;
    let h = chaosPrt.h;
    let j = chaosPrt.j;

    let Us = (-(-y[1] * -y[1]) * g[0]) - (y[1] * g[1]) - (y[2] * g[2]) - (y[0] * c[0] * h[0]) - (y[1] * c[1] * j[0]) + (y[0] * 0.9) + (y[1] * c[0] * A) + (y[2] * c[1] * A);

    return f.round(Us, 10);

  }

  arraysEqual(a1, a2) {

    let p1 = a1[0].toFixed(6) == a2[0].toFixed(6);
    let p2 = a1[1].toFixed(6) == a2[1].toFixed(6);
    let p3 = a1[2].toFixed(6) == a2[2].toFixed(6);

    return p1 && p2 && p3;
  }

  show() {
    console.log(`A = ${chaosPrt.A}, c = ${chaosPrt.c}, g = ${chaosPrt.g}, h = ${chaosPrt.h}, j = ${chaosPrt.j}`);
  }

}

module.exports = chaos;
