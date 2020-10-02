var Iconlist = function(){
	var me = {};
	
	var container;
	var scrollBox;
	var list;
	var icons = [];
	
	var iconWidth = 48;
	
	me.init = function(){
		container = UI.createPanel("Icons","","iconlist");
		
		scrollBox = $div("scrollbox");
		scrollBox.height = 550;
		
		container.appendChild(scrollBox);

		UI.addPanelToLayout(container,{
			name: "IconList",
			position: "left",
			resize: "vertical",
			width: 60,
			order: 2
		});
	};
	
	me.loadIcon = function(url,name,next){

		var index = icons.length;
		var icon = {};
		if (typeof url === "string"){
			icon.url = url;
		}
		
		if (name && name.indexOf(".info")>0){
			
			var file = BinaryStream(url.slice(0,url.byteLength),true);
			file.goto(0);
			icon.icon = Icon.parse(file,function(){
				// decoding of PNG icons is Async
				if (icon.icon.PNGIcon){
					parsed();
				}
			});

			var parsed = function(){
				icon.canvas = Icon.getImage(icon.icon);
				var icon2 = {
					canvas: Icon.getImage(icon.icon,1)
				};

				createItem(icon);
				createItem(icon2);

				if (next) next({
					inactive: icon,
					active: icon2
				});
			};

			if (icon.icon.PNGIcon){

			}else{
				parsed();
			}



			
			
		}else{
			var image = new Image();
			image.onload = function(){
				var iCanvas = document.createElement("canvas");
				iCanvas.width = image.width;
				iCanvas.height = image.height;
				var iCtx = iCanvas.getContext("2d");
				iCtx.drawImage(image,0,0);
				icon.canvas = iCanvas;
				createItem(icon);
				if (next) next(icon);
			};
			image.setAttribute('crossOrigin', '');
			image.src = url;
		}
	};
	
	function createItem(icon){
		if (!icon.canvas){
			console.warn("can't create icon - no canvas");
			return;
		}
		var item = $div("item");
		
		var aspectRatio = icon.canvas.width/icon.canvas.height;
		var h = 48;
		var w = h*aspectRatio;
		if (w>48){
			w=48;
			h=w/aspectRatio;
		}
		
		var canvas = $canvas(w,h);
		var ctx = canvas.getContext("2d");
		ctx.drawImage(icon.canvas,0,0,w,h);
		item.appendChild(canvas);
		
		item.onclick = function(){
			IconEditor.editIcon(icon.canvas);
		};
		
		scrollBox.appendChild(item);
		icons.push(icon);
		
	}
	
	
	return me;
}();