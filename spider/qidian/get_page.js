const https = require('https')
const url = 'https://www.qidian.com/finish?page='

const ptn = /<li data-rid=\"(\d)+\">(?:[\n|\s])*<div class=\"book-img-box\">(.|\r|\n)*<\/p>(?:[\n|\s])*<\/div>(?:[\n|\s])*<\/li>/


const ptn_title = /<span class=\"title\">(.+)<\/span>/;
const ptn_author = /<p class=\"author\">作者：(.+)<\/p>/;
const ptn_category = /<p class=\"sort\">\r\n(?:\s)*类别：(.+)\r\n(?:\s)*<\/p>/;
const ptn_status = /<p class=\"\">\r\n(?:\s)*状态：(.+)\r\n (?:\s)*<\/p>/;

function get_page(id) {
	return new Promise(resolve => {
		const msg = {
			id: id,
			title: '',
			author: '',
			category: '',
			status: ''
		}
		https.get(`${url}${id}`, res => {
			let html = '';

			res.on('data', data => {
				html += data;
			});

			res.on('end', () => {
				try {
					const p = new RegExp(ptn, "g")
					console.log(p)
					console.log(html.match(p).length)
					// msg.title = html.match(ptn_title)[1],
					// msg.author = html.match(ptn_author)[1],
					// msg.category = html.match(ptn_category)[1],
					// msg.status = html.match(ptn_status)[1]
					resolve(html);
					
				} catch (err) {
					console.log('Blank Page')
					msg.title = 'Empty'
					resolve(msg)
				}
			})
		})
		.on('error', () => {
			console.log('Error')
			msg.title = 'Error'
			resolve(msg)
		})
	})
}

exports = module.exports = get_page;