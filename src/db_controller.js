'use strict';
const mysql     = require('mysql');
const db_config = require('../config/db_config.js');

class db {
	constructor () {
		this.connected = false;
		this.connection = null;
	};
	connect() {
		/* 配置Mysql */
		if(!this.connection) {
			this.connection = mysql.createConnection(db_config); 
		}
		if (!this.connected) {
			this.connected = true;

			//创建一个connection
			this.connection.connect(err => {
			    if(err){
					console.log('[query] - :'+ err);
					this.connected = false;
					return;
			    }
			}); 
		}
	};
	destroy() {
		if (!this.connection) return;
		//关闭connection
		this.connection.end(err => {
		    if(err){       
			    console.log('Connection End Failed.');
		        return;
		    }
		});
		this.connection = null;
		this.connected = false;
	};
	getBookMsg() {
		return new Promise(resolve => {
			this.connect();
			var sql = 'select * from xiaoshuo;';
			this.connection.query(sql, (err, rows, fields) => {
				if (err) {
					console.log('[query] - :'+err);
					return;
				}
				resolve(rows);
			});
		})
	};
	updatePage(title, new_page_id, new_page_title) {
		return new Promise(resolve => {
			this.connect();

			var sql = `update xiaoshuo set lastchapter="${new_page_id}", chapter_title="${new_page_title}" where title="${title}";`;
			this.connection.query(sql, (err, rows, fields) => {
			    if (err) {
			        console.log('[query] - :'+err);
			        return;
			    }
			    resolve('success')
			});
		})
	};
	insertNewPage(pageID, noteID, pageTitle, date, content) {
		return new Promise(resolve => {
			this.connect();

			let sql = `INSERT INTO qula_page (pageID, noteID, pageTitle, updateDate, pageContent) VALUES (${pageID}, ${noteID}, '${pageTitle}', '${date}', '${content}');`
			this.connection.query(sql, (err, rows, fields) => {
			    if (err) {
			        console.log('[query] - :'+err);
			        resolve({
			        	success: false
			        })
			    }
			    resolve({
			    	success: true
			    })
			});
		})
	}
}

exports = module.exports = new db();