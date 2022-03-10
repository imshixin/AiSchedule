function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
  //除函数名外都可编辑
  //以下为示例，您可以完全重写或在此基础上更改
let root_table = dom.querySelector('.admintable')
let head_name = root_table.querySelector('td span font')
if(head_name&&head_name.innerText.match('课表')){
  let [courseTable,timeTable] = root_table.querySelectorAll('.admintable')
  let times = timeTable.querySelectorAll('tbody tr:not(:first-of-type)>td[align="left"]')
  let json = {courseTable:courseTable.outerHTML,sectionTimes:[]}
  times.forEach((v,i)=>{
    console.log(v);
    let [startTime,endTime] = v.innerText.split('-')
    json.sectionTimes.push({section:i+1,startTime,endTime})
  });
  return JSON.stringify(json);
}
throw Error('找不到课表，请确认已在课表页')
}