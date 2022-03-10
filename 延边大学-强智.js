function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  // let result = []
  const $ = cheerio.load(html,{decodeEntities:false})
  console.time('scheduleHtmlParser');
  let result = {
    courseInfos:[],
    sectionTimes:[
      {
        section:1,
        'startTime':'08:00',
        'endTime':'08:45'
      },
      {
        section:2,
        'startTime':'08:50',
        'endTime':'09:35'
      },
      {
        section:3,
        'startTime':'09:55',
        'endTime':'10:40'
      },
      {
        section:4,
        'startTime':'10:45',
        'endTime':'11:30'
      },
      {
        section:5,
        'startTime':'13:00',
        'endTime':'13:45'
      },
      {
        section:6,
        'startTime':'13:50',
        'endTime':'14:35'
      },
      {
        section:7,
        'startTime':'14:55',
        'endTime':'15:40'
      },
      {
        section:8,
        'startTime':'15:45',
        'endTime':'16:30'
      },
      {
        section:9,
        'startTime':'17:30',
        'endTime':'18:15'
      },
      {
        section:10,
        'startTime':'18:20',
        'endTime':'19:05'
      },
      {
        section:11,
        'startTime':'19:25',
        'endTime':'20:10'
      },
      {
        section:12,
        'startTime':'20:15',
        'endTime':'21:00'
      },
    ]
  }
  $('#kbtable tr').slice(1).each((i_tr,ele_tr)=>{
    //单行
    $(ele_tr).children().slice(1).each((i_td,ele_td)=>{
      //day = i_td+1
      let courseInfo={
        sections:[],
        weeks:[],
        name:'',
        day:i_td+1,
      }
      //单项课程
      $(ele_td).children('.kbcontent').filter((i,el)=>$(el).text().trim()!='')
      .each((i_div,ele_div)=>{
        //过滤br
        let div_tags = ele_div.children.filter((v,i)=>v.name?v.name!='br':true)
        // console.log(div_tags);

        div_tags.forEach((v,i,arr)=>{
          if(v.type=='text'&&!v.data.match(/-{8,}/)){
            courseInfo.name =v.data;
          }else if(v.type=='tag'&&v.name=='font'){
            switch (v.attribs.title) {
              case '老师':
                courseInfo.teacher = $(v).text().trim();
                break;
              case '周次(节次)':
                let {weeks,sections} = getSectionsAndWeeks($(v).text().trim());
                courseInfo.sections = sections;
                courseInfo.weeks = weeks;
                break;
              case '教室':
                courseInfo.position = $(v).text().trim();
                result.courseInfos.push(Object.assign({},courseInfo));
                break;
            }
          }
        })
      })
    })
  })
  console.timeEnd('scheduleHtmlParser');
  console.log(result)
  return result
}
function getSectionsAndWeeks(str) {
  let infos={sections:[],weeks:[]};
  infos.weeks.myPush = infos.weeks.push;
  if(str.match('单')){
    str = str.replace('单','')
    infos.weeks.myPush = function (value) {
      return value%2==1?this.push(value):false;
    }
  }else if(str.match('双')){
    str = str.replace('双','')
    infos.weeks.myPush = function (value) {
      return value%2==0?this.push(value):this.length;
    }
  }


  let ret1 = /^(.+)\(周\)\[(\d+)-(\d+)节\]$/g.exec(str);
  if(ret1){
    //weeks
    if(ret1[1].indexOf(',')>=0){
      ret1[1].split(',').forEach(v=>{
        let weekRange = v.indexOf('-')>=0?v.split('-').map(va=>Number(va)):[Number(v),Number(v)];
        for(let i = weekRange[0];i<=weekRange[1];i++){
          infos.weeks.myPush(i)
        }
      })
    }else if(ret1[1].indexOf('-')>=0){
      let weekRange = ret1[1].split('-').map(v=>Number(v));
      for(let i = weekRange[0];i<=weekRange[1];i++){
        infos.weeks.myPush(i);
      }
    }else{
      infos.weeks.myPush(Number(ret1[1]))
    }
    //sections
    for(let i = Number(ret1[2]);i<=Number(ret1[3]);i++){
      infos.sections.push({section:i})
    }
  }
  return infos;
}