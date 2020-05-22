'use strict'

const fs = require('fs')
const request = require('request')
const PiServo = require('pi-servo')
const servo = new PiServo(4)

const path = '/sys/class/gpio/'
const usePin = []
let timeout = []

let pi = false
const status = {
  'light1':0,
  'light2':0,
  'sleep':false,
  'leave':false,
}

try{
  fs.readdirSync(path)
  pi = true
}catch(e){
  pi = false
}

//setting-------------------------------------------
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

//lightSwitch-------------------------------------------
const light1 = num =>{
  clearTimeout(timeout[25])
  if(pi){
    servo.open().then(()=>{
      servo.setDegree(num?140:70)
    })
    timeout[25] = setTimeout(()=>{
      servo.open().then(()=>{
        servo.setDegree(90)
      })
    },500)
  }
  status.light1 = num
  console.log(`light1(Servo) ${num}`)
}
const light2 = num =>{
  if(pi) fs.writeFileSync(`${path}gpio25/value`, num)
  status.light2 = num
  console.log(`ligth2 ${num}`)
}

const lightAll = (num) =>{
  light1(num)
  light2(num)
}
//ドア監視-------------------------------------------

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
      if(status.leave==true)lightAll(0)
      status.leave = false
    }else{
      text = 'open'
      if(status.sleep==false)lightAll(1)
    }
    console.log(text)
    request.get({
      url: `http://192.168.0.62:9002/?{"channel":"doorlog","text":"doorlog ${text}"}`,
    }, function (error, response, body) {
      console.log(body)
    })
  }
},500)

//http-------------------------------------------
const http = require('http')
http.createServer((req, res) => {
  const URL = req.url.toLowerCase()
  if(!pi)console.log(URL)
  if(URL.match(/^\/$/gi)){
    res.writeHead(302, {
      'Location': '/console.html'
    })
    res.end()
    return
  }
  if(URL.match(/^\/console/gi)){
    let data
    try{
      data = fs.readFileSync(`./console${URL}`,'utf8')
    }catch(e){}
    if(data){
      res.writeHead(200)
      res.end(data)
    }else{
      res.writeHead(404)
      res.end('the url console page is not found')
    }
    return
  }
  
  if(URL.match(/lighton$/gi)){
    lightAll(1)
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(`light on.`)
    return
  }
  if(URL.match(/lightoff$/gi)){
    lightAll(0)
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
  //sample - /?{"signal":"light","light1":1}
  if(r.signal=='light'){
    const functionList = {'signal':()=>{},'lightAll':lightAll,'light1':light1,'light2':light2}
    for(let i in r){
      if(functionList[i]) functionList[i](r[i])
    }
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(`success\ntypeLight`)
    return
    // http://localhost:9001/?{%22signal%22:%22status%22,%22sleep%22:true}
  } else if(r.signal=='status'){
    for(let i in r){
      status[i]=r[i]
    }
    delete status.signal
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(`success\ntypeLight`)
    return
  }else if(r.signal=='question'){
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(`${JSON.stringify(status)}`)
  }else{
    res.writeHead(202, {'Content-Type': 'text/plain'})
    res.end(`The request was successful.\nBut the query is broken.\nerrortype3`)
    return
  }
}).listen(9001)

 //legacySystem
  /*}else if(!!r.pin&&!!r.num){
    let text = `pin:${r.pin} num:${r.num} `
    if(r.time){
      clearTimeout(timeout[r.pin])
      timeout[r.pin] = setTimeout(()=>{lightAll(r.num)},r.time)
      text += ` timeout:${r.time}`
    }else{
      lightAll(r.num)
    }
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(text)
    return*/