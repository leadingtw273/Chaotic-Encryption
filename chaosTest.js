let chaos = require("./chaos_model.js");

let data = "";
let X1 = 1.1;
let X2 = 1.4;
let X3 = 1.3;
let Y1 = -0.3;
let Y2 = -0.1;
let Y3 = 0.8;
//X1(1) = 1.1, X2(1) = 1.4, X3(1) = 1.3
 for(let i = 1; i <= 1000; i++){

    let tempX1;
    let tempX2;
    let tempX3;

    let tempY1;
    let tempY2;
    let tempY3;


     tempX1 = chaos.X1(i,X1,X2,X3);
     tempX2 = chaos.X2(i,X1,X2,X3);
     tempX3 = chaos.X3(i,X1,X2,X3);

     tempY1 = chaos.X1(i,Y1,Y2,Y3);
     tempY2 = chaos.X2(i,Y1,Y2,Y3);
     tempY3 = chaos.X3(i,Y1,Y2,Y3);

     X1 = tempX1;
     X2 = tempX2;
     X3 = tempX3;
     
     Y1 = tempY1;
     Y2 = tempY2;
     Y3 = tempY3;

     console.log(`X1(${i}) = ${X1}\t\t,Y1(${i}) = ${Y1}\t\t`);
}

//chaos.henonMap(1000,y1,y2,y3);
