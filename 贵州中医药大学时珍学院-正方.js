function scheduleHtmlParser(html) {
  const $ = cheerio.load(html, {
    decodeEntities: false
  });
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  let result = []
  let bbb = $('#table1 .timetable_con')
  for (let u = 0; u < bbb.length; u++) {
    let re = {
      sections: [],
      weeks: []
    }
    let aaa = $(bbb[u]).find('span');
    let uuu = $(bbb[u]).find('u');//调课课程用u

    let week = $(bbb[u]).parent('td')[0].attribs.id
    if (week) {
      re.day = Number(week.split('-')[0])
    }
    for (let i = 0; i < aaa.length; i++) {

      if (aaa[i].attribs.title == '上课地点') {
        console.log();
        for (let j = 0; j < $(aaa[i]).next()[0].children.length; j++) {
          re.position = $(aaa[i]).next()[0].children[j].data
        }
      }
      if (aaa[i].attribs.title == '节/周') {

        for (let j = 0; j < $(aaa[i]).next()[0].children.length; j++) {

          let lesson = $(aaa[i]).next()[0].children[j].data

          console.info(lesson)
          for (let a = Number(lesson.split(')')[0].split('(')[1].split('-')[0]); a < Number(lesson.split(')')[0].split('(')[1].split('-')[1].split('节')[0]) + 1; a++) {

            re.sections.push({
              section: a
            })
          }
          if(lesson.split(')')[1].indexOf('-')<0){
            //发生调课后,可能有单周
            //都是可能基本都是在调课前吧
            re.weeks.push(Number(lesson.split(')')[1].split('周')[0]));
          }else{
            for (let a = Number(lesson.split(')')[1].split('-')[0]); a < Number(lesson.split(')')[1].split('-')[1].split('周')[0]) + 1; a++) {
              re.weeks.push(a)
            }
          }
        }
      }

      if (aaa[i].attribs.title == '教师') {

        for (let j = 0; j < $(aaa[i]).next()[0].children.length; j++) {
          re.teacher = $(aaa[i]).next()[0].children[j].data
        }
      }

      if (aaa[i].attribs.class == 'title') {
        for (let j = 0; j < $(aaa[i]).children()[0].children.length; j++) {
          re.name = $(aaa[i]).children()[0].children[j].data
        }
      }else if(uuu.length>0&&uuu[0].attribs.class.indexOf('title')>=0){
        
        for (let j = 0; j < $(uuu[0]).children()[0].children.length; j++) {
          re.name = $(uuu[0]).children()[0].children[j].data
        }
      }

    }
    
    result.push(re)
  }
  console.log(result)

  return {
    courseInfos: result,
    sectionTimes: [{
        section: 1,
        'startTime': '8:30',
        'endTime': '9:10'
      },
      {
        section: 2,
        'startTime': '9:20',
        'endTime': '10:00'
      },
      {
        section: 3,
        'startTime': '10:20',
        'endTime': '11:00'
      },
      {
        section: 4,
        'startTime': '11:10',
        'endTime': '11:50'
      },
      {
        section: 5,
        'startTime': '13:50',
        'endTime': '14:30'
      },
      {
        section: 6,
        'startTime': '14:40',
        'endTime': '15:20'
      },
      {
        section: 7,
        'startTime': '15:40',
        'endTime': '16:20'
      },
      {
        section: 8,
        'startTime': '16:30',
        'endTime': '17:10'
      },
      {
        section: 9,
        'startTime': '18:40',
        'endTime': '20:00'
      }
    ]
  }
}