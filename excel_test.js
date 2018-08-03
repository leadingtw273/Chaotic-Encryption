const XLSX = require('xlsx');
const fs = require('fs');

// let _headers = ['x', 'y', 'dataA', 'dataB'];
// let _data = [{
//   x: '0',
//   y: '0',
//   dataA: '162',
//   dataB: '162'
// }, {
//   x: '156',
//   y: '143',
//   dataA: '105',
//   dataB: '114'
// }];

module.exports = function (args) {
  let defConfig = {
    _headers: [],
    _data: [],
    wbName: 'output.xlsx',
    wsName: 'mySheet'
  };
  Object.assign(defConfig, args);

  let headers = defConfig._headers
    .map((v, i) => Object.assign({}, { v: v, position: String.fromCharCode(65 + i) + 1 }))
    .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {});

  let data = defConfig._data
    .map((v, i) => defConfig._headers.map((k, j) => Object.assign({}, { v: v[k], position: String.fromCharCode(65 + j) + (i + 2) })))
    .reduce((prev, next) => prev.concat(next))
    .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v, t: 'n' } }), {});

  // 合并 headers 和 data
  let output = Object.assign({}, headers, data);
  // 获取所有单元格的位置
  let outputPos = Object.keys(output);
  // 计算出范围
  let ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];
  // 构建 workbook 对象
  let wb = {
    SheetNames: [`${defConfig.wsName}`],
    Sheets: {
      [defConfig.wsName]: Object.assign({}, output, { '!ref': ref })
    }
  };
  // 导出 Excel
  XLSX.writeFile(wb, defConfig.wbName);
};

