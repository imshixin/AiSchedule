function scheduleHtmlParser(html) {
  const $ = cheerio.load(html,{decodeEntities:false});
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  let result = []
  $('div.dojoxGridRow').each((i_div,e_div)=>{
    let courseInfos=[]
    let courseInfo = {}
//     console.log(e_div);
    $(e_div).find('td').each((i_td,e_td)=>{
      // console.log(e_td);
      switch (i_td) {
        case 0:
          courseInfo.name = e_td.firstChild.nodeValue
          break;
        case 1:
          if(e_td.children.length==0){
            console.log('out');
            return
          }
          e_td.children.filter(v=>v.name?v.name!='br':true).forEach(v=>{
            courseInfos.push(getSectionsAndWeeks(v.nodeValue))
          })
          break;
        case 2:
          courseInfo.teacher = e_td.firstChild.nodeValue
          break;
      }
    })
    // console.log(courseInfo);
    // console.log('--------------');
    // console.log(courseInfos);
    courseInfos.forEach(v=>result.push(Object.assign(v,courseInfo)))
  })
  console.log(result)
  return { courseInfos: result ,
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
      'startTime':'10:00',
      'endTime':'10:45'
    },{
      'section':4,
      'startTime':'10:55',
      'endTime':'11:40'
    },{
      'section':5,
      'startTime':'13:30',
      'endTime':'14:15'
    },{
      'section':6,
      'startTime':'14:25',
      'endTime':'15:10'
    },{
      'section':7,
      'startTime':'15:30',
      'endTime':'16:15'
    },{
      'section':8,
      'startTime':'16:25',
      'endTime':'17:10'
    },{ 'section':9,
      'startTime':'18:30',
      'endTime':'19:15'
    },{
      'section':10,
      'startTime':'19:25',
      'endTime':'20:10'
    }
    ,{
      'section':11,
      'startTime':'20:20',
      'endTime':'21:05'
    }
  ]}
}
function getSectionsAndWeeks(str){
  const weekStrs = ['一', '二', '三', '四', '五', '六','日'];
  let infos = {
    sections:[],
    weeks:[],
    day:0
  }
  let ret1 = /周(.)第(.+)节\{第(\d*)-(\d*)周\|?(.?)周?\}(.+)/g.exec(str)
  console.log(ret1);
  if(!ret1){
    return infos;
  }
  weekStrs.forEach((v,i)=>v==ret1[1]?infos.day = i+1:false)
  ret1[2].split(',').forEach(v=>infos.sections.push({section:Number(v)}))
  let weekStart = ret1[3]==''?1:Number(ret1[3])
  let weekEnd = ret1[4]==''?20:Number(ret1[4])
  for(;weekStart<=weekEnd;weekStart++){
    infos.weeks.push(weekStart)
  }
  infos.position = ret1[6]
  if(ret1[5]){
    ret1[5]=='单'?infos.weeks = infos.weeks.filter(v=>v%2!=0):infos.weeks = infos.weeks.filter(v=>v%2==0)
  }
  return infos;
}


// console.log(getSectionsAndWeeks('周一第1,2节{第1-15周|双周}前卫-李四光楼#308'));