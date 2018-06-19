const Chaos = require('./models/DAFFING_chaos_model');

const N = 10;

let x = [0.5,-0.3];
let y = [0.3,0.6];

const mChaos = new Chaos(0.2,2,0.3);
const sChaos = new Chaos(0.2,2,0.3);

mChaos.setModulation([1,1],[0,0]);
sChaos.setModulation([1,1],[0,0]);

let Um = 0;
let Us = 0;

for(let i =0; i<N;i++){

  // 主端 CLIENT
  Um = mChaos.createUm(x);
  x = mChaos.runMaster(i, x);

  //僕端 SERVER
  Us = sChaos.createUs(y);
  y = sChaos.runSlave(i, y, Um);

  console.log(`x: ${x}, Um: ${Um}`);
  console.log(`y: ${y}, Us: ${Us}`);
  console.log(sChaos.checkSync(Um,Us));
}