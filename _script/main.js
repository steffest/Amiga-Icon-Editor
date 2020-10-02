var Main = function(){
	var me = {};
	
	var previews = [];
	var fullPreview;
	
	me.init = function(){
		AmiBase.init(function(success){
			console.log("Amibased: " + success);

			UI.init();
			Toolbar.init();
			Iconlist.init();
			IconEditor.init();
			IconSet.init();
			Filesystem.init();


			previews.push(PreviewWindow("silver"));
			previews.push(PreviewWindow("rgb(89,131,177)"));
			previews.push(PreviewWindow("rgb(40,40,40)"));

			fullPreview = FullWindow("silver");

			document.onkeydown = function(e){
				//console.error(e.keyCode);
				if (e.keyCode === 16){
					//console.log("shift");
					me.isShift = true;
					document.body.classList.add("shift");
				}
				if ((e.keyCode === 91) || (e.keyCode === 93)){
					me.isMeta = true;
					document.body.classList.add("meta");
				}
				if (e.keyCode === 9){
					e.preventDefault();
					IconEditor.toggleState();
				}
			};

			document.onkeyup = function(){
				me.isShift = false;
				me.isMeta = false;
				document.body.classList.remove("shift");
				document.body.classList.remove("meta");
			};

			me.load();




		});


	};

	me.load = function(){
		FetchService.json("data/set.json",function(data){
			//console.error(data);
			data.forEach(function(item){
				Iconlist.loadIcon(item.url);
			});
		});

		AmiBase.iAmReady();
	};
	
	me.import = function(){
		var input = document.createElement('input');
		input.type = 'file';
		input.onchange = function(e){
			me.handleUpload(e.target.files);
		};
		input.click();
	};
	
	me.save = function(next){
		// save as ColorIcon
		var iconData = IconEditor.getCurrentIcon();
		var canvas = iconData.state1.processedCanvas;
		var palette = [];
		var pixels = [];
		var ctx = canvas.getContext("2d");

		var canvas2 = iconData.state2.processedCanvas;
		var palette2 = [];
		var pixels2 = [];
		var ctx2 = canvas2.getContext("2d");

		var w = canvas.width;
		var h = canvas.height;

		// for images < 8 colors we use the transparentColor as actual color;
		// for >=8 we add the transparent color as extra color (image processing should have filtered that out already)
		if (IconEditor.getPalette().length > 7){
			palette.push(IconEditor.getBackgroundColor());
			palette2.push(IconEditor.getBackgroundColor());
		}

		
		var r,g,b,alpha;
		var colorLookup = {};
		var colorLookup2 = {};

		function matchColor(r,g,b,_palette){
			for (var i=1,max=_palette.length;i<max;i++){
				var color = _palette[i];
				var div = Math.abs(color[0]-r) + Math.abs(color[1]-g) + Math.abs(color[2]-b);
				if (div === 0){
					return i;
				}else{
					// TODO: is this still needed? palette should already be exact?
					if (div<5){
						return i;
					}
				}
			}
			return -1;
		}

		
		// canvas colours to pixel array
		var data = ctx.getImageData(0, 0, w, h).data;
		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++) {
				var index = (x + y * w) * 4;

				r = data[index];
				g = data[index+1];
				b = data[index+2];
				alpha = data[index+3];
				
				if(alpha>100){
					var rgb = rgbToHex(r,g,b);
					var colorIndex = colorLookup[rgb];
					console.warn(colorIndex);
					if (typeof colorIndex === "undefined"){
						colorIndex = matchColor(r,g,b,palette);
						if (colorIndex<0){
							console.log("new color");
							palette.push([r,g,b]);
							colorIndex = palette.length-1;
							colorLookup[rgb] = colorIndex;
						}
					}
					console.error(colorIndex);
					pixels.push(colorIndex);
				}else{
					pixels.push(0);
				}
			}
		}

		var data2 = ctx2.getImageData(0, 0, w, h).data;
		colorLookup2 = {};
		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++) {
				var index = (x + y * w) * 4;

				r = data2[index];
				g = data2[index+1];
				b = data2[index+2];
				alpha = data2[index+3];

				if(alpha>100){
					var rgb = rgbToHex(r,g,b);
					var colorIndex = colorLookup2[rgb];
					if (typeof colorIndex === "undefined"){
						colorIndex = matchColor(r,g,b,palette2);
						if (colorIndex<0){
							palette2.push([r,g,b]);
							colorIndex = palette2.length-1;
							colorLookup2[rgb] = colorIndex;
						}
					}
					//console.error(colorIndex);
					pixels2.push(colorIndex);
				}else{
					pixels2.push(0);
				}
			}
		}
		
		var icon = Icon.create(w,h);

		icon.colorIcon.MaxPaletteSize = palette.length;
		var state = icon.colorIcon.states[0];
		state.NumColors = palette.length;
		state.paletteSize = state.NumColors * 3;
		state.palette = palette.slice();
		state.pixels = pixels.slice();

		icon.colorIcon.states.push(
			{
				transparentIndex: 0,
				flags:3,// ? Bit 1: transparent color exists - Bit 2: Palette Exists
				imageCompression:0,
				paletteCompression:0,
				depth:8, // number of bits to store each pixel
				imageSize: pixels2.length
			}
		);
		var state2 = icon.colorIcon.states[1];
		state2.NumColors = palette2.length;
		state2.paletteSize = state2.NumColors * 3;
		state2.palette = palette2.slice();
		state2.pixels = pixels2.slice();


		var buffer = Icon.write(icon);

		if (next){
			next(buffer);
		}else{
			var blob = new Blob([buffer], {type: "application/octet-stream"});
			var fileName = 'icon.info';
			saveAs(blob,fileName);
		}
	};
	
	me.savePng = function(next){
		var canvas = IconEditor.getCurrentIcon().state1.originalCanvas;
		var canvas2 = IconEditor.getCurrentIcon().state2.originalCanvas;
		canvas.toBlob(function(blob1) {
			canvas2.toBlob(function(blob2) {

				var blob = new Blob([blob1,blob2], {type: "application/octet-stream"});

				if (next){
					next(blob);
				}else{
					saveAs(blob,"dualpng.info");
				}
			});
		});
	};

	me.saveClassic = function(next){
		var iconData = IconEditor.getCurrentIcon();
		var canvas = iconData.state1.processedCanvas;
		var canvas2 = iconData.state2.processedCanvas;
		var ctx = canvas.getContext("2d");
		var ctx2 = canvas2.getContext("2d");

		var w = canvas.width;
		var h = canvas.height;

		var r,g,b,alpha;
		var colorLookup = {};

		var icon = Icon.create(w,h);

		// discard ColorIcon
		icon.colorIcon = undefined;
		icon.width = w;
		icon.height = h;
		icon.img.width = w;
		icon.img.height = h;
		icon.img.depth = 3; // 8 colors
		icon.img.pixels = [];
		icon.img2.width = w;
		icon.img2.height = h;
		icon.img2.depth = 3; // 8 colors
		icon.img2.pixels = [];

		function fillPixels(_ctx,pixels){
			// canvas colours to pixel array

			var MUIColors = [
				"#959595",
				"#000000",
				"#ffffff",
				"#3b67a2",
				"#7b7b7b",
				"#afafaf",
				"#aa907c",
				"#ffa997"
			];


			var data = _ctx.getImageData(0, 0, w, h).data;
			for (var y = 0; y < h; y++) {
				for (var x = 0; x < w; x++) {
					var index = (x + y * w) * 4;

					r = data[index];
					g = data[index+1];
					b = data[index+2];
					alpha = data[index+3];


					if(alpha>100){
						var rgb = rgbToHex(r,g,b);
						var colorIndex = MUIColors.indexOf(rgb);
						if (colorIndex<0){
							console.error("No MUI color: " + rgb);
							colorIndex = 0;
						}
						//console.error(rgb);
						//icon.img.pixels.push(colorIndex);
						//colorIndex = 6;
						pixels.push(colorIndex);
					}else{
						pixels.push(0);
					}
				}
			}
		}

		fillPixels(ctx,icon.img.pixels);
		fillPixels(ctx2,icon.img2.pixels);

		var buffer = Icon.write(icon);

		if (next){
			next(buffer);
		}else{
			var blob = new Blob([buffer], {type: "application/octet-stream"});
			var fileName = 'icon.info';
			saveAs(blob,fileName);
		}
	};

	me.handleUpload = function(files){
		console.log("file uploaded");
		if (files.length){
			var file = files[0];

			var reader = new FileReader();
			reader.onload = function(){
				Iconlist.loadIcon(reader.result,file.name);
			};
			if (file.name.indexOf(".info")>=0){
				reader.readAsArrayBuffer(file);
			}else{
				reader.readAsDataURL(file);
			}
		}
	};
	
	EventBus.on(EVENT.iconUpdated,function(){
		previews.forEach(function(preview){
			preview.update();
		});
		if (fullPreview) fullPreview.update();
	});

	function rgbToHex(r, g, b) {
		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}
	
	
	return me;
}();