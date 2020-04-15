'use strict'

const fs = require('fs')
const request = require('request')
const PiServo = require('pi-servo')
const servo = new PiServo(4)
//const player = require('play-sound')()
//const mpg321 = require('mpg321')

const path = '/sys/class/gpio/'
const usePin = []
let timeout = []

let pi = false
try{
  fs.readdirSync(path)
  pi = true
}catch(e){
  pi = false
}

/*
try{
  fs.statSync('./ignoreDir/mm2_01.mp3')
}catch(e){
  request.get({
    url: 'http://www.proface.co.jp/signaling/other_contents/sound/mp3/mm2_01.mp3',
    encoding: null
  }, (error, response, body)=> {
    fs.writeFileSync('./ignoreDir/mm2_01.mp3',body)
  })
}*/

const setPin = (pin)=>{
  try{
    fs.writeFileSync(`${path}unexport`,pin)
  }catch(e){
    console.error('a'+e)
  }
  try{
    fs.writeFileSync(`${path}export`,pin)
  }catch(e){
    console.error('b'+e)
  }
}

const setRPin = (pin)=>{
  if(pi){
    try{
      fs.writeFileSync(`${path}gpio${pin}/direction` ,'in')
    }catch(e){
      console.error('c'+e)
    }
  }
}
const setWPin = (pin)=>{
  if(pi){
    try{
      fs.writeFileSync(`${path}gpio${pin}/direction` ,'out')
    }catch(e){
      console.log('d'+e)
    }
  }
}
const rPin = [20]
const wPin = [25]
const doorSensor = 20

for(let i of rPin){
  setPin(i)
  setTimeout(()=>{
    setRPin(i)
  },300)
}
for(let i of wPin){
  setPin(i)
  setTimeout(()=>{
    setWPin(i)
  },300)
}

const lightSwitch = (num) =>{
  clearTimeout(timeout[25])
  if(pi){
    console.log(`${path}gpio25/value,${num}`)
    fs.writeFileSync(`${path}gpio25/value`, num)
    servo.open().then(()=>{
      servo.setDegree(num?140:70)
    })
    setTimeout(()=>{
      servo.open().then(()=>{
        servo.setDegree(90)
      })
    },500)
  }
  console.log(`${new Date} ligth ${num}`)
}

//ドア監視
//fs.writeFileSync(`${path}export`,doorSennsor)
try{
  fs.writeFileSync(`${path}gpio${doorSensor}/direction`,'in')
}catch(e){}
let oldStatus = 0
let player = mpg321().remote()

setInterval(()=>{
  let newStatus = fs.readFileSync(`${path}gpio${doorSensor}/value`,'utf8')
  ////console.log(newStatus)
//  let newStatus = 1
  if(newStatus != oldStatus){
    oldStatus = newStatus
    let text = ''
    if(newStatus == 0){
      text = 'close'
    }else{
      text = 'open'
      lightSwitch(1)
//      player.play('./ignoreDir/mm2_01.mp3')
//      player.on('end', ()=> {
//        if(Number(oldStatus)===1)player.play('./ignoreDir/mm2_01.mp3')
//      })

    }
    console.log(text)
    request.get({
      url: `http://192.168.0.62:9002/?{"channel":"doorlog","text":"doorlog ${text}"}`,
    }, function (error, response, body) {
      console.log(body)
    })
  }
},500)



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
    r = JSON.parse(decodeURIComponent(req.url.replace(/\/|\?/gi,'')));
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

