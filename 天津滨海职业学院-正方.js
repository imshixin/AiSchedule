function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  let result = [];
  const $ = cheerio.load(html, {
    decodeEntities: false
  });
  let trs = $('tr');
  trs.slice(2, trs.length).each((index_tr, element_tr) => {

    let tds = $(element_tr).children();
    //所有行
    if ($(element_tr).children().eq(0).text().match(/午|晚上/)) {
      tds = tds.slice(2, tds.length);
    } else {
      tds = tds.slice(1, tds.length);
    }
    $(tds).each((index_td, element_td) => {
      /* 每一项课程 */
      /* i_td+1表示星期 */
      let cInfos = getcourseInfo(index_td, element_td);
      for (let cInfo of cInfos) {
        result.push(cInfo)
      }
    })
  })
  console.log(result);
  return {
    courseInfos: result,
    sectionTimes: [{
      "section": 1,
      "startTime": "08:30",
      "endTime": "09:15"
    }, {
      "section": 2,
      "startTime": "09:15",
      "endTime": "10:00"
    }, {
      "section": 3,
      "startTime": "10:30",
      "endTime": "11:15"
    }, {
      "section": 4,
      "startTime": "11:15",
      "endTime": "12:00"
    }, {
      "section": 5,
      "startTime": "13:30",
      "endTime": "14:15"
    }, {
      "section": 6,
      "startTime": "14:15",
      "endTime": "15:00"
    }, {
      "section": 7,
      "startTime": "15:30",
      "endTime": "16:15"
    }, {
      "section": 8,
      "startTime": "16:15",
      "endTime": "17:00"
    }, {
      "section": 9,
      "startTime": "18:00",
      "endTime": "18:45"
    }, {
      "section": 10,
      "startTime": "18:45",
      "endTime": "19:30"
    }, {
      "section": 11,
      "startTime": "19:30",
      "endTime": "20:15"
    }, {
      "section": 12,
      "startTime": "20:15",
      "endTime": "21:00"
    }]

  };
}
/* 返回课程列表，为空就返回[] */
function getcourseInfo(index_td, element_td) {
  let courseInfos = [];
  let children = element_td.children.filter((v, i, arr) => {
    /* 滤去br */
    return v.type == 'text';
  })
  //滤去有特殊时间
  children = pureCourse(children);
  let cI = {
    day: index_td + 1
  };
  for (let i = 0; i < children.length; i++) {
    let node = children[i];
    switch (i % 4) {
      case 0: //名称
        cI.name = node.nodeValue;
        break;
      case 1: //时间信息
        let result = getSections(node.nodeValue);
        cI.sections = result.sections;
        cI.weeks = result.weeks;
        break;
      case 2: //老师
        cI.teacher = node.nodeValue;
        break;
      case 3: //老师
        cI.position = node.nodeValue;
        courseInfos.push(Object.assign({}, cI));
        break;
    }
  }
  // console.log(courseInfos);
  return courseInfos;
}
//滤去指定时间指定教室
function pureCourse(children) {
  for (let i = 0; i < children.length; i++) {
    if (children[i].data.match(/年.+月.+日/g)) {
      children.splice(i, 2);
      i--;
    }
  }
  return children;
}

function getSections(str) {
  let infos = {
    weeks: [],
    sections: []
  };
  let result1 = str.match(/单|双/g)
  let result2 = /周(.)第(.+)节\{第(.+?)周/g.exec(str);//匹配旧版详细时间
  let result3 = /(.+?)(\W?)\((\d+)[-,](\d+)\)/g.exec(str);//匹配新版精简时间
  if (result2) {
    //解析day
    //解析sections
    result2[2].split(',').forEach((v, i, arr) => infos.sections.push({
      section: Number(v)
    }))
    //解析weeks
    if (result2[3].indexOf('-') >= 0) {
      let weekRange = result2[3].split('-');
      for (let i = Number(weekRange[0]); i <= Number(weekRange[1]); i++) {
        infos.weeks.push(i);
      }
    } else if(result2[3].indexOf(',')>=0){
      result2[3].split(',').forEach((v, i, arr) => infos.weeks.push(Number(v)))
    }else{//只有一周时
      infos.weeks.push(Number(result2[3]));
    }
  } else if (result3) {
    //解析weeks
    let weekRange = result3[1].indexOf(',') >= 0 ? result3[1].split(',') :
                    (result3[1].indexOf('-') >= 0 ? result3[1].split('-') : [result3[1], result3[1]]);//[ret3[1], ret3[1]]是为了解析有些课只上一周
    if (weekRange.some(v => v.indexOf('-') >= 0)) {
      weekRange.forEach(v => {//解析这种:1-3,4-6
        if (v.indexOf('-') < 0) {//解析1-4,5,7,8-10中的5,7
          infos.weeks.push(Number(v));
          return;
        }
        let weekRanges = v.split('-').map(va => Number(va));
        for (let i = weekRanges[0]; i <= weekRanges[1]; i++) {
          infos.weeks.push(i);
        }
      })
    } else {//解析这种:1-17
      for (let i = Number(weekRange[0]); i <= Number(weekRange[1]); i++) {
        infos.weeks.push(i);
      }
    }
    //解析section
    for (let i = Number(result3[3]); i <= Number(result3[4]); i++) {
      infos.sections.push({
        section: i
      })
    }
  }
  //无单双周就直接返回
  if (!result1 || (result3 && !result3[2])) {
    return infos;
  }

  if (result1[0] == '单周' || result3[2] == '单') {
    infos.weeks = infos.weeks.filter((v, i, arr) => v % 2 != 0);
  } else { //双周
    infos.weeks = infos.weeks.filter((v, i, arr) => v % 2 == 0);
  }
  // console.log(infos);
  return infos;
}