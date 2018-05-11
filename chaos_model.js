let f = require('float');

const c1 = -1.7;
const c2 = 0.72;

const A = -0.5;

module.exports = {
    runHenonmap: (k, x) => {
        let t = x.slice();
        
        if(k > 1){
            t[0] = f.round(1.76 - x[1] ** 2 - 0.1 * x[2], 10);
            t[1] = f.round(x[0], 10);
            t[2] = f.round(x[1], 10);
        }

        return t;
    },
    createUk: (X, Y) => {

        let Um = this.createUm(X);
        let Us = this.createUs(Y);

        return f.round(Um + Us, 10);
    },
    createUm: (X) => {

        let Um = (-X[0] * (1 + A - c1) - X[1] * (X[1] + A * c1 - c2 + c1) - X[2] * (c2 + 0.1 + A * c2));

        return f.round(Um, 10);

    },
    createUs: (Y) => {

        let Us = (Y[0] * (1 + A - c1) + Y[1] * (Y[1] + A * c1 - c2 + c1) + Y[2] * (c2 + 0.1 + A * c2));

        return f.round(Us, 10);

    },
    arraysEqual: (a1,a2 ) => {
        return JSON.stringify(a1)==JSON.stringify(a2);
    }
}
