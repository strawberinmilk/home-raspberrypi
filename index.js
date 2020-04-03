'use strict'

const fs = require('fs')
const request = require('request')
const PiServo = require('pi-servo')
const servo = new PiServo(4)

const path = '/sys/class/gpio/'
const usePin = []
let timeout = []

let pi = false
try{
  fs.readdirSync('/sys/class/gpio')
  pi = true
}catch(e){
  pi = false
}

const setPin = (pin)=>{
  try{
    fs.writeFileSync('/sys/class/gpio/unexport',pin)
  }catch(e){
    console.log("a"+e)
  }
  try{
     fs.writeFileSync('/sys/class/gpio/export',pin)
  }catch(e){
    console.log("b"+e)
  }
}

const setRPin = (pin)=>{
  if(pi){
    try{
      //fs.writeFileSync(`${path}export`, wpin)
      fs.writeFileSync(`/sys/class/gpio/gpio${pin}/direction` ,'in')
    }catch(e){
      console.log("c"+e)
    }
  }
}
const setWPin = (pin)=>{
console.log(`w${pin}`)
  if(pi){
    try{
      //fs.writeFileSync(`${path}export`, wpin)
      fs.writeFileSync(`/sys/class/gpio/gpio${pin}/direction` ,'out')
    }catch(e){
      console.log("d"+e)
    }
  }
}
const rPin = [20]
const wPin = [25]
const doorSensor = 20
for(let i of rPin){
console.log(i)
  setPin(i)
setTimeout(()=>{
setRPin(i)
},300)
  //setRPin(i)
}
for(let i of wPin){
console.log(i)
  setPin(i)
  setTimeout(()=>{
    setWPin(i)
},300)
//setWPin(i)
}

const lightSwitch = (num) =>{
  clearTimeout(timeout[25])
  if(pi){
    console.log(`${path}gpio25/value,${num}`)
    fs.writeFileSync(`${path}gpio25/value`, num)
    servo.open().then(()=>{
      servo.setDegree(num?120:60)
    })
    setTimeout(()=>{
      servo.open().then(()=>{
        servo.setDegree(90)
      })
    },500)
  }
  console.log(`ligth ${num}`)
}

//ドア監視
//fs.writeFileSync(`${path}export`,doorSennsor)
try{
  fs.writeFileSync(`${path}gpio${doorSensor}/direction`,'in')
}catch(e){}
let oldStatus = 0
setInterval(()=>{
  let newStatus = fs.readFileSync(`${path}gpio${doorSensor}/value`,'utf8')
  console.log(newStatus)
//  let newStatus = 1
  if(newStatus != oldStatus){
    oldStatus = newStatus
    let text = ""
    if(newStatus == 0){
      text = "close"
    }else{
      text = "open"
      lightSwitch(1)
    }
    request.get({
      url: `http://192.168.0.62:9002/?{"channel":"doorlog","text":"doorlog ${text}"}`,
    }, function (error, response, body) {
      console.log(body)
    })
  }


},1000)


const http = require('http');
http.createServer((req, res) => {
  if(req.url.match(/lighton$/gi)){
    lightSwitch(1)
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(`light on.`)
    return
  }
  if(req.url.match(/lightoff$/gi)){
    lightSwitch(0)
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(`light off.`)
    return
  }
  //legacySystem
  let r
  try{
    r = JSON.parse(decodeURIComponent(req.url.replace(/\/|\?/gi,"")));
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(`The request was successful.\nBut the query is broken.`);
  }catch(e){
  }
  if(r/*&&r.pin+1&&r.num+1*/){
    let text = `pin:${r.pin} num:${r.num} `;
    if(r.time){
      clearTimeout(timeout[r.pin]);
      timeout[r.pin] = setTimeout(()=>{lightSwitch(r.num)},r.time);
      text += ` timeout:${r.time}`;
    }else{
      lightSwitch(r.num);
    }
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(text);
  }else{
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(`The request was successful.\nBut the query is broken.`);
  }
}).listen(9001);


