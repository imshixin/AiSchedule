/*
 * @Author: your name
 * @Date: 2021-04-03 00:15:42
 * @LastEditTime: 2022-03-04 12:29:05
 * @LastEditors: imsixn
 * @Description: In User Settings Edit
 * @FilePath: \小爱课程表\武汉工商学院-树维.js
 */
const xhr = new XMLHttpRequest();
function sendQuest(method, url, data) {
  xhr.open(method, url, false);
  if (method == 'POST') {
    xhr.setRequestHeader('Content-Type', "application/x-www-form-urlencoded; charset=UTF-8")
  }
  data ? xhr.send(data) : xhr.send();
  return {
    code: xhr.status,
    resp: xhr.response
  };
}

function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
  //除函数名外都可编辑
  //以下为示例，您可以完全重写或在此基础上更改
  let script = sendQuest("GET", '/eams/static/scripts/sha1.js');
  // console.info(script)
  window.eval(script.resp);
  let username = prompt("请输入用户名");
  let password = prompt("请输入用户密码");
  let capacha = prompt("请输入网页中的验证码（没有请直接点确定）")
  /*
  let username = '1950805012';
  let password = 'Yk15571196056';
   */
  let uuid
  try {
    uuid = dom.querySelector('body>script:last-child').innerText.match(/\.SHA1\('(.+?)'/)[1];
  } catch (e) {
    sendQuest("GET","https://jxgl.wtbu.edu.cn/eams/logout.action");
    alert(`无法获取到uuid，已自动退出登录，请勿在网页登录账号
    打开页面后直接点击'一键导入'`)
    throw Error("无法获取到uuid");
  }
  password = CryptoJS.SHA1(uuid + password) + '';
  // console.log("uuid="+uuid+"password+"+password);
  let login = null;
  if(capacha.length==4){
    login = sendQuest("POST", "/eams/login.action", `username=${username}&password=${password}&encodedPassword=&aptcha_response=${capacha}&session_locale=zh_CN`)
  }else{
    login = sendQuest("POST", "/eams/login.action", `username=${username}&password=${password}&encodedPassword=&session_locale=zh_CN`)
  }
  if(login.resp.match('用户名')){
    confirm('登录失败，请检查用户名和密码');
    return null;
  }
  // //登录后
  /* 获取学期id */
  let {ids,sid:semesterId} = getIdsAndSemesterId()
  // let semesters = sendQuest("POST",'/eams/dataQuery.action',`dataType=semesterCalendar&value=${semesterId}&empty=false`).resp;
  // semesters = eval(`(${semesters})`);
  // console.log(semesters);

  /* 解析课表 */
  let courseScript = sendQuest("POST", '/eams/courseTableForStd!courseTable.action', 'setting.kind=std&startWeek=&project.id=1&semester.id='+semesterId+'&ids='+ids).resp;
  courseScript = courseScript.split('// function CourseTable in TaskActivity.js')[1].split('fillTable')[0]
  let ret1 = /table0\.marshalTable\(\d+,(\d+),(\d+)\);/.exec(courseScript)
  let courseInfos=[]
  courseScript.split('var teachers =').slice(1).forEach(v=>{
    let infos = parseCourse(v,Number(ret1[1]),Number(ret1[2]));
    courseInfos.push(infos);
  })
  console.log(courseInfos);
  return JSON.stringify(courseInfos)
}
function parseCourse(str,startWeek=1,endWeek=19) {
  let infos = {weeks:[],sections:[]};
  //teacher
  let reg1 = /(?:var\sactTeachers\s=\s)\[.+?\];/
  let ret1 = str.match(reg1)[0].replace("var actTeachers = ",'')
  let actTeacher = eval(ret1)
  let teachers = []
  actTeacher.forEach(v=>teachers.push(v.name))
  infos.teacher = teachers.join(',')
  //name,place,week
  let ret2 = /activity = new TaskActivity\(actTeacherId.join\(','\),actTeacherName.join\(','\),".+?","(.+?)",".+?","(.+?)","(.+?)".+?\);/.exec(str)
  infos.name = ret2[1].split('(')[0];
  infos.position = ret2[2];
  ret2[3].split('').slice(startWeek,endWeek).forEach((v,i)=>v=='1'?infos.weeks.push(i+1):false);
  //sections,days
  let ret3 = str.match(/index\s=(\d+)\*unitCount\+(\d+);/g);
  ret3.forEach(v=>{
    let secRet = /index\s=(\d+)\*unitCount\+(\d+);/g.exec(v);
    infos.day = Number(secRet[1])+1;
    infos.sections.push({section:Number(secRet[2])+1})
  })
  console.log(infos);
  return infos
}
function getIdsAndSemesterId() {
  let resp = sendQuest("GET",'/eams/courseTableForStd.action').resp;
  let ids = /bg.form.addInput\(form,"ids","(.+?)"\);/.exec(resp)
  let semester_id = /semester\.id="\+(\d+?)\+"/.exec(resp)
  return {ids:ids[1],sid:semester_id[1]}
}
