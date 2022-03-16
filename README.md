<!--
 * @Author: imsixn
 * @Date: 2022-03-10 12:32:14
 * @LastEditors: imsixn
 * @LastEditTime: 2022-03-16 11:17:06
 * @Description: file content
-->
# AiSchedule
小爱课程表导入学校
> 我的开发者名为 铃音yuy

导入出现问题可以联系qq:**250868614**

代码大部分是1.4版本的，parser返回值是一个对象

目前最新版本已经来到了3.x，parser返回值改成了数组需要使用的话得稍微改改

目前已适配的学校：
- 上海城建职业学院-谷贤
- 佛山职业技术学院-强智
- 吉林大学-吉林大学教务
- 天津滨海职业学院-正方
- 平顶山工业职业技术学院-强智
- 成都职业技术学院-自家开发教务
- 文山学院-正方
- 苏州卫生职业技术学院-正方
- 贵州中医药大学时珍学院-正方
- 太多了懒得填了

仓库内只放了parser的代码（ajax请求的放了provider）

provider代码的总体逻辑就是把网页上的课表信息(一般会是一个table)转换成string返回

小爱课程表开发文档：https://ldtu0m3md0.feishu.cn/docs/doccnhZPl8KnswEthRXUz8ivnhb
