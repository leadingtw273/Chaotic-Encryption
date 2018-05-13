const crypto = require('crypto');

const sha256 = crypto.createHash('sha256');

let chaosData = '0.123457';
let key = sha256.update(chaosData).digest('hex');
console.log(`key  = ${key}`);


let aes256Enc = crypto.createCipher('aes-256-ecb', key);
let sendData = aes256Enc.update('leadingtw','utf8','hex');
sendData += aes256Enc.final('hex');
console.log(`send = ${sendData}`);

let aes256Dec = crypto.createDecipher('aes-256-ecb', key);
let getData = aes256Dec.update(sendData,'hex','utf8');
getData += aes256Dec.final('utf8');
console.log(`get  = ${getData}`);