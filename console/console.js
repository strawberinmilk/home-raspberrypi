const toggleWrite = ()=>{
  let xhr = new XMLHttpRequest()
  xhr.onreadystatechange = ()=>{
    if(xhr.readyState === 4) if(xhr.status === 200){
      console.log(xhr.responseText)
      const toggle = document.getElementsByClassName('toggle')
      const json = JSON.parse(xhr.responseText)
      for(let i of toggle){
        i.style.color = '#f00';
        const name = i.id.replace(/toggle|on|off/gi,'')
        const onof = !!i.id.match(/on/gi)
        console.log(`${name} ${onof} ${!!json[name]===onof}`)
        //if(!!json[name]===onof){
        //  i.style.backgroundColor = "#FF00FF"
        //}else{
        //  i.style.backgroundColor = "#c0c0c0"
        //}
        i.style.backgroundColor = !!json[name]===onof ? "#FF00FF" : "#c0c0c0"
      }
    }
  }
  xhr.open('GET',`/?{"signal":"question"}`,true)
  xhr.send(null)
}
toggleWrite()

const ajax = async (url)=>{
  let xhr = new XMLHttpRequest()
  xhr.onreadystatechange = ()=>{
    if(xhr.readyState === 4){
      if(xhr.status === 200){
        document.getElementById('status').innerText = 'success'
        toggleWrite()
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

const statusSwitchList = document.getElementsByClassName('statusSwitch')

for(let i of statusSwitchList){
  i.onclick = ()=>{
    console.log(i.id)
    const url = `/?{"signal":"status","${i.id.split('-')[0]}":${i.id.split('-')[1]}}`
    ajax(url)
  }
}
document.getElementById('allOnSwitch').onclick = ()=>{
  ajax('lighton')
}
document.getElementById('allOffSwitch').onclick = ()=>{
  ajax('lightoff')
}
document.getElementById('reloadArea').onclick = ()=>{
  toggleWrite()
}
