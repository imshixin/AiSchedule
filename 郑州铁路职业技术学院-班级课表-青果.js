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
      if ($(e_td).find('font').text().match('备注')) {
        let texts = $(e_td).find('font')[0].attribs.title.replace(/&nbsp;/g,'').split('\n').filter(v=>v.trim()!='')
        texts.forEach(v => {
          let infos = parseCourse(v.trim())
          infos.day = i_td+1;
          result.push(infos);
        })
        // console.log();
        return;
      }
      let i = $(e_td).find('div')[0].children.filter(v => v.type == 'text' && v.nodeValue.trim() != '')
      i.forEach(v => {
        let infos = parseCourse(v.nodeValue.trim())
        infos.day = i_td+1;
        result.push(infos);
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
    sections: [],
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

  str = str.replace(/&nbsp;/g, '').replace(/\s+/g, ' ');
  infos.name = str.split("[")[0].split(' ')[0];
  infos.teacher = str.split("[")[0].split(' ').slice(1).join(' ').trim();
  let ret1 = str.split('[')[1].split(' ')
  console.log(ret1);
  getWeeks(ret1[0].replace(']周', ''), infos.weeks)
  let secRange = ret1[1].replace('节', '').split('-').map(v => Number(v))
  for (let i = secRange[0]; i <= secRange[1]; i++) {
    infos.sections.push({
      section: i
    })
  }
  infos.position = ret1.slice(2).join(' ');
  infos.weeks = infos.weeks.slice(0);
  console.log(infos);
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
// parseCourse('大学英语Ⅰ 尚季玲 [1-12,14,15-18]周 单周 1-4节 新7540 新校区 100')
// parseCourse('中外医学史 [4]周 11-13节 3－302 80 讲授')
// parseCourse('体育①（2017） [4-18]周 4-5节 37 讲授')
// parseCourse('大学语文（2017） [10-14]周 6-7节 0 实验')
// parseCourse('信息资源检索与利用 [4,6-9]周 6-7节 20中西医本 4-401 37 讲授')