const ieee754 = require('ieee754');

let value = 12345.123456789123123123123;
let buf = Buffer.alloc(8);
let tt = Buffer.alloc(8);

tt.writeDoubleLE(value, 0);
// let num = ieee754.read(buf, 0, true, 52, 8);

ieee754.write(buf, value, 0, true, 52, 8);
let num = buf.readDoubleLE(0);

console.log(num);
console.log(buf);
console.log(tt);