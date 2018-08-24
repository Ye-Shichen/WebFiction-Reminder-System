'use strict'
const mysql = require('mysql')
const db_config = require('./../../config/db_config.js')

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
		this.connection.end(function(err){
		    if(err){       
			    console.log('Connection End Failed.');
		        return;
		    }
		});
		this.connection = null;
		this.connected = false;
	};

	checkLock() {
		return new Promise(resolve => {
			this.connect();
			const sql = `SELECT * FROM spider_status WHERE tableName = 'contents' AND startIndex = 0;`;
			this.connection.query(sql, (err, rows, fields) => {
				if (err) {
					console.log('[checkLock Error:] - :'+err);
					resolve('failed');
				}
				resolve(rows[0].current);
			})
		})
	};
	setLock(SuccessFunc) {
		return new Promise(resolve => {
			this.connect();
			const sql = `UPDATE spider_status SET current = 1 where tableName = 'contents' AND startIndex = 0;`

			this.connection.query(sql, (err, rows, fields) => {
				if (err) {
					console.log('[query] - :'+err);
					resolve();
				}
				resolve(rows);
			})
		})
	};
	setUnLock() {
		return new Promise(resolve => {
			this.connect();
			const sql = `UPDATE spider_status SET current = 0 where tableName = 'contents' AND startIndex = 0;`

			this.connection.query(sql, (err, rows, fields) => {
				if (err) {
					console.log('[query] - :'+err);
					resolve();
				}
				resolve(rows);
			})
		})
	};

	getFreeIndex() {
		return new Promise(resolve => {
			this.connect();
			const sql = `SELECT * FROM spider_status WHERE tableName = 'contents' AND startIndex <> 0 AND current <> 1 AND status = 'unFinished';`

			this.connection.query(sql, (err, rows, fields) => {
				if (err) {
					console.log('[query] - :'+err);
					resolve();
				}
				resolve(rows);
			})
		})
	}
	getLatestIndex() {
		return new Promise(resolve => {
			this.connect();
			const sql = 'SELECT MAX(startIndex) AS latestId FROM spider_status;'
			this.connection.query(sql, (err, rows, fields) => {
				if (err) {
					console.log('[query] - :'+err);
					resolve();
				}
				resolve(rows[0].latestId + 100)
			})
		})
	}
	setLockIndex(index) {
		return new Promise(resolve => {
			this.connect();
			const sql = `UPDATE spider_status SET current = 1 WHERE tableName = 'contents' AND startIndex = ${index};`

			this.connection.query(sql, (err, rows, fields) => {
				if (err) {
					console.log('[query] - :'+err);
					resolve();
				}
				resolve(rows);
			})
		})
	}
	setUnLockIndex(index) {
		return new Promise(resolve => {
			this.connect();
			const sql = `UPDATE spider_status SET current = 0 WHERE tableName = 'contents' AND startIndex = ${index};`

			this.connection.query(sql, (err, rows, fields) => {
				if (err) {
					console.log('[query] - :'+err);
					resolve();
				}
				resolve(rows);
			})
		})
	}

	insertLockIndex(index) {
		return new Promise(resolve => {
			this.connect();
			const sql = `INSERT INTO spider_status (tableName, current, startIndex) VALUES ('contents', 1, ${index});`

			this.connection.query(sql, (err, rows, fields) => {
				if (err) {
					console.log('[query] - :'+err);
					resolve();
				}
				resolve('success');
			})
		})
	}
	setIndexFinish(index) {
		return new Promise(resolve => {
			this.connect();
			const sql = `UPDATE spider_status SET status = 'Finished' WHERE tableName = 'contents' AND startIndex = ${index};`

			this.connection.query(sql, (err, rows, fields) => {
				if (err) {
					console.log('[query] - :'+err);
					resolve();
				}
				resolve('success');
			})
		})
	}
	insertContents(msgObj) {
		return new Promise(resolve => {
			this.connect();
			const sql = `INSERT INTO contents VALUES ('${msgObj.title}', ${msgObj.id}, '${msgObj.author}', '${msgObj.category}', '${msgObj.status}', 0);`;
			this.connection.query(sql, (err, rows, fields) => {
				if (err) {
					console.log('[query] - :' + err);

					resolve('failed');
				}
				resolve()
			})
		})
	}
}

exports = module.exports = new db();