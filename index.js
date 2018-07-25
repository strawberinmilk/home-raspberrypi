'use strict';

const fs = require('fs');
const pash = '/sys/class/gpio/';
const usePin = [];
let timeout = [];

const setPin = (pin)=>{
  if(process.platform!='darwin'){
    for(let i=0;i<usePin.length;i++){
      try{
        fs.writeFileSync(`${pash}export`, pin);
      }catch(e){
      }  
      fs.writeFileSync(`${pash}gpio${pin}/direction`, 'out');
    }  
  }  
}

const lightSwitch = (pin,num) =>{
  if(usePin.indexOf(pin,0)===-1) setPin(pin);
  clearTimeout(timeout[pin]);
  if(process.platform!='darwin') fs.writeFileSync(`${pash}gpio${pin}/value`, num);
  console.log(`${pin} ${num}`);
}

const http = require('http');
http.createServer((req, res) => {
  let r;
  try{
    r = JSON.parse(req.url.replace(/\/\?/,"").replace(/%22/g,'"')+'');
  }catch(e){
  }
  if(r&&r.pin+1&&r.num+1){
    let text = `pin:${r.pin} num:${r.num} `;
    if(r.time){
      clearTimeout(timeout[r.pin]);
      timeout[r.pin] = setTimeout(()=>{lightSwitch(r.pin,r.num)},r.time);
      text += ` timeout:${r.time}`;
    }else{
      lightSwitch(r.pin,r.num);
    }
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(text);
  }else{
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(`The request was successful.\nBut the query is broken.`);
  }
}).listen(9001);