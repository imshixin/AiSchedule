function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  let result = []
  const $ = cheerio.load(html, {
    decodeEntities: false
  })
  $('tbody tr').each((i_tr, ele_tr) => {
    let tds = $(ele_tr).children();
    tds = tds.slice(2, tds.length);
    tds.each((i_td, ele_td) => {
      //day : i_td+1
      //单个课信息
      let children = ele_td.children.filter(v => v.name ? v.name != 'br' : true)
      if (children.length > 3) {
        let infos = {
          day: i_td + 1
        }
        console.log(children);
        children.forEach((v, i) => {
          switch (i) {
            case 0: //name
              infos.name = v.nodeValue;
              break;
            case 1:
            case 4: //section
              let ifs = getSections(v.nodeValue)
              infos.weeks = ifs.weeks
              infos.sections = ifs.sections
              break;
            case 2:
            case 5: //teacher
              // console.log(v.nodeValue);
              infos.teacher = v.nodeValue;
              break;
            case 3:
            case 6: //position
              let mat = v.nodeValue.match(/\d+(\(.+\))?/)
              if(mat&&v.nodeValue.split(mat[0])[1]!=''){
                let ins = v.nodeValue.split(mat[0])
                infos.position = ins[0]+mat[0];
                result.push(Object.assign({}, infos))
                infos.name = ins[1]
                break;
              }
              infos.position = v.nodeValue;
              result.push(Object.assign({}, infos))
              break;
          }
        })
      }
    })
  })
  console.log(result)
  return {
    courseInfos: result
  }
}

function getSections(str) {
  let infos = {
    weeks: [],
    sections: []
  }
  console.log(str);
  let ret1 = /..第(.+)节\{(\d+)-(\d+)周\|(.)周\}/g.exec(str);
  if (ret1) {
    let sections = ret1[1].indexOf(',') ? ret1[1].split(',').map(v => Number(v)) : [Number(ret1[1]), Number(ret1[1])]
    sections.forEach(v => infos.sections.push({
      section: v
    }))
    for (let i = Number(ret1[2]); i <= Number(ret1[3]); i++) {
      infos.weeks.push(i)
    }
  }
  if (ret1&&ret1[4].match('全')) {
    return infos;
  }

  if (ret1[4].match('单')) {
    infos.weeks = infos.weeks.filter((v, i, arr) => v % 2 != 0);
  } else if(ret1[4].match('双')) { //双周
    infos.weeks = infos.weeks.filter((v, i, arr) => v % 2 == 0);
  }
  console.log(infos);
  return infos
}