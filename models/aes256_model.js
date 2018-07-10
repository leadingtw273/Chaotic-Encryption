const crypto = require('crypto');

let _aesParam = new WeakMap();

class AES {
  /**
   * AES 的 constructor
   * @param {string} aes aes模式
   * @param {string} hash hash模式
   */
  constructor(aes, ...opt) {
    _aesParam.set(this, {
      aesMode: aes,
      hashMode: opt[0] ? opt[0] : null,
      iv: opt[1] ? opt[1] : null
    });
  }

  /**
   * 將傳入值進行hash運算
   * @param {string} crptKey 傳入值
   */
  setKey(crptKey) {
    let privateData = _aesParam.get(this);
    // hash 混沌產生值 轉成對稱金鑰
    if (null != privateData.hashMode) {
      let hash = crypto.createHash(privateData.hashMode);
      return hash.update(crptKey).digest();
    } else {
      return crptKey;
    }
  }

  /**
   * 將傳入值進行AES加密運算
   * @param {*} data 傳入值
   */
  encryp(data, key) {
    let privateData = _aesParam.get(this);
    let aes256Enc = null;
    let sendData = Buffer.alloc(16);
    data = Buffer.concat(
      [data, Buffer.alloc(16)],
      (parseInt(data.length / 16) + 1) * 16
    );

    try {
      if (privateData.iv == null) {
        aes256Enc = crypto
          .createCipher(privateData.aesMode, this.setKey(key))
          .setAutoPadding(false);
      } else {
        aes256Enc = crypto
          .createCipheriv(privateData.aesMode, this.setKey(key), privateData.iv)
          .setAutoPadding(false);
      }
      sendData = aes256Enc.update(data);
      sendData = Buffer.concat([sendData, aes256Enc.final()]);
    } catch (e) {
      throw e;
    }
    return sendData;
  }

  /**
   * 將傳入值進行AES解密運算
   * @param {*} data 傳入值
   */
  decryp(data, key) {
    let privateData = _aesParam.get(this);
    let aes256Dec = null;
    let getData = Buffer.alloc(16);

    try {
      if (privateData.iv == null) {
        aes256Dec = crypto
          .createDecipher(privateData.aesMode, this.setKey(key))
          .setAutoPadding(false);
      } else {
        aes256Dec = crypto
          .createDecipher(privateData.aesMode, this.setKey(key), privateData.iv)
          .setAutoPadding(false);
      }
      getData = aes256Dec.update(data);
      getData = Buffer.concat([getData, aes256Dec.final()]);
    } catch (e) {
      throw e;
    }
    return getData;
  }
}

module.exports = AES;
