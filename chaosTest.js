const Chaos = require('./chaos_model.js');
const AES256 = require('./aes256_model');

// 執行次數
const N = 10000;

// 初始值
let X = [-0.1, -0.3, 0.4];
let Y = [0.5, 1.2, 0.7];

// 控制器
let Um = 0;
let Us = 0;

// 加密暫存
let sendData = '';
let getData = '';

// 加解密資料
let impData = 'leadingtw';

// 計算次數
let errorCount = 0;
let succsCount = 0;
let syncCount = 0;

// 計算時間
let startTime = 0;
let endTime = 0;
let syncTime = 0;

// 伺服端混沌亂數與AES加密初始化
const server = new Chaos(0.9, [-1.7, 0.72]);
const servarAES = new AES256('sha256', 'aes-256-ecb');
server.setModulation([1, 1, 1], [1, 1, 1]);

// 用戶端混沌亂數與AES加密初始化
const client = new Chaos(0.9, [-1.7, 0.72]);
const clientAES = new AES256('sha256', 'aes-256-ecb');
client.setModulation([1, 1, 1], [1, 1, 1]);

startTime = new Date().getTime();
for (let i = 1; i <= N; i++) {

    // 主端 CLIENT
    Um = client.createUm(X);
    X = client.runMaster(i, X);

    //僕端 SERVER
    Us = server.createUm(Y);
    Y = server.runSlave(i, Y, Um);

    if (server.checkSync(Us, Um)) {
        servarAES.runHash(Y[0].toFixed(6));
        sendData = servarAES.encryp(impData);
        if(syncCount == 0) syncTime = new Date().getTime();
        syncCount++;
        console.log('----------------------------------------------------------------------------------------');
    } else {
        sendData = '';
    };

    if (sendData.length != 0) {
        clientAES.runHash(X[0].toFixed(6));
        getData = clientAES.decryp(sendData);
        (getData == 'error') ? errorCount++ : succsCount++;
        console.log('----------------------------------------------------------------------------------------');
    }

    console.log(`(- ${(X[0] - Y[0]).toFixed(6)}), Um = ${Um.toFixed(6)}, Us = ${Us.toFixed(6)}`);
    console.log(`X1(${i}) = ${X[0].toFixed(6)}`);
    console.log(`Y1(${i}) = ${Y[0].toFixed(6)}`);
    console.log('----------------------------------------------------------------------------------------');
}
endTime = new Date().getTime();

console.log(`執行次數: ${N}, 同步次數: ${syncCount}, 同步比: ${(syncCount/N) *100} %`);
console.log(`hash錯誤次數: ${errorCount}, hash成功次數: ${succsCount}, hash錯誤率: ${(errorCount/(errorCount+succsCount) * 100).toFixed(2)} %`);
console.log(`執行總時間: ${(endTime-startTime)/1000} Sec, 同步所需時間: ${(syncTime-startTime)/1000} Sec`);
