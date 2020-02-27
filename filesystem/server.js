var http = require('http');
var fs = require('fs');

var port = 4555;
var version = "0.0.1";
var apiName = "Simple FileSystem Bridge";

var basePath = "/users/steffest/Dropbox/Emulation/Amiga/ICO/";
basePath = "F:/Steffest/Dropbox/Emulation/Amiga/ICO/";


http.createServer(function (req, res) {

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	res.setHeader('Access-Control-Allow-Headers', '*');
	if ( req.method === 'OPTIONS' ) {
		res.writeHead(200);
		res.end();
		return;
	}
	
	var url = req.url.substr(1);
	url = url.split("?")[0];
	url = decodeURIComponent(url);
	var parts = url.split("/");
	
	var method = parts.shift();
	var result = {
		api: apiName,
		version: version,
		data: undefined
	};
	
	switch (method) {
		case "list":
			let folder = parts.join("/");
			folder = folder.split(".").join("");
			listFolder(folder,function(data){
				result.data = data;
				respond();
			});
			break;
		case "get":
			let path = parts.join("/");
			serveFile(path,res);
			break;
		default:
			result.data = "Unknown method: " + method;
			respond();
	}
	
	function respond(){
		res.write(JSON.stringify(result));
		res.end();
	}
	
	
}).listen(port);


function listFolder(folder,next){
	fs.readdir(basePath + folder, function (err, files) {
		if (err) {
			next(err);
		}else{
			var list = {
				folders:[],
				files:[]
			};
			files.forEach(function (file) {
				var info = fs.lstatSync(basePath + folder + "/" + file);
				if (info.isDirectory()){
					list.folders.push(file)
				}else{
					list.files.push(file)
				}
			});
			next(list);
		}
	});
}

function serveFile(path,res){
	let frstream = fs.createReadStream(basePath  + path);
	res.statusCode = "200";
	res.setHeader("Content-Type", "application/octet-stream");
	frstream.pipe(res);
}

console.error("running on port " + port);

