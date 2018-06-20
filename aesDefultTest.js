const AES = require('./models/aes256_model');

let aes = new AES('sha256', 'aes256');

let input = Buffer.from(['0xff', '0xee', '0xdd', '0xcc', '0xbb', '0xaa', '0x99', '0x88', '0x77', '0x66', '0x55', '0x44', '0x33', '0x22', '0x11', '0x00']);
let key = Buffer.from(['0x00', '0x11', '0x22', '0x33', '0x44', '0x55', '0x66', '0x77', '0x88', '0x99', '0xaa', '0xbb', '0xcc', '0xdd', '0xee', '0xff']);

// let input = '8877665544332211';
// let key = '1122334455667788';

let hashKey = aes.setKey(key);
let encData = aes.encryp(input);

let decData = aes.decryp(encData);

// buffer to array
let arr = [...decData];
// array to buffer
let buf = Buffer.from(arr);

console.log('============================================================');
console.log('key     (' + key.length + ')Byte: ');
console.log(key);
console.log('input   (' + input.length + ')Byte: ');
console.log(input);
console.log('hashKey (' + hashKey.length + ')Byte: ');
console.log(hashKey);
console.log('encData (' + encData.length + ')Byte: ');
console.log(encData);
console.log('------------------------------------------------------------');
console.log('decData('+decData.length+') : ');
console.log(decData);
console.log('------------------------ trans type ------------------------');
console.log(arr);
console.log(buf);
console.log('============================================================');

