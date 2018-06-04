const Chaos = require('./models/DAFFING_chaos_model');

const N = 10000;

let x = [0.5,0.3];

const chaos = new Chaos(0.3,1,0.2);

for(let i =0; i<N;i++){
  x = chaos.runChaos(i,x);
  console.log(x);
}