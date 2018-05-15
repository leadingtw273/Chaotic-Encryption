const AES256 = require('./aes256_model');

let aes256 = new AES256('sha256','aes-256-ecb');

aes256.runHash('0.123456');

let sendData = aes256.encryp('leadingtw');

let getData = aes256.decryp(sendData);
