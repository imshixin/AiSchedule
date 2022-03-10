function draw(you) { // draw({ courseInfos: result, sectionTimes: times })
  const world = {
    laugh: (l, e, k, s) => {
      console.log('%c TriLingvo %c\n ' + l[0] + '%c ' + e + '%c ' + l[1] + (s ? '，未发现问题' : ('，发现 ' + (~k ? k : '很大') + ' 个问题')), 'color:#fff;background-color:#fa7298;border-radius:8px', (s ? 'color:green' : 'color:red'), 'color:purple', (s ? 'color:green' : 'color:red'))
    },
    say: (l, e) => {
      if (typeof (e) == "undefined") {
        console.log('%c TriLingvo %c\n' + l, 'color:#fff;background-color:#fa7298;border-radius:8px', '')
      } else {
        console.log('%c TriLingvo %c\n' + l + '%c ' + e, 'color:#fff;background-color:#fa7298;border-radius:8px', '', 'color:purple')
      }
    },
    war: (l, e) => {
      if (typeof (e) == "undefined") {
        console.log('%c TriLingvo %c\n找到一个问题：' + l, 'color:#fff;background-color:#fa7298;border-radius:8px', 'color:red')
      } else {
        console.log('%c TriLingvo %c\n找到一个问题：%c ' + e[0] + '%c ' + l + '%c ' + e[1], 'color:#fff;background-color:#fa7298;border-radius:8px', '', 'color:purple', 'color:red', 'color:purple')
      }
    },
    mind: (c, a) => { //rightKeys, keys
      if (a.length) {
        let at = a
        let v = 0
        a.forEach((ae, ai) => {
          if (~c.indexOf(ae)) {
            world.say('找到 ', ae)
            v++
          } else {
            c.forEach(ce => {
              let t = 0
              let cel = ce.toLowerCase(),
                ael = ae.toLowerCase()
              if (cel == ael) {
                world.war('大小写格式错误，应为', [ae, ce])
                at[ai] = ce
              } else {
                for (let i = 0; i < ae.length; i++) {
                  if (~cel.indexOf(ael.slice(i, i + 3))) t++
                }
                if (t > 1 && ael[0] == cel[0]) {
                  world.war('疑似为', [ae, ce])
                  at[ai] = ce
                }
              }
            })
          }
        })
        at.forEach(ate => {
          if (!~c.indexOf(ate)) world.war('无法确定的', ["", ate])
        })
        return v == c.length ? true : false
      } else {
        world.say('输入为空')
        return false
      }
    },
    lingvo: {
      mianKeys: ['courseInfos', 'sectionTimes'],
      childKeys: ['name', 'teacher', 'position', 'day', 'weeks', 'sections']
    }
  }

  let yourKeys = Object.keys(you)
  if (world.mind(world.lingvo.mianKeys, yourKeys) || ~yourKeys.indexOf("courseInfos")) {
    if (typeof (you.courseInfos) == "undefined") {
      world.war('缺少', ["", "courseInfos"])
    } else {
      you.courseInfos.forEach((e, i) => {
        world.say('正校验课程信息，索引为', i)
        let eKeys = Object.keys(e)
        let k = 0
        if (world.mind(world.lingvo.childKeys, eKeys)) {
          let cif = you.courseInfos[i]
          let dd = ["name", "teacher", "position"]
          dd.forEach((de, di) => {
            if (typeof (cif[de]) != "string") {
              world.war('格式错误，应为String，索引为', [de, i])
              k++
            } else if (cif[de].length > 40) {
              world.war('内容过长，索引为', [de, i])
              k++
            }
          })
          if (typeof (cif.day) != "number" && typeof (cif.day) != "string") {
            world.war('格式错误，应为Number|String，索引为', ['day', i])
            k++
          } else if (!/[1-7]/.test(cif.day.toString())) {
            world.war('格式错误，范围是[1-7]，索引为', ['day', i])
            k++
          }
          if (!(cif.weeks instanceof Array)) {
            world.war('格式错误，应为Array，索引为', ['weeks', i])
            k++
          }
          if (cif.sections instanceof Array) {
            cif.sections.forEach((ce, ci) => {
              if (typeof (ce) != "object") {
                world.war('格式错误，应为{section:x}，索引为', ['sections', (i + ' > ' + ci)])
                k++
              } else if (typeof (ce.section) != "number") {
                world.war('格式错误，应为Number，索引为', ['section', (i + ' > ' + ci)])
                k++
              }
            })
          } else {
            world.war('格式错误，应为Array，索引为', ['sections', i])
          }
        } else {
          k = -1
        }
        world.laugh(['索引为', '的课程数据校验完成'], i, k, (!k ? true : false))
      })
    }
    if (typeof (you.sectionTimes) == "undefined") {
      world.say('缺少', "sectionTimes")
    } else {
      //time干啥
    }
  }
  return you
}