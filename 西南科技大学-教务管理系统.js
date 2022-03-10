function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  const $ = cheerio.load(html,{decodeEntities:false});
  let result = []
  $('table tbody tr').each((i_tr,e_tr)=>{
    let curSection = i_tr+1;
    $(e_tr).children().filter((i,v)=>!$(v).text().match(/午|第.讲/g)).each((i_td,e_td)=>{
      let courseInfo = {
        sections:[{section:i_tr+1}],
        weeks:[],
        day:i_td+1
      }
      let ch = $(e_td).children()[0]
      $(ch).children().each((i_span,e_span)=>{
        switch(e_span.attribs.class){
          case 'course':
            courseInfo.name = $(e_span).text().trim();
            break;
          case 'teacher':
            courseInfo.teacher = $(e_span).text().trim();
            break;
          case 'week':
            let weekRange = $(e_span).text().split('(')[0].split('-').map(v=>Number(v));
            for(let i = weekRange[0];i<=weekRange[1];i++){
              courseInfo.weeks.push(i)
            }
            break;
          case 'place':
            courseInfo.position = $(e_span).text().trim();
            result.push(courseInfo);
            break;
        }
      })
    })
  })
  console.log(result)
  return { courseInfos: result }
}