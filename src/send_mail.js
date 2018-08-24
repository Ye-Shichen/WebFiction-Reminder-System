'use strict';
const nodemailer = require('nodemailer');
const config = require('../config/mail_config.js');

const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: false,
    auth: {
        user: config.user, 
        pass: config.pass 
    }
});

const mailOptions = {
    from: config.user, 
    to: 'sec913@163.com', 
    subject: 'Hello ✔', 
    text: 'Hello world?', 
    html: 'Hello world!' 
};

function setOptions(text = '小说更新啦！', subject = '小说更新啦！') {
    mailOptions.subject = subject;
    mailOptions.text = text;
    mailOptions.html = text;
};

async function sendMail() {
    return new Promise(resolve => {
        console.log('发送邮件中...');
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('邮件发送失败');
                resolve({
                    success: false
                });
            }
            console.log('邮件发送成功');
            resolve({
                success: true
            })
        });
    })
}

exports = module.exports = {
    setOptions,
    sendMail
}
