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


  let ret1 = /^(.+)\(周\)\[(.+?)节\]$/g.exec(str);
  if(ret1){
    //weeks
    getWeeks(ret1[1],infos.weeks)
    //sections
    if(ret1[2].match(/(\d+)-(\d+)/)){
      let ret2 = /(\d+)-(\d+)/.exec(ret1[2]);
      for(let i = Number(ret2[1]);i<=Number(ret2[2]);i++){
        infos.sections.push({section:i})
      }
    }else{
      ret1[2].split('-').forEach(v=>infos.sections.push({section:Number(v)}))
    }
  }
  return infos;
}
function getWeeks(str,weeks) {
  if(str.indexOf(',')>=0){
    str.split(',').forEach(v=>{
      let weekRange = v.indexOf('-')>=0?v.split('-').map(va=>Number(va)):[Number(v),Number(v)];
      for(let i = weekRange[0];i<=weekRange[1];i++){
        weeks.myPush(i)
      }
    })
  }else if(str.indexOf('-')>=0){
    let weekRange = str.split('-').map(v=>Number(v));
    for(let i = weekRange[0];i<=weekRange[1];i++){
      weeks.myPush(i);
    }
  }else{
    weeks.myPush(Number(str))
  }
}