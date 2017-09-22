const readlineSync = require('readline-sync');

const fs = require("fs")

if (!fs.existsSync("user.json")) {

	var user = {
		"login": readlineSync.question("pixiv login: "),
		"password": readlineSync.question("pixiv password: ")
	}
	
	fs.writeFileSync("user.json", JSON.stringify(user, null, "\t"))
	
} else {
	
	var user = require("./user.json")	
	
}

var args = process.argv.slice(2)

if (args[0] == undefined) {
	console.log("use pixiv userId")
	process.exit(1)
}

var userId = args[0]

const path = require("path")

const got = require("got")

const Pixiv = require("pixiv.js")
const pixivImg = require("pixiv-img")
const pixiv = new Pixiv(user.login, user.password)

const PixivAppApi = require("pixiv-app-api")
const pixivAppApi = new PixivAppApi()

const imagePerPage = 100

var first = true

var downloadPath = "./" + userId

if (!fs.existsSync(downloadPath)) {
	fs.mkdirSync(downloadPath)
}

var log = fs.createWriteStream(downloadPath + "/log.txt", {flags: "a"})

var illustsIds = [] // id иллюстрации автора

var downloadTasks = [] // задачи для скачивания

var downloadTasksIdx = 0

var downloadTasksCounter = 0 // счетчик запущенных потоков скачивания

const downloadTasksMax = 10 // максимальное число потоков скачивания

const gotOptions = {
	encoding: null,
	headers: {
		Referer: 'http://www.pixiv.net/'
	}
}

/*
	Скачивает содержимое downloadTasks
*/

function gotIllusts(downloadTaskIndex = undefined, tryCount = 0) {
	
	var di = downloadTaskIndex == undefined ? downloadTasksIdx : downloadTaskIndex
	
	if (downloadTasksCounter < downloadTasksMax) { // если очередь закачки свободна
	
		var downloadTask = downloadTasks[di] // берем инфу о закачке
		
		if (downloadTask != undefined) { // если инфа есть 
		
			if (!fs.existsSync(downloadTask.path)) { // если файла закачки нет то качаем иначе скипаем закачку
				
				downloadTasksCounter ++ // увеличиваем счетчик потоков закачек
				
				const gotStream = got.stream(downloadTask.url, gotOptions);

				gotStream.on('error', err => {
					fs.unlinkSync(downloadTask.path)
					log.write("\nerror: " + err + "\n")
					log.write("path: " + downloadTask.path + "\n")
					log.write("url: " + downloadTask.url + "\n")
					console.log("download error: " + err)
					downloadTasksCounter --
					if (downloadTasksCounter == 0) {
						console.log("download done")
					}
					// пробуем перекачать (не более downloadTasksMax раз)
					if (tryCount < downloadTasksMax) {
						gotIllusts(di, tryCount + 1)
					}
				});
				
				var stream = fs.createWriteStream(downloadTask.path)
				
				stream.on('close', () => {
					stream.end()
					log.write("done: " + downloadTask.path + "\n")
					log.write("url: " + downloadTask.url + "\n")
					console.log("done: " + downloadTask.path)
					downloadTasksCounter --
					if (downloadTasksCounter == 0) {
						console.log("download done")
					}
					
					gotIllusts() // переходим к следующей закачке
				})
				
				gotStream.pipe(stream);
				
			}
			
			if (downloadTaskIndex == undefined) {
				downloadTasksIdx ++
			}

			gotIllusts() // переходим к следующей закачке
			
		}
		
	}
	
}

var illustDetailTaskCounter = 0 // счетчик запросов на получение информации об иллюстрации

var illustDetailMaxTry = 10 // число попыток получить информацию о иллюстрацииd в случае неудачи 

/*
	Берет id кртинки из illustsIds[idsIndex] и запрашивает урл 
	получив url добавляет в downloadTasks задачу на скачивание в виед {url, path}
	Делает это синхронно так как иначе возникает много ошибок 
	tryCount - номер попытки, если больше illustDetailMaxTry (10) 
	повтора не будет id будет скипнут
*/

function addDownloadTask(idsIndex, tryCount = 0) {
	var id = illustsIds[idsIndex] 
	if (id != undefined) {
		illustDetailTaskCounter ++
		pixivAppApi.illustDetail(id).then(res => {
			// определяем тип илюстрации (картинка или пак)
			if (res.illust.metaPages.length > 0) {
				for(var metaPage of res.illust.metaPages) {
					var url = metaPage.imageUrls.original
					var filePath = downloadPath + "/" + path.basename(url) 
					downloadTasks.push({
						url: url,
						path: filePath
					})
				}
			} else {
				var url = res.illust.metaSinglePage.originalImageUrl 
				var filePath = downloadPath + "/" + path.basename(url)
				downloadTasks.push({
					url: url,
					path: filePath
				})
			}
			illustDetailTaskCounter --
			if (illustDetailTaskCounter <= 0) {
				console.log("start downloading " + downloadTasks.length + " tasks")
				gotIllusts()
			}
		}, 
		err => {
			illustDetailTaskCounter --
			if (illustDetailTaskCounter <= 0) {
				console.log("start downloading " + downloadTasks.length + " tasks")
				gotIllusts()
			}
			log.write("\nerror: " + err + "\n")
			log.write("illust id: " + id + "\n")
			log.write("try: " + tryCount + "\n")
			console.log(err.toString())
			console.log("try: " + tryCount)
			if (tryCount < illustDetailMaxTry) {
				addDownloadTask(idsIndex, tryCount + 1)
			}
		})
		if (tryCount == 0) {
			addDownloadTask(idsIndex + 1)
		}
	}
}

function userWorksCaller(res) {
	
	for (image of res.response) {
		illustsIds.push(image.id)
	}
	
	if (res.pagination.next) {
		// get list of user illusts
		pixiv.usersWorks(userId, {
			page: res.pagination.next,
			per_page: imagePerPage,
			image_sizes: "large",
		}).then(userWorksCaller)
		
	} else {
		
		// download illust
		pixivAppApi.login(user.login, user.password)
		console.log("compute download task list")
		addDownloadTask(0)
		
	}
	
}

log.write("\nstart scaning " + userId + "\n")

pixiv.usersWorks(userId, {
	per_page: imagePerPage, 
	image_sizes: "large",
}).then(userWorksCaller)