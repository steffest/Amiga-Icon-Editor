var IconSet = function(){
	var me = {};
	
	var container;
	var apiBase = "http://localhost:4555/";

	me.init = function(){
		var panel = UI.createPanel("Iconset","","iconset");
		container = $div("inner");
		panel.appendChild(container);

		UI.addPanelToLayout(panel,{
			name: "Iconset",
			position: "left",
			resize: "vertical",
			width: 300,
			order: 5
		});
	};
	
	me.listIconSets = function(next){
		var apiUrl = apiBase +  "list";
		FetchService.json(apiUrl,function(result){
			next(result);
		});
	};
	
	me.loadSet = function(setName){
		console.error(setName);
		// check for config
		API.getJSON(setName + "/config.json").then(config => {
			if (config){
				me.renderSet(setName,config);
			}else{
				var apiUrl = apiBase +  "list" + "/" + setName;
				FetchService.json(apiUrl,function(result){
					if (result && result.data){
						me.renderFolder(container,result.data.folders,result.data.files,setName);
					}
				});
			}
		});
	};

	me.renderSet = function(path,config){
		console.log("rendering set " + path);
		container.innerHTML = '<div class="setfile header"><div class="main">Name</div><div class="exports"><div class="version">Size</div><div class="version">PNG</div><div class="version">64C</div><div class="version">MUI</div></div>' ;
		config.setName = path;
		config.fullExportPath = path + "/" + config.exportPath;
		config.fullBasePath = path + "/" + config.basePath;
		var rootPath = config.fullBasePath + "/" + config.sizes[0];
		var count = 0;
		var folders=[];
		if (config.sizes){
			folders.push(path + "/" + config.basePath + "/" + config.sizes[0]);
		}else{
			folders.push(path + "/" + config.basePath);
		}

		function nextFolder(){
			if (folders.length){
				var folder = folders.shift();
				var relativeFolder = folder.replace(rootPath,"");
				if (relativeFolder){
					var title = $div("setfolder","",relativeFolder);
					container.append(title);
				}

				API.getFolder(folder).then(data => {
					if (data) data=data.data;
					if (data){
						data.folders.forEach(item => {
							console.warn("adding " + folder + "/" + item);
							folders.push(folder + "/" + item);
						});
						data.files.forEach(file => {
							count++;
							var elm = renderSetFolder(folder,file,count,config);
							if (elm) container.appendChild(elm);
						});
					}
					nextFolder();
				})
			}else{
				console.log("All done");
			}
		}
		nextFolder();


	};

	function renderSetFolder(folder,file,count,config){
		if (file.indexOf("_01.png")>0){
			var baseName = file.replace("_01.png","");
			var result = $div("setfile","setfile" + count);


			var exports = config.export;
			var exportElm = $div("exports");

			var baseFile = folder + "/" + file;
			var rootPath = config.fullBasePath + "/" + config.sizes[0];
			var relativeFile =  baseFile.replace(rootPath,"");

			var main = $div("main","",baseName);
			main.onclick = function(){loadFile(baseFile);};
			result.appendChild(main);

			config.rootPath  = rootPath;
			config.relativeFile  = relativeFile;
			config.sizes.forEach(size => {
				var sizeElm = $div("row");
				sizeElm.appendChild(renderSetVersion(config, size,size,"png",size,size === config.sizes[0]));
				if (exports.dualPng) sizeElm.appendChild(renderSetVersion(config,size,"Dual_png","icon","&nbsp;"));
				if (exports.colorIcon) sizeElm.appendChild(renderSetVersion(config,size,"Color_icon","icon","&nbsp;"));
				if (exports.mui)sizeElm.appendChild(renderSetVersion(config,size,"MUI","icon","&nbsp;"));

				exportElm.appendChild(sizeElm);
			});
			result.appendChild(exportElm);
			return result;
		}
	}

	function renderSetVersion(config,size,target,type,innerHTML,isMain){

		var result = $div("version export" + type + " " + (isMain?"ok":""),"",innerHTML);

		var filepath = config.setName + "/" + ((type === "icon")?config.exportPath:config.basePath) + "/" + size + "/";
		var filename = config.relativeFile;
		if (type === "icon") {
			filepath += target + "/";
			filename = filename.replace("_01.png",".info");
			//console.error(filename);
		}

		if (!isMain){
			API.exists(filepath + filename).then(exists => {
				result.classList.add(exists?"ok":"nok");

			});
		}

		result.onclick = function(){
			if (type==="icon" && Main.isShift){
				// export icon
				var exportPath = (filepath + filename).split("//").join("/");
				var exportFunction;
				if (target === "Dual_png") exportFunction = Main.savePng;
				if (target === "Color_icon") exportFunction = Main.save;
				if (target === "MUI") exportFunction = Main.saveClassic;

				if (exportFunction){
					exportFunction(function(blob){
						API.putFile(exportPath,blob).then(_result => {
							if (_result && _result.data === "ok"){
								result.classList.add("ok");
								result.classList.remove("nok");
							}else{
								result.classList.add("nok");
								result.classList.remove("ok");
							}
						});
					});
				}
				console.error(exportPath);
			}else{
				// load or generate icon
				if (this.classList.contains("ok")){
					loadFile(filepath + filename);
				}else{
					//loadFile(filepath + filename);
					var sizeRootPath = config.rootPath.replace(config.sizes[0],size);
					var rootFile = sizeRootPath  + filename.replace(".info","_01.png");
					loadFile(rootFile,function(){
						console.error("generate");
						var select = document.getElementById("toolbar").querySelector("select");
						var range = document.getElementById("toolbar").querySelector('input[type=range]');
						if (target === "MUI"){
							select.value = "Checks (very high)";
							//select.value = "Floyd-Steinberg (50%)";
							range.value = 149;
							ImageProcessing.setDithering(select.selectedIndex,true);
							ImageProcessing.setAlphaThreshold(range.value,true);
							IconEditor.setState(1);
							IconEditor.reduceColours(Icon.MUIPalette);
							setTimeout(function(){
								IconEditor.setState(0);
								IconEditor.reduceColours(Icon.MUIPalette);
							},200);

						}
						if (target === "Color_icon"){
							select.value = "Floyd-Steinberg (50%)";
							range.value = 149;
							ImageProcessing.setDithering(select.selectedIndex,true);
							ImageProcessing.setAlphaThreshold(range.value,true);
							IconEditor.setState(1);
							IconEditor.reduceColours(64);
							setTimeout(function(){
								IconEditor.setState(0);
								IconEditor.reduceColours(64);
							},400);

						}
						if (target === "Dual_png"){

						}

					});
				}
			}

		};


		return result;
	}
	
	me.renderFolder = function(parent,folders,files,path){
		parent.innerHTML = "";

		var col = 0;
		var row = 0;

		var top = parent.classList.contains("innerwindow") ? 0 : 30;
		
		folders.forEach(function(folderName){
			var folder = createFolder(folderName,path);
			folder.style.left = (col*50) + "px";
			folder.style.top = (top + (row*60)) + "px";
			col++;
			if (col>4){
				col = 0;
				row++;
			}
			parent.appendChild(folder);
		});

		files.forEach(function(fileName){
			var ext = fileName.split(".").pop().toLowerCase();
			if (ext === "info"){
				var icon = createIcon(fileName,path);
				icon.style.left = (col*50) + "px";
				icon.style.top = (top + (row*60)) + "px";
				col++;
				if (col>4){
					col = 0;
					row++;
				}
				parent.appendChild(icon);
			}
			//var folder = createFolder(folderName,path);
			//parent.appendChild(folder);
		});
	};
	
	me.openFolder = function(name,path){
		var window = createWindow(name,path);

		var apiUrl = apiBase +  "list" + "/" + path;
		FetchService.json(apiUrl,function(result){
			if (result && result.data && result.data){
				me.renderFolder(window,result.data.folders,result.data.files,path);
			}
		});
		
	};

	me.loadIcon = function(path,next){
		var apiUrl = apiBase +  "get" + "/" + path;
		FetchService.arrayBuffer(apiUrl,function(result,error){
			console.error(result);
			var file = BinaryStream(result,true);
			var icon = Icon.parse(file);
			if (icon && icon.info){
				icon.info.path = path;
				next(icon);
			}else{
				next();
			}
		});
	};

	me.loadPNG = function(path,next){

	};
	
	function createFolder(name,path){
		var label = $div("label","",name);
		var folder = $div("folder","",label);
		UI.enableDrag(folder);
		folder.ondblclick = function(){
			me.openFolder(name,path + "/" + name);
		};
		UI.enableDrag(folder);
		return folder;
	}

	function createIcon(name,path){
		var label = $div("label","",name);
		var image = $div("image");
		var iconElm = $div("icon","",image);
		iconElm.appendChild(label);

		var fullPath = path || "";
		if (fullPath) fullPath += "/";
		fullPath += name;
		iconElm.path = fullPath;

		var canvas1, canvas2;

		me.loadIcon(path + "/" + name,function(icon){
			if (icon){
				canvas1 = Icon.getImage(icon,0);
				canvas1.className = "state1";
				canvas2 = Icon.getImage(icon,1);
				canvas2.className = "state2";
				image.appendChild(canvas1);
				image.appendChild(canvas2);
				iconElm.classList.add("loaded");
			}
		});
		UI.enableDrag(iconElm,"",true);

		iconElm.ondblclick = function(){
			IconEditor.editIconDualState(canvas1,canvas2);
			//me.openFolder(name,path + "/" + name);
		};
		return iconElm;
	}
	
	function createWindow(name,path){
		var window = $div("window");
		var windowBar =  $div("bar","",name);
		var inner = $div("inner innerwindow droptarget");
		var sizer = $div("sizer");
		var close = $div("close");
		windowBar.appendChild(close);
		window.appendChild(windowBar);
		window.appendChild(inner);
		window.appendChild(sizer);

		container.appendChild(window);
		UI.enableDrag(window,windowBar);
		UI.enableResize(window,sizer);
		close.onclick = function(){
			window.remove();
		};


		inner.ondrop = function(sourceElement,dragElement){
			console.error(sourceElement);
			console.error(sourceElement.path);

			inner.appendChild(sourceElement);
			var pos = getElementPosition(inner);
			var offsetX = dragElement.offsetLeft - pos.left;
			var offsetY = dragElement.offsetTop - pos.top;
			sourceElement.style.left = offsetX + "px";
			sourceElement.style.top = offsetY + "px";

			console.log("Moving icon " + sourceElement.path + " to " + path);
			me.moveFile(sourceElement.path,path);

		};
		return inner;
	}

	me.moveFile = function(source,target){
		var url = apiBase + "move/" + source + "?to=" + target;
		FetchService.json(url,function(result){
			console.log(result);
		});
	};

	function loadFile(path,next){
		console.log("loadfile " + path);
		var ext = path.split(".").pop().toLowerCase();
		var filename = path.split("/").pop().toLowerCase();

		if (ext === "png"){
			var url = API.getFileUrl(path);
			var activeUrl = url.replace("_01.","_02.");

			var loadCount=0;
			var done = function(){
				if (next && loadCount>1) next();
			};
			Iconlist.loadIcon(url,filename,function(icon){
				IconEditor.setState(false);
				IconEditor.editIcon(icon.canvas);
				loadCount++;
				done();
			});
			Iconlist.loadIcon(activeUrl,filename,function(icon){
				IconEditor.setState(true);
				IconEditor.editIcon(icon.canvas);
				loadCount++;
				done();
			});
		}
		if (ext === "info"){
			var file = API.getFile(path).then(data => {
				Iconlist.loadIcon(data,filename,function(icons){
					if (icons){
						IconEditor.setState(false);
						IconEditor.editIcon(icons.inactive.canvas);
						IconEditor.setState(true);
						IconEditor.editIcon(icons.active.canvas);
					}
				});
			})
		}
	}
	
	
	return me;
}();