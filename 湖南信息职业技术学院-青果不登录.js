function scheduleHtmlParser(html) {
  const $ = cheerio.load(html, {
    decodeEntities:false
  })
  let result = []
  console.time("parser")
  $('tr').slice(1).each((i_tr, e_tr) => {
    $(e_tr).children().filter((i, v) => !$(v).text().match(/午|晚上/)).slice(1).each((i_td, e_td) => {
      let children = e_td.children.filter(v => v.type == 'text');
      let courseInfo = {
        day: i_td + 1,
      }
      let offset = 0;
      children.forEach((node, index) => {
        // console.log(node.nodeValue);
        // console.log('原i='+((index+offset)%3)+"-----"+node.nodeValue);
        switch ((index+offset)%3) {
          case 0:
            courseInfo.name = node.nodeValue.trim();
            break;
          case 1:

            if(node.nodeValue.replace(/.+\]\s*/,'').length>3){
              console.log(node.nodeValue+'-----'+node.nodeValue.replace(/.+\]\s*/,''));
              let infos  = parseCourse(node.nodeValue.trim());
              infos.name = courseInfo.name;
              infos.day = courseInfo.day;
              console.log(1111);
              result.push(infos)
              offset+=1;
              break;
            }
            let splitI = node.nodeValue.indexOf(' ');
            courseInfo.teacher = node.nodeValue.slice(0,splitI)
            let infos = getSectionAndWeeks(node.nodeValue.slice(splitI))
            courseInfo.sections = infos.sections;
            courseInfo.weeks = infos.weeks;
            break;
          case 2:
            courseInfo.position = node.nodeValue.trim()
            console.log(courseInfo);
            result.push(Object.assign({},courseInfo))
            // offset-=1;
            break;
        }
        // console.log('i='+((index+offset)%3)+"-----"+node.nodeValue);
      });
    })
  })
  console.log(result)
  console.timeEnd('parser')
  return {
    courseInfos: result,
    sectionTimes:[
      {
        section:1,
        'startTime':'08:00',
        'endTime':'09:10'
      }, {
        section:2,
        'startTime':'09:20',
        'endTime':'10:00'
      }, {
        section:3,
        'startTime':'10:20',
        'endTime':'11:00'
      }, {
        section:4,
        'startTime':'11:10',
        'endTime':'11:50'
      }, {
        section:5,
        'startTime':'14:00',
        'endTime':'14:40'
      }, {
        section:6,
        'startTime':'14:50',
        'endTime':'15:30'
      }, {
        section:7,
        'startTime':'15:50',
        'endTime':'16:30'
      }, {
        section:8,
        'startTime':'16:40',
        'endTime':'17:20'
      }, {
        section:9,
        'startTime':'19:00',
        'endTime':'19:40'
      }, {
        section:10,
        'startTime':'19:50',
        'endTime':'20:30'
      }, {
        section:11,
        'startTime':'20:40',
        'endTime':'21:20'
      }, {
        section:12,
        'startTime':'21:20',
        'endTime':'22:00'
      },
    ]
  }
}

function getSectionAndWeeks(str) {
  let infos = {
    sections: [],
    weeks: []
  }
  let weekFlag = 0;
  if (str.match(/单周|双周/g)) {
    if (str.indexOf('单周')>=0) {
      str = str.replace("单周", '周');
      weekFlag = 1;
    } else {
      str = str.replace("双周", '周');
      weekFlag = 2;
    }
  }
  let ret1 = /\[(.+?)\s*(?:\?|周)\]\[(\d+)-(\d+)节\]/g.exec(str)
  if (ret1) {
    //weeks
    if (ret1[1].indexOf(',') >= 0) {
      ret1[1].replace(/,\s?/,', ').split(', ').forEach(v => {
        let weekRange = v.indexOf('-') >= 0 ? v.split('-').map(va => Number(va)) : [Number(v), Number(v)]
        for (let i = weekRange[0]; i <= weekRange[1]; i++) {
          infos.weeks.push(i);
        }
      })

    } else if (ret1[1].indexOf('-') >= 0) {
      let weekRange = ret1[1].split('-').map(v => Number(v));
      for (let i = weekRange[0]; i <= weekRange[1]; i++) {
        infos.weeks.push(i);
      }
    } else {
      infos.weeks.push(Number(ret1[1]))
    }
    //sections
    for (let i = Number(ret1[2]); i <= Number(ret1[3]); i++) {
      infos.sections.push({
        section: i
      })
    }
    if (weekFlag == 1) {
      infos.weeks = infos.weeks.filter(v => v % 2 != 0)
    } else if (weekFlag == 2) {
      infos.weeks = infos.weeks.filter(v => v % 2 == 0)
    }
  }
  // console.log(infos);
  return infos;
}
function parseCourse(str) {
  let infos = {};
  let ret = /(.+)\s+\[(.+)\]\s+(.+)$/g.exec(str)
  if(ret){
    infos.teacher = ret[1];
    let {sections,weeks} = getSectionAndWeeks(`[${ret[2]}]`)
    infos.sections = sections;
    infos.weeks = weeks;
    infos.position = ret[3];
  }
  // console.log(infos);
  return infos
}