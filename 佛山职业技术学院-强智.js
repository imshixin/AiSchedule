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
  }
  let trs = $('#kbtable tr');
  trs.slice(1,trs.length-1).each((i_tr,ele_tr)=>{
    //单行
    let tds = $(ele_tr).children();

    tds.slice(1,tds.length).each((i_td,ele_td)=>{
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
                // courseInfo = Object.assign(courseInfo,getSectionAndWeeks($(v).text().trim()));
                courseInfo.weeks = getWeeks($(v).text().trim());
                break;
              case '教室':
                let inf = getSectionAndPlace($(v).text().trim())
                courseInfo.position = inf.position;
                courseInfo.sections = inf.sections
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
function getWeeks(str) {
  let weeks=[]
  str = str.replace('周','')
  let ret1 = /^\d+$/g.exec(str);
  if(ret1){
    weeks.push(Number(ret1[0]));
    return weeks;
  }
  if(str.indexOf(',')>=0){
    str.split(',').forEach(v=>{
      if(v.indexOf('-')<0){
        weeks.push(Number(v))
        return
      }
      let range = v.split('-').map(v=>Number(v))
      for(let i = range[0];i<=range[1];i++){
        weeks.push(i)
      }
    })
  }else{
    let range = str.split('-').map(v=>Number(v))
    for(let i = range[0];i<=range[1];i++){
      weeks.push(i)
    }
  }
  return weeks;
}
function getSectionAndPlace(str) {
  let infos = {position:'',sections:[]}
  let ret1 = /(.+)\[(\d+)-(\d+)\]节/g.exec(str)
  if(ret1){
    infos.position = ret1[1];
    for(let i = parseInt(ret1[2]);i<=parseInt(ret1[3]);i++){
      infos.sections.push({section:i})
    }
  }
  return infos;
}