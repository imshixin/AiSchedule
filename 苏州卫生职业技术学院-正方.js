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
  trs.slice(2, trs.length).each((i_tr, ele_tr) => {

    let tds = $(ele_tr).children();
    //所有行
    if ($(ele_tr).children().eq(0).text().match(/午|晚上/)) {
      tds = tds.slice(2, tds.length);
    } else {
      tds = tds.slice(1, tds.length);
    }
    $(tds).each((i_td, ele_td) => {
      /* 每一项课程 */
      /* i_td+1表示第几节课 */
      let cInfos = getcourseInfo(i_tr,i_td, ele_td);
      for (let cInfo of cInfos) {
        result.push(cInfo)
      }
    })
  })
  console.log(result);
  return {
    courseInfos: result,
    sectionTimes: [{
      'section': 1,
      'startTime': '08:10',
      'endTime': '08:50'
    }, {
      'section': 2,
      'startTime': '09:00',
      'endTime': '09:40'
    }, {
      'section': 3,
      'startTime': '10:10',
      'endTime': '10:50'
    }, {
      'section': 4,
      'startTime': '11:00',
      'endTime': '11:40'
    }, {
      'section': 5,
      'startTime': '13:40',
      'endTime': '14:20'
    }, {
      'section': 6,
      'startTime': '14:30',
      'endTime': '15:10'
    }, {
      'section': 7,
      'startTime': '15:20',
      'endTime': '16:00'
    }, {
      'section': 8,
      'startTime': '16:10',
      'endTime': '16:50'
    }, {
      'section': 9,
      'startTime': '18:00',
      'endTime': '18:40'
    }, {
      'section': 10,
      'startTime': '18:50',
      'endTime': '19:30'
    }, {
      'section': 11,
      'startTime': '19:40',
      'endTime': '20:20'
    }, {
      'section': 12,
      'startTime': '20:30',
      'endTime': '21:10'
    }]
  };
}
/* 返回课程列表，为空就返回[] */
function getcourseInfo(i_tr,i_td, ele_td) {
  let courseInfos = [];
  let children = ele_td.children.filter((v, i, arr) => {
    /* 滤去br */
    return v.type == 'text';
  })
  children = children.splice(0, children.length - (children.length % 4));
  let cI = {};
  for (let i = 0; i < children.length; i++) {
    let node = children[i];
    switch (i % 4) {
      case 0:
        //名称
        cI.name = node.nodeValue;
        break;
      case 1:
        //时间信息,在此结算
        let result = getSections(i_tr,i_td, node.nodeValue);
        cI.day = result.day;
        cI.sections = result.sections;
        cI.weeks = result.weeks;
        break;
      case 2:
        //老师
        cI.teacher = node.nodeValue;
        break;
      case 3:
        //老师
        cI.position = node.nodeValue.replace('\\n','');
        courseInfos.push(cI);
        cI = {};
        break;
    }
  }
  /* 如果同一时间有两个课程
  后添加的会被覆盖掉
  将两个课周次拆分并提醒用户自定义修改
  一般同一时间可能会有两个课重复
  若有多个，到时候再想办法
*/
  //   console.log(courseInfos);
  return courseInfos;
}
/* 返回解析后的info：
{
weeks: [ 1, 3, 5, 6 ],
sections: [ { section: 7 }, { section: 8 } ],
day: 7
}
*/
//i_tr+1 : 第几节
//i_td+1 : 第几天
function getSections(i_tr,i_td, str) {
  console.info("i_tr:"+i_tr+" i_td"+i_td);
  console.info(str);
  let infos = {
    weeks: [],
    sections: [],
    day: 7
  };
  let ret1 = str.match(/单周|双周/g)
  const weekStrs = ['一', '二', '三', '四', '五', '六'];
  let ret2 = /周\s*?(.)\s*第(.+)节\s*\{第(.+?)周/g.exec(str);
    console.log(ret2);
  let ret3 = /\{第(.+)周\|(\d+)节\/周\}/g.exec(str);
  //解析day
  infos.day = i_td + 1;
  if (ret3) {
    
    if (ret3[1].indexOf('-') >= 0) {
      let weekRange = ret3[1].split('-');
      for (let i = Number(weekRange[0]); i <= Number(weekRange[1]); i++) {
        infos.weeks.push(i);
      }
    } else {
      ret3[1].split(',').forEach(v => infos.weeks.push(Number(v)))
    }
    for(let i =0;i<Number(ret3[2]);i++){
      infos.sections.push({section:i_tr+1});
      i_tr++;
    }


    return infos;
  }
  
  //解析sections
  ret2[2].split(',').forEach(v => infos.sections.push({
    section: Number(v)
  }))
  //解析weeks
  if (ret2[3].indexOf('-') >= 0) {
    let weekRange = ret2[3].split('-');
    for (let i = Number(weekRange[0]); i <= Number(weekRange[1]); i++) {
      infos.weeks.push(i);
    }
  } else {
    ret2[3].split(',').forEach(v => infos.weeks.push(Number(v)))
  }
  if (!ret1) {
    return infos;
  }
  if (ret1[0] == '单周') {
    infos.weeks = infos.weeks.filter(v => v % 2 != 0);
  } else {
    //双周
    infos.weeks = infos.weeks.filter(v => v % 2 == 0);
  }
  return infos;
}