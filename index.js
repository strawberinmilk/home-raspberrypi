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
  fs.readdirSync(path)
  pi = true
}catch(e){
  pi = false
}

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

if(pi) for(let i of rPin){
  setPin(i)
  setTimeout(()=>{
    setRPin(i)
  },300)
}
if(pi) for(let i of wPin){
  setPin(i)
  setTimeout(()=>{
    setWPin(i)
  },300)
}

const light1 = num =>{
  clearTimeout(timeout[25])
  if(pi){
    servo.open().then(()=>{
      servo.setDegree(num?140:70)
    })
    setTimeout(()=>{
      servo.open().then(()=>{
        servo.setDegree(90)
      })
    },500)
  }
  console.log(`light1(Servo) ${num}`)
}
const light2 = num =>{
  if(pi) fs.writeFileSync(`${path}gpio25/value`, num)
  console.log(`ligth2 ${num}`)
}

const lightSwitch = (num) =>{
  light1(num)
  light2(num)
}
//ドア監視

//fs.writeFileSync(`${path}export`,doorSennsor)
try{
  fs.writeFileSync(`${path}gpio${doorSensor}/direction`,'in')
}catch(e){}
let oldStatus = 0

setInterval(()=>{
  let newStatus = pi ? fs.readFileSync(`${path}gpio${doorSensor}/value`,'utf8') : 0
  if(newStatus != oldStatus){
    oldStatus = newStatus
    let text = ''
    if(newStatus == 0){
      text = 'close'
    }else{
      text = 'open'
      lightSwitch(1)
    }
    console.log(text)
    request.get({
      url: `http://192.168.0.62:9002/?{"channel":"doorlog","text":"doorlog ${text}"}`,
    }, function (error, response, body) {
      console.log(body)
    })
  }
},500)



const http = require('http')
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

  let r
  try{
    r = JSON.parse(decodeURIComponent(req.url.replace(/\/|\?/gi,'')))
  }catch(e){
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(`The request was successful.\nBut the query is broken.\nerrorType1 parseError`)
    return
  }
  
  //newSystem
  if(r.signal=='light'){
    const functionList = {'signal':()=>{},'light1':light1,'light2':light2}
    for(let i in r){
      functionList[i](r[i])
    }
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(`success\ntypeLight`)
    return
  //legacySystem
  }else if(!!r.pin&&!!r.num){
    let text = `pin:${r.pin} num:${r.num} `
    if(r.time){
      clearTimeout(timeout[r.pin])
      timeout[r.pin] = setTimeout(()=>{lightSwitch(r.num)},r.time)
      text += ` timeout:${r.time}`
    }else{
      lightSwitch(r.num)
    }
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(text)
    return
  }else{
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(`The request was successful.\nBut the query is broken.\nerrortype3`)
    return
  }
}).listen(9001)

