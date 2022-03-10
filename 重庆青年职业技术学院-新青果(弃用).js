function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  const $ = cheerio.load(html, {
    decodeEntities: false
  });
  let result = []
  $('table tbody tr').each((i_tr, e_tr) => {
    $(e_tr).children().filter((i, v) => !$(v).text().match(/(?:午|晚上)$/g))
      .slice(1).each((i_td, e_td) => {
        let ul = $(e_td).children('ul');
        if (ul.length > 0 && ul[0].children) {
          let courseInfo = {
            sections: [{
              section: i_tr + 1
            }],
            weeks:[],
            day:i_td+1
          }
          ul[0].children.filter(v => v.type == 'text').forEach(node => {

            let tmp = node.nodeValue.split('(', 2);
            courseInfo.name = tmp[0];
            let {position,weeks} = getWeeksAndPlace(tmp[1].slice(0,tmp[1].length-1))
            courseInfo.position = position;
            courseInfo.weeks = weeks;
            result.push(courseInfo)
          })
        }
      })
  })
  console.log(result)
  return {
    courseInfos: result
  }
}

function getWeeksAndPlace(str) {
  let tmp = str.split(' ',2)
  let infos = {
    position:tmp[1],
    weeks:[]
  }
  if(tmp[0].indexOf(',')>=0){
    tmp[0].split(',').forEach(v=>{
      let weekRange = v.indexOf('-')>=0?v.split('-').map((v,i)=>v?Number(v):(i==0?1:20)):[Number(v),Number(v)]
      for(let i = weekRange[0];i<=weekRange[1];i++){
        infos.weeks.push(i)
      }
    })
  }else if(tmp[0].indexOf('-')>=0){
    let weekRange = tmp[0].split('-').map((v,i)=>v?Number(v):(i==0?1:20))
    for(let i = weekRange[0];i<=weekRange[1];i++){
      infos.weeks.push(i)
    }
  }else{
    infos.weeks.push(Number(tmp[0]))
  }
  return infos
}
console.log(getWeeksAndPlace('5- Z627'));