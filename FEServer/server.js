const http = require('http')
const fs = require('fs')

const PORT = 10300
const documentRoot = '/home/centos/note_update_reminder/FEServer'
//需要访问的文件的存放目录

const server = http.createServer((req, res) => {
    const reqURL = req.url.split('?')[0].split('#')[0]
    console.log(`[${new Date().toLocaleString()}] 请求文件${reqURL}`)

    const fileTYPE = reqURL.split('.')[1]
    const fileAddress = documentRoot + reqURL
    if(fileTYPE === 'js') {
        fileTYPE = 'javascript'
    }

    fs.readFile(fileAddress , (err, data) => {
    /*
        一参为文件路径
        二参为回调函数
            回调函数的一参为读取错误返回的信息，返回空就没有错误
            二参为读取成功返回的文本内容
    */
        if (err) {
            console.log(`[${new Date().toLocaleString()}] 未知文件`)

            res.writeHeader(404, {
                'Content-Type' : 'text/html;charset="utf-8"'
            })
            res.write('<h1>404错误</h1><p>你要找的页面不存在</p>')
            res.end()
        } else {
            res.writeHeader(200, {
                'content-type': `text/${fileTYPE};charset='utf-8'`,
                'connection': `close`
            });
            res.write(data) //将index.html显示在客户端
            res.end()
        }
    });
})

server.listen(PORT, () => {
    console.log('FEServer运行中，端口号:%d', PORT)
})
