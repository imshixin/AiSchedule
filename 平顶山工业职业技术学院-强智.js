function scheduleHtmlParser(html) {
  const $ = cheerio.load(html, {
    decodeEntities: false
  });
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  console.time('scheduleHtmlParser');
  let result = {
    courseInfos: [],
  }
  let trs = $('#kbtable tr');
  trs.slice(1, trs.length - 1).each((i_tr, ele_tr) => {
    //单行
    let tds = $(ele_tr).children();
    tds.slice(1, tds.length).each((i_td, ele_td) => {
      //day = i_td+1
      let courseInfo = {
        sections: [],
        weeks: [],
        name: '',
        day: i_td + 1,
      }
      //单项课程
      $(ele_td).children('.kbcontent').filter((i, el) => $(el).text().trim() != '')
        .each((i_div, ele_div) => {
          //过滤br
          let div_tags = ele_div.children.filter((v, i) => v.name ? v.name != 'br' : true)
          // console.log(div_tags);
          div_tags.forEach((v, i, arr) => {
            if (v.type == 'text') {
              if (v.data.match(/-{8,}/)) return;
              courseInfo.name += v.data;
            } else if (v.type == 'tag' && v.name == 'font') {
              switch (v.attribs.title) {
                case '老师':
                  courseInfo.teacher = $(v).text().trim();
                  break;
                case '周次(节次)':
                  // courseInfo = Object.assign(courseInfo,getSectionAndWeeks($(v).text().trim()));
                  let {
                    sections, weeks
                  } = getSectionAndWeeks($(v).text().trim());
                  courseInfo.sections = sections;
                  courseInfo.weeks = weeks;
                  break;
                case '教室':
                  courseInfo.position = $(v).text().trim();
                  result.courseInfos.push(Object.assign({}, courseInfo));
                  courseInfo.name = '';
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

function getSectionAndWeeks(str) {
  // console.log(str);
  /* 该学校课表时间比较特殊，第11-12节课是在中午,所以应该把第11-12改成05-06 */
  let infos = {
    sections: [],
    weeks: []
  }
  let flag = 0;
  if (str.match('单')) {
    str = str.replace('单', '');
    flag = 1;
  } else if (str.match('双', '')) {
    str = str.replace('双', '');
    flag = 2;
  }
  let res = /(.+)\(周\)\[(.+)节\]/g.exec(str);
  if (res) {
    //解析周次
    infos.weeks = getWeeks(res[1]);
    //解析节数
    if (res[2].indexOf('-') >= 0) {
      let secInfo = res[2].split('-').map(v => v[0] == '0' ? Number(v[1]) : Number(v))
      for (let i = secInfo[0]; i <= secInfo[1]; i++) {
        if (i >= 11) {
          infos.sections.push({
            section: i - 6
          });
        } else if (i >= 5) {
          infos.sections.push({
            section: i + 2
          });
        } else {
          infos.sections.push({
            section: i
          });
        }
      }
    } else {
      res[2].split(',').forEach(v => infos.sections.push({
        section: Number(v)
      }))
    }
  }
  // console.log(infos);
  return infos;
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