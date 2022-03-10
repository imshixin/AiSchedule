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
  $('table tbody tr').slice(1).each((i_tr, e_tr) => {
    let courseInfo = {

    }
    $(e_tr).children().each((i_td, e_td) => {
      if ($(e_td).text().trim() == '') {
        return
      }
      switch (i_td) {
        case 4:
          courseInfo.name = $(e_td).text().trim();
          break;
        case 7:
          courseInfo.teacher = $(e_td).text().trim();
          break;
        case 10:
          let children = e_td.children.filter(v => v.type == 'text')
          for (let i = 0; i < children.length; i++) {
            console.log(children[i]);
            if ((i % 2) == 0) {
              let infos = parseWeeksAndSections($(children[i]).text().trim());
              if (!infos.day) {
                break;
              }
              courseInfo.sections = infos.sections;
              courseInfo.weeks = infos.weeks;
              courseInfo.day = infos.day;
            } else if ((i % 2) == 1) {
              courseInfo.position = $(children[i]).text().trim()
              result.push(Object.assign({}, courseInfo));
            }

          }
          break;
      }
    })
  })
  console.log(result)
  return {
    courseInfos: result,
    sectionTimes:[
      {
      section:1,
      startTime:"08:30",
      endTime:"09:15"
    },
      {
      section:2,
      startTime:"09:25",
      endTime:"10:10"
    },
      {
      section:3,
      startTime:"10:30",
      endTime:"11:15"
    },
      {
      section:4,
      startTime:"11:12",
      endTime:"12:10"
    },
      {
      section:5,
      startTime:"14:10",
      endTime:"14:55"
    },
      {
      section:6,
      startTime:"15:05",
      endTime:"15:45"
    },
      {
      section:7,
      startTime:"15:55",
      endTime:"16:30"
    },
      {
      section:8,
      startTime:"16:45",
      endTime:"17:20"
    },
      {
      section:9,
      startTime:"17:30",
      endTime:"18:15"
    },
      {
      section:10,
      startTime:"19:00",
      endTime:"19:45"
    },
      {
      section:11,
      startTime:"19:55",
      endTime:"20:40"
    },
      {
      section:12,
      startTime:"20:50",
      endTime:"21:35"
    },
  ]
  }
}

function parseWeeksAndSections(str) {
  let infos = {
    sections: [],
    weeks: [],
    day: 0
  }
  let ret = /(.+)周\s+星期(.)\s+(.+)节/g.exec(str)
  if (!ret) {
    return {};
  }
  infos.day = parseDay(ret[2])
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
  if (ret[3].indexOf(',') >= 0) {
    ret[3].split(',').forEach(v => {
      let weekRange = v.indexOf('-') >= 0 ? v.split('-').map(va => Number(va)) : [Number(v), Number(v)];
      for (let i = weekRange[0]; i <= weekRange[1]; i++) {
        infos.sections.push({
          section: i
        })
      }
    });
  } else if (ret[3].indexOf('-') >= 0) {
    let weekRange = ret[3].split('-').map(v => Number(v));
    for (let i = weekRange[0]; i <= weekRange[1]; i++) {
      infos.sections.push({
        section: i
      });
    }
  } else {
    infos.sections.push({
      section: Number(ret[3])
    });
  }
  return infos;
}

function parseDay(str) {
  let day = 0;
  ['一', '二', '三', '四', '五', '六', '日'].forEach((v, i) => str.match(v) ? day = i + 1 : false);
  return day;
}
console.log(parseWeeksAndSections('11-18周 星期三 1-4节'));