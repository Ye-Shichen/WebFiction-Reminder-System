const db = require('./../db_controller')
const get_page = require('./../get_page.js')

// simpleCrawl(1409)
main()
async function main() {
	let isLock = true;
	let checkTime = 0;
	let startIndex = 0,
		currentIndex = 0;
	do {
		await sleep(checkTime)
		isLock = await db.checkLock()
		checkTime++;
	} while (!!isLock)
	await db.setLock();

	let res = await db.getFreeIndex();
	if(res.length !== 0) {
		await db.setLockIndex(res[0].startIndex)
		startIndex = res[0].startIndex;
	} else {
		let res = await db.getLatestIndex();	
		startIndex = res;
		if (startIndex <= 112400) {
			await db.insertLockIndex(startIndex);
		} else {
			await db.setUnLock();
			db.destroy();
			return ;
		}
	}
	db.setUnLock();
	currentIndex = startIndex;
	
	// 爬取
	do {
		const res = await get_page(currentIndex);

		if (res !== false) {
			console.log(`Crawling ID: ${currentIndex}, Title: ${res.title}`)
			await db.insertContents(res);
		} else {
			console.log(`Crawling ID: ${currentIndex} error`)
		}

		currentIndex++;
	} while(currentIndex%100 !== 1)

	if (currentIndex % 100 === 1) {
		await db.setIndexFinish(startIndex)
	} else {
		await db.setUnLockIndex(startIndex)
	}
	db.destroy();
	if (currentIndex != 112400) {
		main();
	}
}

async function simpleCrawl(id) {
	const res = await get_page(id);

	if (res !== false) {
		console.log(`Crawling ID: ${id}, Title: ${res.title}`)
		await db.insertContents(res);
	} else {
		console.log(`Crawling ID: ${id} error`)
	}
	db.destroy();

}

function checkLock(row, that) {
	return new Promise(resolve => {	
		if (row[0].current === '1') {
			console.log(row[0])
			try {
				setTimeout(main, 1000)
			} catch(err) {
				console.log('Error:', err)
			}
		} else {
			console.log('ok')
			db.setLock()
			db.destroy();
		}
	})
}


function sleep(time) {
	return new Promise(resolve => {
		setTimeout(resolve, time * 1000);
	})
}
