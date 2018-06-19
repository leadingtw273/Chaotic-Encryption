const AES = require('./models/aes256_model');

let aes = new AES('sha256', 'aes-256-ecb');

let input = '8877665544332211';
let key = '1122334455667788';

let hashKey = aes.setNoHashKey(key);
let encData = aes.encryp(input);

let decData = aes.decryp(encData);

console.log('=============================================================');
console.log('input   : ' + input + ', length: ' + input.length);
console.log('key     : ' + key + ', length: ' + key.length);
console.log('hashKey : ' + hashKey + ', length: ' + hashKey.length);
console.log('encData : ' + encData + ', length: ' + encData.length);
console.log('-------------------------------------------------------------');
console.log('decData : ' + decData + ', length: ' + decData.length);
console.log('=============================================================');

