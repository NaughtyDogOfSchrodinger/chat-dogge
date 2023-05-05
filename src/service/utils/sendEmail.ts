import * as nodemailer from 'nodemailer'
import { EmailTypeEnum } from '@/constants/common'
import dayjs from 'dayjs'

const myEmail = process.env.MY_MAIL
let mailTransport = nodemailer.createTransport({
  // host: 'smtp.qq.email',
  service: 'qq',
  secure: true, //安全方式发送,建议都加上
  auth: {
    user: myEmail,
    pass: process.env.MAILE_CODE,
  },
})

const template = (code: string, expire_min: string, action: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>ChatDogge 验证码</title>
  <meta charset="utf-8">
</head>
<body>
<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; background-color: #f5f5f5; padding: 20px;">
  <img src="https://www.chatdogge.xyz/favicon.svg" width="40" height="40" alt="chatdogge">
  <p>尊敬的用户，</p>
  <p>您正在${action} <a class="link link-hover" href="https://www.chatdogge.xyz/">ChatDogge</a> 账号，验证码为：</p><p style="font-size: 24px; color: #000000; margin: 20px 0;">${code}</p>
  <p>请在注册页面填写验证码完成注册。验证码将在 ${expire_min} 分钟后失效，请尽快完成。</p>
  <p>如果您没有进行此操作，请忽略此邮件。</p>
  <p>祝您使用愉快！</p>
  <p style="margin-top: 50px;">ChatDogge 团队</p>
  <p style="margin-top: 50px;">Copyright © 2023 - All right reserved by <a href="https://blog.chatdogge.xyz/">NaughtyDog</a> Industries Ltd</p>

</div>
<div>
</div>
</body>
</html>`
}

const emailMap: { [key: string]: any } = {
  [EmailTypeEnum.register]: {
    subject: '注册 ChatDogge 账号',
    name: '注册',
  },
  [EmailTypeEnum.findPassword]: {
    subject: '修改 ChatDogge 密码',
    name: '修改',
  },
}

export const sendCode = (
  email: string,
  code: string,
  expire_min: string,
  type: `${EmailTypeEnum}`
) => {
  return new Promise((resolve, reject) => {
    const options = {
      from: `"ChatDogge" ${myEmail}`,
      to: email,
      subject: emailMap[type]?.subject,
      html: template(code, expire_min, emailMap[type]?.name),
    }
    mailTransport.sendMail(options, function (err: any) {
      if (err) {
        console.log('send email error->', err)
        reject('邮箱异常')
      } else {
        resolve('')
      }
    })
  })
}

export const sendTrainSucceed = (email: string, modelName: string) => {
  return new Promise((resolve, reject) => {
    const options = {
      from: `"ChatDogge" ${myEmail}`,
      to: email,
      subject: '模型训练完成通知',
      html: `你的模型 ${modelName} 已于 ${dayjs().format(
        'YYYY-MM-DD HH:mm'
      )} 训练完成！`,
    }
    mailTransport.sendMail(options, function (err: any) {
      if (err) {
        console.log('send email  error->', err)
        reject('邮箱异常')
      } else {
        resolve('')
      }
    })
  })
}
