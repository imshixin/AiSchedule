/*
 * @Author: imsixn
 * @Date: 2021-04-10 00:09:51
 * @LastEditors: imsixn
 * @LastEditTime: 2022-03-10 13:21:13
 * @Description: update school url
 */
const xhr = new XMLHttpRequest()

function sendQuest(method, url, data) {
  xhr.open(method, url, false)
  if (method == 'POST') {
    xhr.setRequestHeader('Content-Type', "application/x-www-form-urlencoded charset=UTF-8")
  }
  data ? xhr.send(data) : xhr.send()
  return {
    code: xhr.status,
    resp: xhr.response
  }
}
const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

function encodeInp(input) {
  let output = ""
  let chr1, chr2, chr3 = ""
  let enc1, enc2, enc3, enc4 = ""
  let i = 0
  do {
    chr1 = input.charCodeAt(i++)
    chr2 = input.charCodeAt(i++)
    chr3 = input.charCodeAt(i++)
    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63
    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4)
    chr1 = chr2 = chr3 = ""
    enc1 = enc2 = enc3 = enc4 = ""
  } while (i < input.length)
  console.log(output)
  return output
}

async function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
  await loadTool("AIScheduleTools")
  await AIScheduleAlert(`
  使用步骤：
  1.登录webvpn(登陆后请勿点到强智教务网去)
  2.点击一键导入，输入账号密码，你的校区(输入前面的数字)
  `)
  let href = ""
  let ret1 = sendQuest('GET', '/user/portal_groups').resp
  let data = JSON.parse(ret1)['data']
  let red = data[0]['resource'][0]['redirect']
  href += red.slice(1)
  console.log(href)
  if (!href.endsWith('/')) {
    href += '/'
  }
  let username = await AISchedulePrompt({
    titleText:"提示",
    tipText:'请输入教务网用户名',
    defaultText:"",
    validator:(v)=>!/[a-zA-Z0-9]+/.test(v)
  })
  let password = await AISchedulePrompt({
    titleText:"提示",
    tipText:'请输入密码',
    defaultText:"",
    validator:(v)=>false
  })
  let schcode='31ABEE44EFBD4DDAA228A354F8AA2227'
  let school = await AISchedulePrompt({
    titleText:"提示",
    tipText:`
    请选择校区(填数字)：
    1.翔安校区
    2.思明校区`,
    defaultText:"1",
    validator:(v)=>!/[12]?/.test(v)
  })

  if(school==2) schcode="2536FEA389E345EFAAC1E2FF32D80C84"

  let {
    resp: login
  } = sendQuest('POST', href + 'xk/LoginToXk', encodeURI(`userAccount=${encodeURIComponent(username)}&userPassword=&encoded=${encodeURIComponent(encodeInp(username))}%%%${encodeURIComponent(encodeInp(password))}`))
  if (login.match('请输入账号')) {
    //登录失败
    await AIScheduleAlert("登录失败，检查账号密码并确保在vpn登录后点击一键导入")
  }
  let ret2 = sendQuest("POST", href + 'xskb/xskb_list.do',`kbjcmsid=${schcode}`).resp
  let start = ret2.indexOf('<table id="kbtable"')
  let end = ret2.indexOf('<span><font color="red">注')
  if (start > 0 && end > 0) {
    // console.log(retHTML.slice(start,end))
    return ret2.slice(start, end)
  }
  throw Error('课表获取解析失败')
}