const https   = require('https');

const TITLE = /最新：<a href=\"\/book\/(?:\w)+\/([\w\/_\.]*).html\" >((.)+)<\/a>/;
const CONTENT = /<div id=\"chaptercontent\" class=\"Readarea ReadAjax_content\">([.\s\r\n\S]*)<\/br>(?:[\r\n]*)ps:书友们/;
const TYPING = /正在手打中/
/*
 * Code:
 *	-1: get page error
 * 	0:  success
 *  1:  no new
 * 	2:  match failed
 */

function getContent(book_msg){
	return new Promise(resolve => {
		https.get(book_msg.url, function (res) {
		    let html = '';

		    res.on('data', function (data) {
		        html += data;
		    });

		    res.on('end', function () {
		    	let match_result = html.match(TITLE);

		    	if(match_result) {
			    	if(match_result[1] != book_msg.lastchapter) {
			    		resolve({
			    			success: true,
			    			code: 0,
			    			data: {
			    				...book_msg,
				    			pageID: match_result[1],
				    			pageTitle: match_result[2],
				    			hasCrawled: 0
			    			}
			    		})
			    	} else {
			    		resolve({
			    			success: false,
			    			code: 1,
			    			data: {}
			    		})
			    	}
			    } else {
			    	resolve({
			    		success: false,
		    			code: 2,
		    			data: {}
			    	})
			    }
		    });
		})
		.on ('error', function () {
		    resolve({
		    	success: false,
		    	code: -1,
    			data: {}
		    })
		});
	})
}

function getNote(url) {
	return new Promise(resolve => {
		https.get(url, function (res) {
		    let html = '';

		    res.on('data', function (data) {
		        html += data;
		    });

		    res.on('end', function () {
		    	// console.log(html)
				if (html.match(TYPING)) {
		    		resolve({
		    			success: false,
		    			code: -2,
		    			data: {}
			    	})
		    	} else {
			    	let match_result = html.match(CONTENT);
			    	if(match_result) {
				    	resolve({
				    		success: true,
				    		code: 0,
				    		data: match_result[1].split('</p>')[1]
				    	})
			  	  	} else {
			  	  		resolve({
					    	success: false,
					    	code: 1,
			    			data: {}
					    })
			  	  	}
			  	}
		    })
		})
		.on ('error', function () {
		    resolve({
		    	success: false,
		    	code: -1,
    			data: {}
		    })
		});
	})
}

exports = module.exports = { getContent, getNote };
