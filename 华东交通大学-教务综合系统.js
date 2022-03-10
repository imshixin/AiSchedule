function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  const $ = cheerio.load(html, {
    decodeEntities: false
  })
  let result = []
  console.time('scheduleHtmlParser')
  $('#courseSche tbody tr').slice(1).each((i_tr, e_tr) => {
    $(e_tr).children().slice(1).each((i_td, e_td) => {
      if($(e_td).text().trim()==''){
        return;
      }
      let courseInfo = {
        day: i_td + 1
      }
      e_td.children.filter(v => v.type == 'text').forEach((node, index) => {
        let offset = 0;
        let nodeStr = node.nodeValue.trim()
        switch ((index % 3)+offset) {
          case 0:
            courseInfo.name = nodeStr;
            break;
          case 1:
            /*
            这里有两种课程格式
            第一种要直接添加课程
            同时offset+1为了提前开始下一个课程解析
            判断方法是，如果node.nodeValue中不包含@则为第一种
             */
            /* 1 */
            if(!nodeStr.match('@')){
              let [teacher, ...secweekStr] = nodeStr.split(' ')

              let {sections,weeks} = getSectionsAndWeeks(secweekStr.join(' ').trim());
              courseInfo.sections = sections;
              courseInfo.weeks = weeks;
              courseInfo.teacher = teacher;
              courseInfo.position = '地点未定'
              result.push(Object.assign({},courseInfo));
              offset+=1;
              break;
            }
            /* 2 */
            let [teacher, ...position] = nodeStr.split(' ')
            courseInfo.teacher = teacher;
            courseInfo.position = position.join('').replace("@",'');
            break;
          case 2:
            let {sections,weeks} = getSectionsAndWeeks(nodeStr);
            courseInfo.sections = sections;
            courseInfo.weeks = weeks;
            result.push(Object.assign({},courseInfo));
            break;
        }
      });
    });
  });
  console.log(result);
  console.timeEnd('scheduleHtmlParser')
  return {
    courseInfos: result
  };
}

function getSectionsAndWeeks(str) {
  let infos = {
    sections: [],
    weeks: []
  };
  let weekFlag = 0;
  if (str.match('单')) {
    weekFlag = 1;
    str = str.replace('(单)', '')
  } else if (str.match('双')) {
    weekFlag = 2;
    str = str.replace('(双)', '')
  }
  let ret = /^(.+?)\s+(.+)$/g.exec(str)
  if (!ret) {
    return infos;
  }
  //weeks
  if (ret[1].indexOf(',') >= 0) {
    ret[1].split(',').forEach(v => {
      let weekRange = v.indexOf('-') >= 0 ? v.split('-').map(va => Number(va)) : [Number(v), Number(v)];
      for (let i = weekRange[0]; i <= weekRange[1]; i++) {
        infos.weeks.push(i)
      }
    });
  } else if (ret[1].indexOf('-') >= 0) {
    let weekRange = ret[1].split('-').map(v => Number(v));
    for (let i = weekRange[0]; i <= weekRange[1]; i++) {
      infos.weeks.push(i);
    }
  } else {
    infos.weeks.push(Number(ret[1]));
  }
  //sections
  if (ret[2].indexOf(',') >= 0) {
    ret[2].split(',').forEach(v => {
      let weekRange = v.indexOf('-') >= 0 ? v.split('-').map(va => Number(va)) : [Number(v), Number(v)];
      for (let i = weekRange[0]; i <= weekRange[1]; i++) {
        infos.sections.push({section:i})
      }
    });
  } else if (ret[2].indexOf('-') >= 0) {
    let weekRange = ret[2].split('-').map(v => Number(v));
    for (let i = weekRange[0]; i <= weekRange[1]; i++) {
      infos.sections.push({section:i});
    }
  } else {
    infos.sections.push({section:Number(ret[2])});
  }
  //单双周
  if (weekFlag == 1) {
    infos.weeks = infos.weeks.filter(v => v % 2 != 0); //单周
  } else if (weekFlag == 2) {
    infos.weeks = infos.weeks.filter(v => v % 2 == 0);
  }
  return infos;
}
// console.log(getSectionsAndWeeks('1-10  5,6,7,8'));