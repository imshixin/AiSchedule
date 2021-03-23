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
  let trs = $('.table tbody tr').slice(1)
  trs.each((i_tr, e_tr) => {
    $(e_tr).children('.td').each((i_td, e_td) => {
      $(e_td).children().each((i_div, e_div) => {
        if ($(e_div).text().trim() == '') {
          return
        }
        let courseInfo = {
          day: i_td + 1
        }
        // console.log(e_div.children);
        e_div.children.filter(v => v.name ? v.name != 'br' : true).forEach((node, index) => {
          switch (index % 4) {
            case 0:
              courseInfo.name = $(node).text().trim()
              break;
            case 1:
              courseInfo.teacher = node.nodeValue
              break;
            case 2:
              let {
                sections, weeks
              } = getSectionsAndWeeks(node.nodeValue)
              courseInfo.sections = sections;
              courseInfo.weeks = weeks;
              break;
            case 3:
              courseInfo.position = node.nodeValue
              result.push(Object.assign({}, courseInfo))
              courseInfo = {};
              // console.log(courseInfo);
              break;

          }
        })
      })
    })
  })
  console.log(result)
  return {
    courseInfos: result
  }
}

function getSectionsAndWeeks(str) {
  let flag;
  if (str.match(/单|双/)) {
    flag = str.match(/单|双/)[0]
    str.replace(flag)
  }
  let infos = {
    sections: [],
    weeks: []
  }
  let ret1 = /^(.+?)\s*\[(.+)\]$/g.exec(str)
  if (ret1) {
    if (ret1[1].indexOf('-') >= 0) {
      let weekRange = ret1[1].split('-').map(v => parseInt(v))
      for (let i = weekRange[0]; i <= weekRange[1]; i++) {
        infos.weeks.push(i);
      }
    } else {
      infos.weeks.push(Number(ret1[1]))
    }
    if (ret1[2].indexOf('-') >= 0) {
      let sectionRange = ret1[2].split('-').map(v => Number(v))
      for (let i = sectionRange[0]; i <= sectionRange[1]; i++) {
        infos.sections.push({
          section: i
        })
      }
    } else {
      infos.sections.push({
        section: Number(ret1[2])
      })
    }
  }
  if (flag && flag == '单') {
    infos.weeks = infos.weeks.filter(v => v % 2 != 0)
  } else if (flag && flag == '双') {
    infos.weeks = infos.weeks.filter(v => v % 2 == 0)
  }
  return infos
}
// console.log(getSectionsAndWeeks('1-16[3-4]'));