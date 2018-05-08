//X1(K+1) = 1.76 - X2(K)*X2(K)-0.1X3(K)
//X2(K+1) = X1(K)
//X3(K+1) = X2(K)
module.exports = {
    X1 : function(k,y1,y2,y3){
        return (k <= 1) ? y1 : round(1.76 - y2*y2-0.1*y3,6);
    },
    X2 : function(k,y1,y2,y3){
        return (k <= 1) ? y2 : round(y1,6);
    },
    X3 : function(k,y1,y2,y3){
        return (k <= 1) ? y3 : round(y2,6);
    },
    henonMap : (k, x1, x2, x3) => {
        let y1, y2, y3;

        console.log(`X1(1) = ${x1}\t\t,X2(1) = ${x2}\t\t,X3(1) = ${x3}\t\t`);
            
        for(let i=2; i<k; i++){

            y1 = round(1.76-(x2*x2)-(0.1*x3),6);
            y2 = round(x1,6);
            y3 = round(x2,6);

            x1 = y1;
            x2 = y2;
            x3 = y3;

            console.log(`X1(${i}) = ${x1}\t\t,X2(${i}) = ${x2}\t\t,X3(${i}) = ${x3}\t\t`);

        }
    }
}
let round = function (val, precision) {
    return Math.round(Math.round(val * Math.pow(10, (precision || 0) + 1)) / 10) / Math.pow(10, (precision || 0));
}
