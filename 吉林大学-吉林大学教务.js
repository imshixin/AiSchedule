function scheduleHtmlParser(html) {
  const $ = cheerio.load(html,{decodeEntities:false});
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  let result = []
  $('tr').slice(1).each((i_tr,e_tr)=>{
    $(e_tr).children().slice(1).each((i_td,e_tr)=>{
      let courseInfo = {day:i_td+1}
      //滤去br
      let children = e_tr.children.filter(v=>v.name?v.name!='br':true)
      children.forEach((v,i) => {
//         console.log(`i=${i},i%5=${i%5}`);
        switch (i%5) {
          case 0://名称
            courseInfo.name=v.nodeValue.replace(';','')
            break;
          case 1://时间
            let secs = getSectionsAndWeeks(v.nodeValue.trim())
            courseInfo.sections = secs.sections;
            courseInfo.weeks = secs.weeks;
            break;
          case 2://地点
            courseInfo.position=v.nodeValue.replace(';','')
            break;
          case 3://老师
            courseInfo.teacher=v.nodeValue.replace(';','')
            break;
          case 4:
            console.log(Object.assign({},courseInfo));
            result.push(Object.assign({},courseInfo))
            break;
        }
      });

    })
  });
  console.log(result)
  return { courseInfos: result }
}
function getSectionsAndWeeks(str) {
  let infos = {sections:[],weeks:[]}
  let ret1 = /(.+),第(.+)节;/g.exec(str)
  if(ret1){
    let secs = ret1[1].split('-').map(v=>Number(v))
    for(let i = secs[0];i<=secs[1];i++){
      infos.weeks.push(i)
    }
    ret1[2].indexOf(',')?ret1[2].split(',').forEach(v=>infos.sections.push({section:Number(v)}))
                :infos.sections.push({section:Number(ret1[2])})
  }
  return infos;
}