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
  console.time('parser')
  $('table tbody tr').slice(1).each((i_tr, e_tr) => {
    $(e_tr).children('.td').each((i_td, e_td) => {
      if ($(e_td).text().trim() == '') return;
      let courseInfo = {
        day:i_td+1,
      }
      $(e_td).find('div').each((i_div,e_div)=>{
        let tds = e_div.children.filter(v => v.name?v.name!='br':true)
        tds.forEach((v,i) => {
          switch(i%4){
            case 0:
              courseInfo.name = $(v).text().trim();
              break;
            case 1:
              courseInfo.teacher = v.nodeValue.trim();
              break;
            case 2:
              let {secs,weeks} = parseCourse(v.nodeValue.trim());
              courseInfo.sections = secs;
              courseInfo.weeks = weeks;
              if(!tds[i+1]){
                courseInfo.position = '地点未定';
                result.push(Object.assign({},courseInfo));
              }
              break;
            case 3:
              courseInfo.position = v.nodeValue.trim();
              result.push(Object.assign({},courseInfo));
              break;
          }
        })

      })
    })
  })
  console.log(result)
  console.timeEnd('parser')
  return {
    courseInfos: result
  }
}

function parseCourse(str) {
  console.log(str);
  let infos = {
    secs: [],
    weeks: []
  }
  infos.weeks.myPush = infos.weeks.push;
  if (str.match('单周')) {
    str = str.replace('单周', '')
    infos.weeks.myPush = function (value) {
      return value % 2 == 1 ? this.push(value) : false;
    }
  } else if (str.match('双周')) {
    str = str.replace('双周', '')
    infos.weeks.myPush = function (value) {
      return value % 2 == 0 ? this.push(value) : this.length;
    }
  }

  let ret1 = /(.+)\[(.+)\]/g.exec(str);
  // console.log(ret1);
  getWeeks(ret1[1], infos.weeks)
  infos.secs = getSections(ret1[2]);
  infos.weeks = infos.weeks.slice(0);
  // console.log(infos);
  return infos
}

function getWeeks(str, weeks) {
  if (str.indexOf(',') >= 0) {
    str.split(',').forEach(v => {
      let weekRange = v.indexOf('-') >= 0 ? v.split('-').map(va => Number(va)) : [Number(v), Number(v)];
      for (let i = weekRange[0]; i <= weekRange[1]; i++) {
        weeks.myPush(i)
      }
    })
  } else if (str.indexOf('-') >= 0) {
    let weekRange = str.split('-').map(v => Number(v));
    for (let i = weekRange[0]; i <= weekRange[1]; i++) {
      weeks.myPush(i);
    }
  } else {
    weeks.myPush(Number(str))
  }
}
function getSections(str) {
  let secs=[]
  if (str.indexOf(',') >= 0) {
    str.split(',').forEach(v => {
      let secRange = v.indexOf('-') >= 0 ? v.split('-').map(va => Number(va)) : [Number(v), Number(v)];
      for (let i = secRange[0]; i <= secRange[1]; i++) {
        secs.push({section:i})
      }
    })
  } else if (str.indexOf('-') >= 0) {
    let secRange = str.split('-').map(v => Number(v));
    for (let i = secRange[0]; i <= secRange[1]; i++) {
      secs.push({section:i});
    }
  } else {
    secs.push({section:Number(str)});
  }
  return secs;
}
