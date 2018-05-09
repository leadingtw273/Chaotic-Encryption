let NP = require('number-precision');

let e = [];

const c1 = -1.7;
const c2 = 0.72;

const A = -0.5;

module.exports = {
    X1: (k, x) => {
        return (k <= 1) ? x[0] : NP.strip(1.76 -  x[1] * x[1] - 0.1 * x[2]);
    },
    X2: (k, x) => {
        return (k <= 1) ? x[1] : NP.strip(x[0]);
    },
    X3: (k, x) => {
        return (k <= 1) ? x[2] : NP.strip(x[1]);
    },
    createUk: (X, Y) => {

        e[0] = NP.strip(Y[0] - X[0]);
        e[1] = NP.strip(Y[1] - X[1]);
        e[2] = NP.strip(Y[2] - X[2]);

        let s = NP.strip(e[0] + (c1 * e[1]) + (c2 * e[2]));
        let u = NP.strip(-((X[1] ^ 2) - (Y[1] ^ 2) - (0.1 * e[2]) + (c1 * e[0]) + (c2 * e[1]) - e[0] - (c1 * e[1]) - (c2 * e[2])) + (A * s));

        return u;
    }
}
