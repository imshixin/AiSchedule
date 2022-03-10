function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  const $ = cheerio.load(html, {
    decodeEntities: false
  });
  let result = [];
  $('#mytable0 tr').slice(1).each((i_tr, e_tr) => {//每行课，滤去表头
    $(e_tr).find('.div1').each((i_div, e_div) => {//每节课
      if ($(e_div).text().trim() == '') {//滤去空白div
        return;
      }
      if ($(e_div).find('font').length > 0) {//如果有备注课，
        //备注部分
        let i = $(e_div).find('font')[0].attribs.title;
        let cIStrs = i.split('\n');
        cIStrs.forEach(v => {
          if (v.trim() == '') return;
          let courseInfo = parseCourseInfo(v);
          courseInfo.day = i_div + 1;
          result.push(courseInfo);
        });
        return;
      }
      e_div.children.filter(v => v.type == 'text' && v.nodeValue.trim().length >= 6).forEach(node => {//每项课表解析 cI = courseInfo
        let cIStr = node.nodeValue.replaceAll('&nbsp;', ' ').trim();
        // console.log(cIStr + ' day:' + (i_div + 1));
        let courseInfo = parseCourseInfo(cIStr);
        courseInfo.day = i_div + 1;
        result.push(courseInfo);
      });
    })
  })
  console.log(result);
  return {
    courseInfos: result
  };
}

function parseCourseInfo(str) {
  let infos = {
    sections: [],
    weeks: [],
  };
  let weekFlag = 0;
  if (str.match(/单周|双周/g)) {
    if (str.indexOf('单周') >= 0) {
      str = str.replace("单周", '');
      weekFlag = 1;
    } else {
      str = str.replace("双周", '');
      weekFlag = 2;
    }
  }
  let ret1 = /^(.+)\s+(.+)\s+\[(.+)\]周\s+(\d+)-(\d+)节\s+(.*?)\s*\d*$/g.exec(str);
  if (ret1) {
    infos.name = ret1[1];
    infos.teacher = ret1[2];
    infos.position = ret1[6] ? ret1[6].slice(0, 18) : '地点未定';
    //weeks
    if (ret1[3].indexOf(',') >= 0) {
      ret1[3].split(',').forEach(v => {
        let weekRange = v.indexOf('-') >= 0 ? v.split('-').map(va => Number(va)) : [Number(v), Number(v)];
        for (let i = weekRange[0]; i <= weekRange[1]; i++) {
          infos.weeks.push(i)
        }
      });
    } else if (ret1[3].indexOf('-') >= 0) {
      let weekRange = ret1[3].split('-').map(v => Number(v));
      for (let i = weekRange[0]; i <= weekRange[1]; i++) {
        infos.weeks.push(i);
      }
    } else {
      infos.weeks.push(Number(ret1[3]));
    }
    //sections
    for (let i = Number(ret1[4]); i <= Number(ret1[5]); i++) {
      infos.sections.push({
        section: i
      });
    }
    //单双周
    if (weekFlag == 1) {
      infos.weeks = infos.weeks.filter(v => v % 2 != 0);//单周
    } else if (weekFlag == 2) {
      infos.weeks = infos.weeks.filter(v => v % 2 == 0);
    }
  }
  return infos;
}

// console.log(parseCourseInfo('电工与电子技术基础 陈静 [3-8]周 双周 9-12节 106电工电子实训室 巴南校区 25'));