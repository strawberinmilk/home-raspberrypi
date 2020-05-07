
const ajax = (url)=>{
  let xhr = new XMLHttpRequest()
  xhr.onreadystatechange = ()=>{
    if(xhr.readyState === 4){
      if(xhr.status === 200){
        document.getElementById('status').innerText = 'success'
        console.log(xhr.responseText)
      }else if(xhr.status === 404){
        document.getElementById('status').innerText = '404 notfound'
      }
    }else{
      document.getElementById('status').innerText = 'connecting'
    }
  }
  xhr.open('GET',url,true)
  xhr.send(null)
}

const lightSwitchList = document.getElementsByClassName('lightSwitch')

for(let i of lightSwitchList){
  i.onclick = ()=>{
    console.log(i.id)
    const lightNumber = i.id.match(/l\d+/gi)[0].replace(/l/,'')
    const ligthStatus = i.id.match(/s\d+/gi)[0].replace(/s/,'')
    const url = `/?{"signal":"light","light${lightNumber}":${ligthStatus}}`
    ajax(url)
  }
}

document.getElementById('allOnSwitch').onclick = ()=>{
  ajax('lighton')
}
document.getElementById('allOffSwitch').onclick = ()=>{
  ajax('lightoff')
}