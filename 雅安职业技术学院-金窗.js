function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  const $ = cheerio.load(html, {
    decodeEntities: false
  })
  console.time('parser')
  let result = []
  $('tbody tr').slice(1).each((i_tr, e_tr) => {
    $(e_tr).children().filter((i, v) => !$(v).text().match(/午|晚上/)).slice(1).each((i_td, e_td) => {
      if ($(e_td).text() == '&nbsp;') return;
      let courseInfo = {
        day: i_td + 1,
        sections: [],
        weeks: []
      }
      let flag = 0;
      e_td.children.filter(v => v.type == 'text' && v.nodeValue != '&nbsp;').forEach((node, index) => {
        let val = node.nodeValue.trim();
        switch (index % 5) {
          case 0:
            courseInfo.name = val;
            break;
          case 1:
            if (val.match('单')) {
              flag = 1;
              val = val.replace('(单)', '')
            } else if (val.match('双')) {
              flag = 2;
              val = val.replace('(双)', '')
            }
            let secRange = val.replace('(', '').replace('节)', '').split('').map(v => Number(v))
            if (secRange[0] == 9) {
              courseInfo.sections = [{
                section: 9
              }, {
                section: 10
              }]
            } else {
              for (let i = secRange[0]; i <= secRange[1]; i++) {
                courseInfo.sections.push({
                  section: i
                })
              }
            }
            break;
          case 2:
            courseInfo.teacher = val;
            break;
          case 3:
            courseInfo.position = val;
            break;
          case 4:
            courseInfo.weeks = getWeeks(val.replace('周', ''), flag);
            result.push(Object.assign({}, courseInfo))
            courseInfo.sections = []
            break;
        }
      })
    })
  })
  console.info(result)
  console.timeEnd('parser')
  return {
    courseInfos: result
  }
}

function getWeeks(str, flag) { //flag==1:单周，flag==2：双周
  let weeks = []
  if (str.indexOf(',') >= 0) {
    str.split(',').forEach(v => {
      let weekRange = v.indexOf('-') >= 0 ? v.split('-').map(va => Number(va)) : [Number(v), Number(v)];
      for (let i = weekRange[0]; i <= weekRange[1]; i++) {
        weeks.push(i)
      }
    })
  } else if (str.indexOf('-') >= 0) {
    let weekRange = str.split('-').map(v => Number(v));
    for (let i = weekRange[0]; i <= weekRange[1]; i++) {
      weeks.push(i);
    }
  } else {
    weeks.push(Number(str))
  }
  if (flag == 1) weeks = weeks.filter(v => v % 2 == 1);
  else if (flag == 2) weeks = weeks.filter(v => v % 2 == 0);
  return weeks;
}