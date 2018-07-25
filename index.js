'use strict';

const fs = require('fs');
const pash = '/sys/class/gpio/'
try{
  fs.writeFileSync(`${pash}export`, 25);
}catch{
}
fs.writeFileSync(`${pash}gpio25/direction`, 'out');

/*
const stop = ()=>{
  fs.writeFileSync(`${pash}unexport`, 25);
}
*/

const lightSwitch = (pin,num) =>{
  fs.writeFileSync(`${pash}gpio${pin}/value`, num);
}

