'use strict';

const fs = require('fs');
const pash = '/sys/class/gpio/';
const usePin = [25];
if(process.platform!='darwin'){
  for(let i=0;i<usePin.length;i++){
    try{
      fs.writeFileSync(`${pash}export`, 25);
    }catch(e){
    }  
    fs.writeFileSync(`${pash}gpio25/direction`, 'out');
  }  
}

const lightSwitch = (pin,num) =>{
  if(process.platform!='darwin') fs.writeFileSync(`${pash}gpio${pin}/value`, num);
  console.log(`${pin} ${num}`)
}

const http = require('http');
http.createServer((req, res) => {
  console.log(req.url.replace(/\/\?/,"").replace(/%22/g,'"')+'')
  let r = JSON.parse(req.url.replace(/\/\?/,"").replace(/%22/g,'"')+'')
  lightSwitch(r.pin,r.num);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(9001);