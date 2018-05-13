const crypto = require('crypto');

let aesParam = {
  hashMode: '',
  aesMode: '',
  key: ''
};

class AES256 {

  /**
   * AES256 的 constructor
   * @param {string} hash hash模式
   * @param {string} aes aes模式
   */
  constructor(hash, aes) {
    aesParam.hashMode = hash;
    aesParam.aesMode = aes;
  }

  /**
   * 將傳入值進行hash運算
   * @param {string} chaosData 傳入值
   */
  runHash(chaosData) {
    // hash 混沌產生值 轉成對稱金鑰
    let hash = crypto.createHash(aesParam.hashMode);
    aesParam.key = hash.update(chaosData).digest('hex');
    console.log(`key  = ${aesParam.key}`);
  }

  /**
   * 將傳入值進行AES加密運算
   * @param {*} data 傳入值
   */
  encryp(data) {
    // aes256-ec b加密 
    let aes256Enc = crypto.createCipher(aesParam.aesMode, aesParam.key);
    let sendData = aes256Enc.update(data, 'utf8', 'hex');
    sendData += aes256Enc.final('hex');
    return sendData;
  }

  /**
   * 將傳入值進行AES解密運算
   * @param {*} data 傳入值
   */
  decryp(data) {
    //aes256-ecb 解密
    let aes256Dec = crypto.createDecipher(aesParam.aesMode, aesParam.key);
    let getData = aes256Dec.update(data, 'hex', 'utf8');
    getData += aes256Dec.final('utf8');
    return getData;
  }
}

module.exports = AES256;