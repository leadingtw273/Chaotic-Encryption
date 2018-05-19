let param = {
  N: 0,
  detN: 0
};

Array.prototype.remove = function (val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

const arrFilter = (arr) => {

  let all = [];
  let enc = [];
  let dec = [];

  arr.forEach((element) => {
    all.push(element[0]);
    enc.push(element[1]);
    dec.push(element[2]);
  });

  let i = 0;
  while (i < Math.round(param.N * param.detN)) {

    all.remove(Math.max(...all));
    enc.remove(Math.max(...enc));
    dec.remove(Math.max(...dec));

    all.remove(Math.min(...all));
    enc.remove(Math.min(...enc));
    dec.remove(Math.min(...dec));

    i++;
  }

  arr = [];
  all.forEach((element, index) => {
    arr.push([all[index], enc[index], dec[index]]);
  });

  return arr;

};

const avgTime = (time) => {

  time = arrFilter(time);

  let all = 0;
  let enc = 0;
  let dec = 0;
  let arrLength = time.length;
  time.forEach((element) => {
    all = all + element[0];
    enc = enc + element[1];
    dec = dec + element[2];
  });

  return [Math.round(all / arrLength), Math.round(enc / arrLength), Math.round(dec / arrLength)];
};

module.exports = {
  init: (N,detN) => {
    param.N = N;
    param.detN = detN;
  },
  avgTime
};