function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  let {
    courseTable,
    sectionTimes
  } = JSON.parse(html);
  const $ = cheerio.load(courseTable, {
    decodeEntities: false
  })
  console.time("parser")
  let result = []
  let day = 0;
  let sectionStart = 0;
  $('tbody tr').slice(1).each((i_tr, e_tr) => {
    if (!$(e_tr).text().match('周')) {
      return
    }
    let courseInfo = {
      weeks: [],
      sections: []
    }
    $(e_tr).children().filter((i,v)=>{
      if (v.attribs.rowspan) {
        day = parseDays($(v).text())
        return false;
      }
      return true;
    }).each((i_td, e_td) => {
      // courseCount-=
      let nodeStr = $(e_td).text().trim()
      switch (i_td) {
        case 0: //weeks
          let weekRange = nodeStr.replace('周', '').split('-').map(v => Number(v))
          for (let i = weekRange[0]; i <= weekRange[1]; i++) {
            courseInfo.weeks.push(i)
          }
          break;
        case 1: //sectionstart
          sectionStart = Number(nodeStr);
          break;
        case 2: //sectionEnd
          for (let i = sectionStart; i <= Number(nodeStr); i++) {
            courseInfo.sections.push({
              section: i
            });
          }
          break;
        case 3: //name
          courseInfo.name = nodeStr;
          break;
        case 5: //teacher
          courseInfo.teacher = nodeStr ? nodeStr : '暂无老师';
          break;
        case 6: //position
          courseInfo.position = nodeStr ? nodeStr : '暂无地点';
          result.push(Object.assign({day}, courseInfo));
          break;
      }
    })
  })
  console.log(result);
  console.timeEnd('parser')
  return {
    courseInfos: result,
    sectionTimes
  }
}

function parseDays(str) {
  let day = 0;
  ['一', '二', '三', '四', '五', '六'].forEach((v, i) => str.match(v) ? day = i + 1 : false);
  return day;
}