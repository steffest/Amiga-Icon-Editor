var Toolbar = function(){
	var me = {};

	var container;
	var select;
	var colorIcon,backgroundIcon;
	
	var muiPalette = [
		[149,149,149],
		[0,0,0],
		[255,255,255],
		[59,103,162],
		[123,123,123],
		[175,175,175],
		[170,144,124],
		[255,169,151]
	];

	var sketchPalette = [
		[149,149,149],
		[58,65,67],
		[255,255,255],
		[141,174,198],
		[230,213,144],
		[231,227,216],
		[90,171,119],
		[171,57,57]
	];

	var spotifyPalette = [
		[244, 228, 205],
		[237, 201, 156],
		[227, 179, 114],
		[219, 163, 80],
		[200, 114, 58],
		[137, 72, 44],
		[90, 44, 23],
		[54, 22, 13],
		[5, 3, 4],
		[187, 186, 155],
		[179, 176, 142],
		[171, 168, 135],
		[156, 151, 124],
		[151, 141, 113],
		[133, 123, 102],
		[124, 111, 93],
	];

	// https://pixeljoint.com/forum/forum_posts.asp?TID=12795
	var db16Palette = [
		[20,12,28],
		[68,36,52],
		[48,52,109],
		[78,74,78],
		[133,76,48],
		[52,101,36],
		[208,70,72],
		[117,113,97],
		[89,125,206],
		[210,125,44],
		[133,149,161],
		[109,170,44],
		[210,170,153],
		[109,194,202],
		[218,212,94],
		[222,238,214]
	];

	// DawnBringer's 32 Col Palette
	//http://pixeljoint.com/forum/forum_posts.asp?TID=16247
	var db32Palette = [
		[0,0,0],
		[34,32,52],
		[69,40,60],
		[102,57,49],
		[143,86,59],
		[223,113,38],
		[217,160,102],
		[238,195,154],
		[251,242,54],
		[153,229,80],
		[106,190,48],
		[55,148,110],
		[75,105,47],
		[82,75,36],
		[50,60,57],
		[63,63,116],
		[48,96,130],
		[91,110,225],
		[99,155,255],
		[95,205,228],
		[203,219,252],
		[255,255,255],
		[155,173,183],
		[132,126,135],
		[105,106,106],
		[89,86,82],
		[118,66,138],
		[172,50,50],
		[217,87,99],
		[215,123,186],
		[143,151,74],
		[138,111,48]
	];

	// https://fulifuli.tumblr.com/post/141892525920/grafxkids-today-land-palette-release
	var gfxkPalette = [[17,10,3],[17,10,3],[99,13,38],[71,18,92],[37,30,106],[62,40,40],[14,53,62],[40,53,74],[152,30,130],[33,74,167],[181,45,27],[133,62,51],[21,105,72],[28,100,112],[109,93,91],[69,105,117],[10,152,216],[238,98,131],[202,117,56],[219,110,83],[240,117,8],[30,182,120],[89,179,45],[126,174,163],[176,162,141],[249,178,167],[245,185,125],[73,227,218],[251,197,49],[211,229,73],[239,239,233],[255,255,255]];

	var paletteMap = {
		mui: muiPalette,
		db16: db16Palette,
		db32: db32Palette,
		gfxk: gfxkPalette
	};
	var content = [
		{
			label: "File",
			items: [
				{label: "Load", action: "main.import"},
				{label: "Save", action: "main.save"},
				{label: "PNG", action: "main.savePng"},
				{label: "Classic", action: "main.saveClassic"}
			]
		},
		{
			label: "Colors",
			content : function(parent){
				colorIcon = $div("coloricon");
				backgroundIcon = $div("coloricon");
				backgroundIcon.style.backgroundColor = IconEditor.getBackgroundColor(true);

				parent.appendChild(colorIcon);
				parent.appendChild(backgroundIcon);
			}
		}, {
			label: "Optimized color palette",
			items: [
				{label: "2", action: "", colours: 2},
				{label: "4", action: "", colours: 4},
				{label: "8", action: "", colours: 8},
				{label: "16", action: "", colours: 16},
				{label: "32", action: "", colours: 32},
				{label: "64", action: "", colours: 64},
				{label: "256", action: "", colours: 256},
				{label: "Full", action: "", colours: 0}
			]
		},{
			label: "Default Palette",
			items: [
				{label: "MUI", action: "", palette: muiPalette},
				{label: "Sketch", action: "", palette: sketchPalette},
				{label: "DB16", action: "", palette: db16Palette},
				{label: "DB32", action: "", palette: db32Palette},
				{label: "GFXK", action: "", palette: gfxkPalette},
				{label: "Left", action: "", palette: 1},
			]
		},
		{
			label: "Dithering",
			content : function(parent){
				var dithering = ImageProcessing.getDithering();
				select = document.createElement("select");

				dithering.forEach(function(d,index){
					var option = document.createElement("option");
					option.text = d.label;
					select.add(option);
				});

				select.onchange = function(){
					ImageProcessing.setDithering(this.selectedIndex);
				};

				var prevSelect = $div("button square","","<");
				var nextSelect = $div("button square","",">");

				prevSelect.onclick = function(){me.setDitheringIndex(-1)};
				nextSelect.onclick = function(){me.setDitheringIndex(1)};

				parent.appendChild(select);
				parent.appendChild(prevSelect);
				parent.appendChild(nextSelect);

			}
		},
		{
			label: "Alpha Threshold",
			content : function(parent){
				var range = document.createElement("input");
				range.type = "range";
				range.min = 1;
				range.max = 255;
				range.value = 44;
				range.onchange = function(){
					ImageProcessing.setAlphaThreshold(range.value);
				};

				parent.appendChild(range);

			}
		},
		{
			label: "Icon sets",
			content : function(parent){

				var iconSetSelect = document.createElement("select");
				var option = document.createElement("option");
				option.text = "----";
				iconSetSelect.add(option);
				parent.appendChild(iconSetSelect);
				
				iconSetSelect.onchange = function(){
					IconSet.loadSet(this.value);
					//ImageProcessing.setDithering(this.selectedIndex);
				};
				
				IconSet.listIconSets(function(result){
					console.log(result);
					if (result && result.data && result.data.folders){
						result.data.folders.forEach(function(d,index){
							var option = document.createElement("option");
							option.text = d;
							iconSetSelect.add(option);
						});
					}
				});
				
				

				//parent.appendChild(range);

			}
		}
	];
	
	me.init = function(){
		if (AmiBase.isAmiBased){
			var mainMenu = [
				{
					label:"Icon Editor",
					items:[
						{
							label:"About",
							message: "about"
						}
					]
				},
				{
					label:"File",
					items:[{label:"Open", message: "main.import"},
						   {label:"Save as Classic Icon",message: "main.saveClassic"},
						   {label:"Save as Color Icon", message: "main.save"},
						   {label:"Save as Dual PNG", message: "main.savePng"}]
				},
				{
					label:"Palette",
					items:[
						{label:"2 colors", message: "palette.2"},
						{label:"4 colors", message: "palette.4"},
						{label:"8 colors", message: "palette.8"},
						{label:"16 colors", message: "palette.16"},
						{label:"32 colors", message: "palette.32"},
						{label:"64 colors", message: "palette.64"},
						{label:"256 colors", message: "palette.256"},
						{label:"Full", message: "palette.0"},
							{label:"-"},
							{label:"Magical User Interface 8", message: "palette.mui"},
							{label:"DawnBringer's 16", message: "palette.db16"},
							{label:"DawnBringer's 32", message: "palette.db32"},
							{label:"GrafX Kids", message: "palette.gfxk"},
						   ]
				}
			];

			AmiBase.setMenu(mainMenu);
			AmiBase.setMessageHandler(function(message){
				console.log(message);

				if (typeof message === "string"){
					message.indexOf(".")>0?Main[message.split(".")[1]]():ImageProcessing[message]();
				}else{
					var m = message.message || '';
					var f = m.split(".")[1];
					if (m === "openfile" || m === "dropfile"){
						if (message.data && message.data.data){
							var buffer = message.data.data;
							var fileName = message.data.filename || "file";
							Iconlist.loadIcon(buffer,fileName);
							AmiBase.focus();
						}else{
							console.error(message.data);
							AmiBase.getFile(message.data.path,true,function(data){
								console.error('callback!');
								console.error(data);

								var buffer = data.data;
								var fileName = "icon.info";
								Iconlist.loadIcon(buffer,fileName);
								AmiBase.focus();
							});

						}
					}

					if (m === "callback"){
						AmiBase.callback(message.data.id,message.data);
					}
					if (m.indexOf("main."===0)){
						Main[f];
					}
					if (m.indexOf("imageprocessing."===0)){
						ImageProcessing[f];
					}
					if (m.indexOf("palette."===0)){
						var colours = parseInt(f);
						if (isNaN(colours)){
							IconEditor.reduceColours(paletteMap[f]);
						}else{
							IconEditor.reduceColours(colours);
						}
					}


					/*if (button.palette){
						if (button.palette === 1){
							button.palette = IconEditor.getCurrentIcon().state1.palette
						}
						IconEditor.reduceColours(button.palette);
					}else{
						IconEditor.reduceColours(button.colours);
					}*/
				}
			})
		}else{
			container = $div("","toolbar");
			UI.mainContainer.appendChild(container);
			container.appendChild(UI.createGroup(content));
		}

	};
	
	me.setDitheringIndex = function(offset){
		var max = ImageProcessing.getDithering().length;
		var index = select.selectedIndex;
		index += offset;
		if (index<0) index = max-1;
		if (index>=max) index =0;
		select.selectedIndex = index;
		select.onchange();
	};
	
	EventBus.on(EVENT.drawColorChanged,function(){
		var color = IconEditor.getDrawColor();
		colorIcon.style.backgroundColor = color;
	});

	EventBus.on(EVENT.backgroundColorChanged,function(){
		var color = IconEditor.getBackgroundColor(true);
		backgroundIcon.style.backgroundColor = color;
	});
	
	return me;
}();