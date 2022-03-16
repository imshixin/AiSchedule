/*
 * @Author: imsixn
 * @Date: 2021-03-12 23:25:02
 * @LastEditors: imsixn
 * @LastEditTime: 2022-03-10 13:49:12
 * @Description: file content
 */
function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
  //除函数名外都可编辑
  //以下为示例，您可以完全重写或在此基础上更改
  let xhr = new XMLHttpRequest();
  let courses = {}
  let lessonIds = []
   for (let i = 1; i < 26; i++) {
    xhr.open('POST', 'http://jedu.cdp.edu.cn/jedu/edu/core/eduScheduleInfo/getStudentWeekSchedule.do', false)
    // xhr.setRequestHeader('Cookie',dom.cookie);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    xhr.send(`week=${i}&semId=`);
    let ret = xhr.responseText;
    if (xhr.readyState == 4 && xhr.status != 200) {
      throw new Error('请求失败,检查网络后重试');
    }
    let week_courses = JSON.parse(ret).data.schedule
    if (week_courses.length <= 0) {
      break;
    }
    console.log(`i解析了第${i}周`);
    let puredCourse = pureJson(week_courses)
    for (let j in puredCourse) {
      if (lessonIds.indexOf(j) >= 0) {
          courses[j].weeks.push(puredCourse[j].weeks[0])
      } else {
        courses[j] = puredCourse[j];
        lessonIds.push(j)
      }
    }
  }
  return JSON.stringify(courses);
}
function pureJson(week_courses) {
  let pure_courses = {};
  let lessonIds=[]
  for (let c of week_courses) {
    let day = getDay(c.weekOfDay);
    let sections = getSection(c.eduTimeSchedule.eduLesson);
    let key = `${c.courseId}day${day}sec${sections[0].section}`
    pure_courses[key] = {
      teacher: c.teacherName,
      name: c.courseName,
      day: day,
      position: c.placeName,
      sections: sections,
      weeks: [c.week]
    }
    lessonIds.push(key)
  }
  return pure_courses
}

function getSection(eduLesson) {
  let sections = [];
  for (let i = eduLesson.startLesson; i <= eduLesson.endLesson; i++) {
    sections.push({
      section: i
    });
  }
  return sections;
}

function getDay(str) {
  const weekStrs = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  let day = 1;
  weekStrs.some((v, i) => v == str ? day = i + 1 : false);
  // console.log('str=' + str + ' day=' + day);
  return day
}