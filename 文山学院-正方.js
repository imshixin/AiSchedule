function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  let result = [];
  const $ = cheerio.load(html, {
    decodeEntities: false
  });
  let trs = $('tr');
  trs.slice(2, trs.length).each((i_tr, ele_tr) => {

    let tds = $(ele_tr).children();
    //所有行
    if ($(ele_tr).children().eq(0).text().match(/午|晚上/)) {
      tds = tds.slice(2, tds.length);
    } else {
      tds = tds.slice(1, tds.length);
    }
    $(tds).each((i_td, ele_td) => {
      /* 每一项课程 */
      /* i_td+1表示第几节课 */
      let cInfos = getcourseInfo(ele_td);
      for(let cInfo of cInfos){
        result.push(cInfo)
      }
    })
  })
  console.log(result);
  return {
    courseInfos: result,
    sectionTimes: [{
      'section':1,
      'startTime':'08:00',
      'endTime':'08:45'
    },{
      'section':2,
      'startTime':'08:55',
      'endTime':'09:40'
    },
    {
      'section':3,
      'startTime':'10:10',
      'endTime':'10:55'
    },{
      'section':4,
      'startTime':'11:05',
      'endTime':'11:50'
    },{
      'section':5,
      'startTime':'14:30',
      'endTime':'15:15'
    },{
      'section':6,
      'startTime':'15:25',
      'endTime':'16:10'
    },{
      'section':7,
      'startTime':'16:30',
      'endTime':'17:15'
    },{
      'section':8,
      'startTime':'17:25',
      'endTime':'18:10'
    },{
      'section':9,
      'startTime':'19:30',
      'endTime':'20:15'
    },{
      'section':10,
      'startTime':'20:25',
      'endTime':'21:10'
    }]
  };
}
/* 返回课程列表，为空就返回[] */
function getcourseInfo(ele_td) {
  let courseInfos = [];
  let children = ele_td.children.filter((v, i, arr) => {
    /* 滤去br */
    return v.type == 'text';
  })
  //滤去有特殊时间的课程
  children = pureCourse(children);
  let cI = {};
  for (let i = 0; i < children.length; i++) {
    let node = children[i];
    switch (i % 4) {
      case 0: //名称
        cI.name = node.nodeValue;
        break;
      case 1: //时间信息,在此结算
        let result = getSections(node.nodeValue);
        cI.day = result.day;
        cI.sections = result.sections;
        cI.weeks = result.weeks;
        break;
      case 2: //老师
        cI.teacher = node.nodeValue;
        break;
      case 3: //老师
        cI.position = node.nodeValue;
        courseInfos.push(cI);
        cI={};
        break;
    }
  }
  /* 如果同一时间有两个课程
    后添加的会被覆盖掉
    将两个课周次拆分并提醒用户自定义修改
    一般同一时间可能会有两个课重复
    若有多个，到时候再想办法
  */
    if(courseInfos.length==2){
      if(checkIsSame(courseInfos[0],courseInfos[1])){
        courseInfos[1].weeks = courseInfos[0].weeks.filter(v=>courseInfos[1].weeks.indexOf(v)<0)
      }
    }
  console.log(courseInfos);
  return courseInfos;
}
function pureCourse(children) {
  for(let i=0;i<children.length;i++){
    if(children[i].data.match(/年.+月.+日/g)){
      children.splice(i,2);
      i--;
    }
  }
  return children;
}
function checkIsSame(course1,course2) {
  if(course1.day!=course2){
    return false;
  }
  let flag = course1.sections.some(v=>course2.sections.map(v=>v.section).indexOf(v.section)>=0?true:false);
  console.info(flag);
  return flag;
}
/* 返回解析后的info：
{
  weeks: [ 1, 3, 5, 6 ],
  sections: [ { section: 7 }, { section: 8 } ],
  day: 7
}
*/
function getSections(str) {
  let infos = {
    weeks: [],
    sections: [],
    day: 7
  };
  let ret1 = str.match(/单周|双周/g)
  const weekStrs = ['一', '二', '三', '四', '五', '六'];
  let ret2 = /周(.)第(.+)节\{第(.+?)周/g.exec(str);
  //解析day
  weekStrs.forEach((v, i, arr) => v == ret2[1] ? infos.day = i + 1 : false)
  //解析sections
  ret2[2].split(',').forEach((v, i, arr) => infos.sections.push({
    section: Number(v)
  }))
  //解析weeks
  if (ret2[3].indexOf('-') > 0) {
    let weekRange = ret2[3].split('-');
    for (let i = Number(weekRange[0]); i <= Number(weekRange[1]); i++) {
      infos.weeks.push(i);
    }
  } else {
    ret2[3].split(',').forEach((v, i, arr) => infos.weeks.push(Number(v)))
  }
  if(!ret1){
    return infos;
  }
  if(ret1[0]=='单周'){
    infos.weeks = infos.weeks.filter((v,i,arr)=>v%2!=0);
  }else{//双周
    infos.weeks = infos.weeks.filter((v,i,arr)=>v%2==0);
  }
  return infos;
}