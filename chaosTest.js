let chaos = require("./chaos_model.js");
let f = require('float');


let X = [0.7, -0.3, 1];
let Y = [-0.3, -0.1, 0.8];

const N = 50;
const SYNC = 10;

let tempX = [];
let tempY = [];

let u = 0;

for (let i = 1; i <= N; i++) {

    u = chaos.createUk(X, Y);

    tempX[0] = chaos.X1(i, X);
    tempX[1] = chaos.X2(i, X);
    tempX[2] = chaos.X3(i, X);

    tempY[0] = (i < SYNC) ? chaos.X1(i, Y) : chaos.ukX1(i, Y, u);
    tempY[1] = chaos.X2(i, Y);
    tempY[2] = chaos.X3(i, Y);

    X = tempX;
    Y = tempY;

    console.log(`X1(${i}) = ${X[0]}\t\t,Y1(${i}) = ${Y[0]}\t\t, u => ${u}`);
}

//chaos.henonMap(1000,y1,y2,y3);
