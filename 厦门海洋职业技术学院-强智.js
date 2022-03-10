/*
 * @Author: imsixn
 * @Date: 2021-04-09 22:56:24
 * @LastEditors: imsixn
 * @LastEditTime: 2022-03-10 12:25:33
 * @Description: file content
 */
function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  // let result = []
  const $ = cheerio.load(html, { decodeEntities: false })
  console.time('scheduleHtmlParser')
  let result = {
    courseInfos: [],
  }
  let trs = $('#kbtable tr')
  trs.slice(1, trs.length - 1).each((i_tr, ele_tr) => {
    //单行
    let tds = $(ele_tr).children()

    tds.slice(1, tds.length).each((i_td, ele_td) => {
      //day = i_td+1
      let courseInfo = {
        sections: [],
        weeks: [],
        name: '',
        day: i_td + 1,
      }
      //添加单项课程
      $(ele_td).children('.kbcontent').filter((i, el) => $(el).text().trim() != '')
        .each((i_div, ele_div) => {
          //过滤br
          let div_tags = ele_div.children.filter((v, i) => v.name ? v.name != 'br' : true)
          // console.log(div_tags)
          div_tags.forEach((v, i, arr) => {
            if (v.type == 'text' && !v.data.match(/-{8,}/)) {
              courseInfo.name += v.data
            } else if (v.type == 'tag' && v.name == 'font') {
              switch (v.attribs.title) {
                case '老师':
                  courseInfo.teacher = $(v).text().trim()
                  break
                case '周次(节次)':
                  let inf = getSectionAndWeeks($(v).text().trim())
                  courseInfo.weeks = inf.weeks
                  courseInfo.sections = inf.sections
                  if (!(arr[i + 1]) || arr[i + 1].type == 'text') {
                    // console.log(arr[i+1])
                    result.courseInfos.push(Object.assign({ position: '无地点' }, courseInfo))
                    courseInfo.name = ''
                  }
                  break
                case '教室':
                  courseInfo.position = $(v).text().trim()
                  result.courseInfos.push(Object.assign({}, courseInfo))
                  courseInfo.name = ''
                  break
              }
            }
          })
        })
    })
  })
  console.timeEnd('scheduleHtmlParser')
  console.log(result)
  return result.courseInfos
}
/* 检查重复课程 */
function checkCourse(courses, course) {
  return courses.some((v, i) => JSON.stringify(v) == JSON.stringify(course))
}
function getSectionAndWeeks(str) {

  let infos = { weeks: [], sections: [] }
  let res = /(.+)\(周\)\[(.+)节\]/g.exec(str)
  if (res) {
    //解析周次
    if (res[1].indexOf(',') >= 0) {
      res[1].split(',').forEach(v => {
        if (v.indexOf('-') >= 0) {
          let weekRange = v.split('-').map(va => Number(va))
          for (let i = weekRange[0]; i <= weekRange[1]; i++) {
            infos.weeks.push(i)
          }
        } else {
          infos.weeks.push(Number(v))
        }
      })
    } else {
      if (res[1].indexOf('-') >= 0) {
        let weekRange = res[1].split('-').map(va => Number(va))
        for (let i = weekRange[0]; i <= weekRange[1]; i++) {
          infos.weeks.push(i)
        }
      } else {
        infos.weeks.push(Number(res[1]))
      }
    }
    //解析节数
    let secs = res[2].split('-').map(v => Number(v))
    for (let i of secs) {
      infos.sections.push({ section: i })
    }
  }
  console.log(str, infos)
  return infos
}
// console.log(getSectionAndWeeks('15,18-19(周)[03-04节]'))
// console.log(getSectionAndWeeks('15,18-19(周)[03-04节]'))