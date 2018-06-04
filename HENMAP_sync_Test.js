const Chaos = require('./models/HENMAP_chaos_model.js');
const AES256 = require('./models/aes256_model');

// 執行次數
const N = 100;

// 初始值
let X = [0.5, -0.3, 0.4];
let Y = [-0.3, -0.1, 0.8];

// 控制器
let Um = 0;
let Us = 0;

// 加密暫存
let sendData = '';
let getData = '';

// 加解密資料
let impData = 'leadingtw_273_r124672736_周昱宏';

// 計算次數
let errorCount = 0;
let succsCount = 0;
let syncCount = 0;

// 計算時間
let startTime = 0;
let endTime = 0;
let syncTime = 0;

// 伺服端混沌亂數與AES加密初始化
const server = new Chaos(0.1, [-0.3, 0.02]);
const servarAES = new AES256('sha256', 'aes-256-ecb');
server.setModulation([1, 1, 1], [0, 0, 0]);

// 用戶端混沌亂數與AES加密初始化
const client = new Chaos(0.1, [-0.3, 0.02]);
const clientAES = new AES256('sha256', 'aes-256-ecb');
client.setModulation([1, 1, 1], [0, 0, 0]);

startTime = new Date().getTime();
for (let i = 1; i <= N; i++) {

  let Uk = server.createUk(X, Y);
  // 主端 CLIENT
  Um = client.createUm(X);
  X = client.runMaster(i, X);

  //僕端 SERVER
  Us = server.createUs(Y);
  Y = server.runSlave(i, Y, Um);

  if (server.checkSync(Us, Um)) {
    servarAES.setKey(Y[0].toFixed(4));
    sendData = servarAES.encryp(impData);
    if (syncCount == 0) syncTime = new Date().getTime();
    syncCount++;
  } else {
    sendData = '';
  }

  if (sendData.length != 0) {
    clientAES.setKey(X[0].toFixed(4));
    getData = clientAES.decryp(sendData);
    (getData == 'error') ? errorCount++ : succsCount++;
  }

  console.log(`(- ${(X[0] - Y[0]).toFixed(6)}), Um = ${Um.toFixed(6)}, Us = ${Us.toFixed(6)}, Uk = ${Uk.toFixed(6)}`);
  console.log(`X1(${i}) = ${X[0].toFixed(6)}`);
  console.log(`Y1(${i}) = ${Y[0].toFixed(6)}`);
  console.log('----------------------------------------------------------------------------------------');
}
endTime = new Date().getTime();

console.log(`執行次數: ${N}, 同步次數: ${syncCount}, 同步比: ${(syncCount / N) * 100} %`);
console.log(`錯誤次數: ${errorCount}, 成功次數: ${succsCount}, 錯誤率: ${(errorCount / (errorCount + succsCount) * 100).toFixed(2)} %`);
console.log(`執行總時間: ${(endTime - startTime) / 1000} Sec, 同步所需時間: ${(syncTime - startTime) / 1000} Sec`);
