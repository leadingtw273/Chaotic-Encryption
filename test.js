const test = require('./chaos_model_class.js');

const tt = new test(0.9,[-1.7, 0.72]);
tt.setModulation([1,0.8,0.9],[-0.3,1.2,1.3]);
tt.show();
console.log( tt.chaosParameter);