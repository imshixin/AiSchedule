/*
 * @Author: imsixn
 * @Date: 2022-03-16 20:19:00
 * @LastEditors: imsixn
 * @LastEditTime: 2022-03-16 20:35:38
 * @Description: file content
 */

function scheduleHtmlProvider(iframeContent="", frameContent="", dom=document) {
  //除函数名外都可编辑
  //以下为示例，您可以完全重写或在此基础上更改
  window.alert(`
你需要在登录后点击到信息查询-学生个人课表，再点击一键导入
课程时间如果对不上，请到 小爱课程表个人页->课表节数和时间设置 修改信息
  `)
  if(!window.frames['iframeautoheight']){
    alert('找不到课表')
  }
  const ifrs = window.frames['iframeautoheight'].contentDocument;
  return ifrs.getElementById('Table1').outerHTML;
}