'use strict';

const fs = require('fs');
const request = require("request");
const path = '/sys/class/gpio/';
const usePin = [];
let timeout = [];

const setPin = (pin)=>{
  if(process.platform!='darwin'){
    try{
      fs.writeFileSync(`${path}export`, pin);
    }catch(e){
    }
    try{
      fs.writeFileSync(`${path}gpio${pin}/direction`, 'out');
    }catch(e){
    }
  }
}
setPin(25)
const lightSwitch = (pin,num) =>{
  clearTimeout(timeout[pin]);
  if(process.platform!='darwin') fs.writeFileSync(`${path}gpio${pin}/value`, num);
  console.log(`${pin} ${num}`);
}


//fs.writeFileSync(`${path}export`,'21')
try{
  fs.writeFileSync(`${path}gpio21/direction`,'in')
}catch(e){}
let oldStatus = 0;
setInterval(()=>{
  let newStatus = fs.readFileSync(`${path}gpio21/value`,'utf8')
  if(newStatus != oldStatus){
    oldStatus = newStatus
    let text = ""
    if(newStatus == 0){
      text = "close"
    }else{
      text = "open"
    }
    request.get({
      url: `http://192.168.0.61:9002/?{"channel":"doorlog","text":"${text}"}`,
    }, function (error, response, body) {
      console.log(body)
    })
  }
},1000)


const http = require('http');
http.createServer((req, res) => {
  let r;
  try{
    r = JSON.parse(decodeURIComponent(req.url.replace(/\/|\?/gi,"")));

  }catch(e){
  }
  if(r/*&&r.pin+1&&r.num+1*/){
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


