const request = require('request')
//const player = require('play-sound')()
const fs = require('fs')

try{
  fs.statSync('./ignoreDir/mm2_01.mp3')
}catch(e){
  request.get({
    url: 'http://www.proface.co.jp/signaling/other_contents/sound/mp3/mm2_01.mp3',
//url:'http://www.proface.co.jp/signaling/other_contents/sound/mp3/18am04.mp3',
    encoding: null
  }, (error, response, body)=> {
    fs.writeFileSync('./ignoreDir/mm2_01.mp3',body)
  })
}



/*
setInterval(()=>{
  player.play('./ignoreDir/mm2_01.mp3'), err => {
    console.log(err)
    if (err) throw err
  }
},1500)

*/
var mpg321 = require('mpg321');

var player = mpg321().remote();

player.play('./ignoreDir/mm2_01.mp3')
player.on('end', function () {
  console.log('end')
  player.play(file)
})
