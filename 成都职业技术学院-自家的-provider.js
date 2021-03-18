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
function pureJson(cj) {
  let pure_courses = {};
  let lessonIds=[]
  for (let i = 0; i < cj.length; i++) {
    let day = getDay(cj[i].weekOfDay);
    let sections = getSection(cj[i].eduTimeSchedule.eduLesson);
    let key = `${cj[i].courseId}day${day}sec${sections[0].section}`
    pure_courses[key] = {
      teacher: cj[i].teacherName,
      name: cj[i].courseName,
      day: day,
      position: cj[i].placeName,
      sections: sections,
      weeks: [cj[i].week]
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