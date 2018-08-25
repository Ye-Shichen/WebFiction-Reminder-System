const ajax = require('./src/get_page.js')
const db = require('./src/db_controller.js')
const mailer  = require('./src/send_mail.js')

main()
setInterval(main, 30*60*1000);	

async function main() {
	// 获取小说数据
	const _book_msg = await db.getBookMsg()
	
	// 获取页面
	let book_msg = []
	for(let i = 0; i < _book_msg.length; i++) {
		let res = await ajax.getContent(_book_msg[i])

		if(res.success && res.code === 0) {
			// console.log(`[${new Date().toLocaleString()}] '${_book_msg[i].title}'更新`)
			book_msg.push(res.data)
		} else if (res.code === -1) {
			console.log(`[${new Date().toLocaleString()}] 网络异常，获取'${_book_msg[i].title}'错误`)
		} else if (res.code === 1) {
			// console.log(`[${new Date().toLocaleString()}] '${_book_msg[i].title}'无更新`)
		} else if (res.code === 2) {
			console.log(`[${new Date().toLocaleString()}] 页面异常，匹配'${_book_msg[i].title}'错误`)
		}
	}

	// 更新发送邮件并更新数据库
	if (book_msg.length > 0) {
		let success = true
		console.log(`[${new Date().toLocaleString()}] 有${book_msg.length}本小说更新`)

		try {
			// 爬取章节
			for(let i = 0; i < book_msg.length; i++) {
				let res = await ajax.getNote(`${book_msg[i].url}${book_msg[i].pageID}.html`)
				if (res.success && res.code === 0) {
					book_msg[i].hasCrawled = 1
					await db.insertNewPage(book_msg[i].pageID, book_msg[i].id, book_msg[i].pageTitle, new Date().toJSON(), res.data)
				} else if (res.code === -2) {
					console.log(`[${new Date().toLocaleString()}] '${book_msg[i].title}'新章节正在手打中`)
				} else if (res.code === -1) {
					console.log(`[${new Date().toLocaleString()}] 网络异常，爬取'${book_msg[i].title}'更新错误`)
				} else if (res.code === 1) {
					console.log(`[${new Date().toLocaleString()}] 页面异常，匹配'${book_msg[i].title}'错误`)
				}
			}

			// 发送邮件
			const text = formatText(book_msg)
			if (text !== '') {
				mailer.setOptions(text)
				let res = await mailer.sendMail()
			} else {
				console.log('页面全部爬取失败')
			}
		} catch(err) {
			success = false
		}

		// 发送成功后更新数据库
		if (success) {
			for(let i = 0; i < book_msg.length; i++) {
				if (book_msg[i].hasCrawled) {
					await db.updatePage(book_msg[i].title, book_msg[i].pageID, book_msg[i].pageTitle)
				}
			}
		}
	} else {
		console.log(`[${new Date().toLocaleString()}] 无更新`)
	}

	db.destroy()
}

function formatText(data) {
	let text = ''

	for(let i = 0; i < data.length; i++) {
		if (data[i].hasCrawled) {
			text += `<hr/><p style="font-size: 20px; font-weight:bold; margin: 0;">${data[i].title}</p>
					 <br/>上次更新：<br/>
					 &nbsp;&nbsp;&nbsp;<a href=${returnUrl(data[i].id, data[i].lastchapter)}>${data[i].chapter_title}</a>
					 <br/><br/>本次更新:<br/>
					 &nbsp;&nbsp;&nbsp;<a href=${returnUrl(data[i].id, data[i].pageID)}>${data[i].pageTitle}</a><br/><br/>`
		}
	}
	return text
}

function returnUrl(id, pageID) {
	return `http://132.232.18.80:10300/index.html?note=${id}&page=${pageID}`
}
