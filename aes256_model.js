const crypto = require('crypto');

let _aesParam = new WeakMap();

class AES256 {

  /**
   * AES256 的 constructor
   * @param {string} hash hash模式
   * @param {string} aes aes模式
   */
  constructor(hash, aes) {
    _aesParam.set(this, {
      hashMode: '',
      aesMode: '',
      key: ''
    });
    let privateData = _aesParam.get(this);
    privateData.hashMode = hash;
    privateData.aesMode = aes;
  }

  /**
   * 將傳入值進行hash運算
   * @param {string} chaosData 傳入值
   */
  setKey(chaosData) {
    let privateData = _aesParam.get(this);
    // hash 混沌產生值 轉成對稱金鑰
    let hash = crypto.createHash(privateData.hashMode);
    privateData.key = hash.update(chaosData).digest('hex');
    console.log(`金鑰 key \t= ${privateData.key}`);
  }

  /**
   * 將傳入值進行AES加密運算
   * @param {*} data 傳入值
   */
  encryp(data) {
    let privateData = _aesParam.get(this);
    // aes256-ec b加密 
    let aes256Enc = crypto.createCipher(privateData.aesMode, privateData.key);
    let sendData = aes256Enc.update(data, 'utf8', 'hex');

    sendData += aes256Enc.final('hex');

    console.log(`輸入 data  \t= ${data}`);
    console.log(`加密 data  \t= ${sendData}`);
    return sendData;
  }

  /**
   * 將傳入值進行AES解密運算
   * @param {*} data 傳入值
   */
  decryp(data) {
    let privateData = _aesParam.get(this);
    //aes256-ecb 解密
    let aes256Dec = crypto.createDecipher(privateData.aesMode, privateData.key);
    let getData = aes256Dec.update(data, 'hex', 'utf8');

    try {
      getData += aes256Dec.final('utf8');
    } catch (e) {
      return 'error';
    }

    console.log(`解密 data  \t= ${data}`);
    console.log(`輸出 data  \t= ${getData}`);
    return getData;
  }
}

module.exports = AES256;