const express = require("express");
const bodyParser = require("body-parser"); 
const app = express(); 
const db = require("./db_controller.js")
app.use(bodyParser.urlencoded({ extended: false }));  

const PORT = 10309;

app.all('*', (req, res, next) => {  
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
    res.header("Access-Control-Allow-Methods","POST,GET,OPTIONS");  
    res.header("X-Powered-By",' 3.2.1')  
    res.header("Content-Type", "application/json;charset=utf-8");  
    next();  
});

app.get("/getNote", async (req, res) => {
	// console.log(req)
	console.log(`[${new Date().toLocaleString()}] 请求方法${req.url}`);
	let _res;
	try {
		_res = await db.getNote(req.query.note, req.query.page);
	} catch(err) {
		console.log(err)
		_res = 'err';
	}
	const result = 
	{
		success: true,
		data: _res
	}
    res.send(result);
    db.destroy()
});

/* ******** */
const server = app.listen(PORT, () => {
  console.log("BKServer运行中，端口号:%d", PORT)
})