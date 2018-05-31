let bitset = {
  toAscii(bin) {
    return bin.replace(/\s*[01]{8}\s*/g, function (bin) {
      return String.fromCharCode(parseInt(bin, 2));
    });
  },
  toBinary(str, spaceSeparatedOctets) {
    return str.replace(/[\s\S]/g, function (str) {
      str = bitset.zeroPad(str.charCodeAt().toString(2));
      return !1 == spaceSeparatedOctets ? str : str
    });
  },
  zeroPad(num) {
    return '00000000'.slice(String(num).length) + num;
  }
};

module.exports = bitset;