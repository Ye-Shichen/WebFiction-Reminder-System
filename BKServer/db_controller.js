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
	getNote(noteID, pageID) {
		return new Promise(resolve => {
			this.connect();
			var sql = `SELECT * FROM qula_page WHERE noteID = ${noteID} AND pageID = ${pageID};`;
			this.connection.query(sql, (err, rows, fields) => {
				if (err) {
					console.log('[query] - :'+err);
					resolve('error');
				}
				resolve(rows[0]);
			});
		})
	};
}

exports = module.exports = new db();