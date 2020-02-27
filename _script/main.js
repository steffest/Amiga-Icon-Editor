var Main = function(){
	var me = {};
	
	var previews = [];
	
	me.init = function(){
		UI.init();
		Toolbar.init();
		Iconlist.init();
		IconEditor.init();
		IconSet.init();

		previews.push(PreviewWindow("silver"));
		previews.push(PreviewWindow("rgb(89,131,177)"));
		previews.push(PreviewWindow("rgb(40,40,40)"));
		
		document.onkeydown = function(e){
			console.error(e.keyCode);
			if (e.keyCode === 16){
				console.log("shift");
				me.isShift = true;
				document.body.classList.add("shift");
			}
			if ((e.keyCode === 91) || (e.keyCode === 93)){
				me.isMeta = true;
				document.body.classList.add("meta");
			}
		};

		document.onkeyup = function(){
			me.isShift = false;
			me.isMeta = false;
			document.body.classList.remove("shift");
			document.body.classList.remove("meta");
		};
		
		me.load();
	};
	
	me.load = function(){
		FetchService.json("data/set.json",function(data){
				console.error(data);
				
				data.forEach(function(item){
					Iconlist.loadIcon(item.url);
				})
		});
	};
	
	me.import = function(){
		var input = document.createElement('input');
		input.type = 'file';
		input.onchange = function(e){
			me.handleUpload(e.target.files);
		};
		input.click();
	};
	
	me.save = function(){
		var iconData = IconEditor.getCurrentIcon();
		var canvas = iconData.processedCanvas;
		var palette = [];
		var pixels = [];
		var ctx = canvas.getContext("2d");

		var w = canvas.width;
		var h = canvas.height;
		
		var data = ctx.getImageData(0, 0, w, h).data;
		
		var r,g,b,alpha;
		var colorLookup = {};

		function matchColor(r,g,b){
			for (var i=1,max=palette.length;i<max;i++){
				var color = palette[i];
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
					if (typeof colorIndex === "undefined"){
						colorIndex = matchColor(r,g,b);
						if (colorIndex<0){
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
		
		var icon = Icon.create(w,h);

		icon.colorIcon.MaxPaletteSize = palette.length;
		var state = icon.colorIcon.states[0];
		state.NumColors = palette.length;
		state.paletteSize = state.NumColors * 3;
		state.palette = palette.slice();
		state.pixels = pixels.slice();
		var buffer = Icon.write(icon);

		var blob = new Blob([buffer], {type: "application/octet-stream"});
		var fileName = 'icon.info';

		saveAs(blob,fileName);
		
	};
	
	me.savePng = function(){
		var icon = IconEditor.getCurrentIcon(1);
		var icon2 = IconEditor.getCurrentIcon(2);
		var canvas = icon.icon.canvas;
		var canvas2 = icon2.icon.canvas;
		canvas.toBlob(function(blob1) {
			canvas2.toBlob(function(blob2) {
				var blob = new Blob([blob1,blob2], {type: "application/octet-stream"});
				saveAs(blob,"test.info");
			});
		});
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
		})
	});

	function rgbToHex(r, g, b) {
		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}
	
	
	return me;
}();