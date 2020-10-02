var IconEditor = function(){
	var me = {};
	
	var container;
	var canvas;
	var ctx;
	var currentIcon = {
		state1:{},
		state2:{}
	};
	var iconEditorPanel;
	
	var overlayCanvas;
	var overlayCtx;

	var inactiveCanvas, activeCanvas;
	
	var infoPanel,infoText;
	var paletteCanvas, paletteCtx;
	var isDrawing;
	var isRight;
	var cursor;
	var cursorMark;
	var drawColor = "black"; 
	var backgroundColor = [192,192,192];
	
	var iconWidth = 48;
	var iconHeight = 48;
	var zoomFactor = 10;

	var paletteWidth = 378;
	var paletteHeight = 46;
	
	var activeState = 1;


	var toolbar = [
		{label: "Inactive", id: "inactiveicon", className: "selected",
			onClick: function(){
			 me.setState(false);
			},
		content: function(parent){
			inactiveCanvas = $canvas(iconWidth,iconHeight);
			parent.appendChild(inactiveCanvas);
		}},
		{label: "Active",  id: "activeicon",
			onClick: function(){
				me.setState(true);
			},
			content: function(parent){
				activeCanvas = $canvas(iconWidth,iconHeight);
				parent.appendChild(activeCanvas);
			}},
		{label: "Palette", id: "palette",
			content: function(parent){
				infoText = $div("info");
				paletteCanvas = $canvas(paletteWidth,paletteHeight);
				paletteCtx = paletteCanvas.getContext("2d");
				parent.appendChild(infoText);
				parent.appendChild(paletteCanvas);
			}}
	];
	
	
	me.init = function(){

		infoPanel = $div("infopanel");
		infoPanel.appendChild(UI.createGroup(toolbar));
		
		container = $div("","iconeditorcanvas");
		canvas = document.createElement("canvas");
		overlayCanvas = document.createElement("canvas");
		overlayCanvas.id = "overlay";
		
		canvas.width = iconWidth;
		canvas.height = iconHeight;
		
		overlayCanvas.width = iconWidth;
		overlayCanvas.height = iconHeight;
		
		ctx = canvas.getContext("2d");
		overlayCtx = overlayCanvas.getContext("2d");
		container.appendChild(overlayCanvas);
		container.appendChild(canvas);
		
		cursorMark = $div("mark");
		cursor = $div("cursor","",cursorMark);
		document.body.appendChild(cursor);


		iconEditorPanel = UI.createPanel("Icon Editor",[infoPanel,container],'iconeditor');
		UI.addPanelToLayout(iconEditorPanel,{
			name: "IconEditor",
			position: "left",
			resize: "vertical",
			width: 480,
			order: 3
		});
		
		overlayCanvas.onmousedown = function(e){

			isRight = false;
			if ("which" in e)
				isRight = e.which === 3;
			else if ("button" in e)
				isRight = e.button === 2;


			if (e.metaKey) isRight=true;

			var point = getCursorPosition(canvas,e);
			var x = Math.floor(point.x/zoomFactor);
			var y = Math.floor(point.y/zoomFactor);
			
			if (isRight){
				ctx.clearRect(x,y,1,1);
				isDrawing = true;
			}else if (Main.isShift){
				var pixel = ctx.getImageData(x, y, 1, 1).data;
				drawColor = "rgb(" + pixel[0] +"," + pixel[1] +"," + pixel[2] +")";
				cursorMark.style.borderColor = drawColor;
				console.log("set drawcolor to " + drawColor);
				EventBus.trigger(EVENT.drawColorChanged);
			}else{
				isDrawing = true;
				ctx.fillStyle = drawColor;
				ctx.fillRect(x,y,1,1);
			}
			me.updateIcon();
		};

		overlayCanvas.onmousemove = function(e){
			var point = getCursorPosition(canvas,e);
			var x = Math.floor(point.x/zoomFactor);
			var y = Math.floor(point.y/zoomFactor);
			
			overlayCtx.clearRect(0,0, canvas.width, canvas.height);
			overlayCtx.fillStyle = drawColor;
			overlayCtx.fillRect(x,y,1,1);
			
			if (isDrawing){
				if (isRight){
					ctx.clearRect(x,y,1,1);
				}else{
					ctx.fillStyle = drawColor;
					ctx.fillRect(x,y,1,1);
				}
				me.updateIcon();
			}else{
				const rect = container.getBoundingClientRect();
				point.x += rect.left;
				point.y += rect.top;

				if (Main.isShift && Main.isMouseDown){
					var pixel = ctx.getImageData(x, y, 1, 1).data;
					drawColor = "rgb(" + pixel[0] +"," + pixel[1] +"," + pixel[2] +")";
					cursorMark.style.borderColor = drawColor;
					console.log("set drawcolor to " + drawColor);
					EventBus.trigger(EVENT.drawColorChanged);
				}
				
				cursor.style.top = point.y + "px";
				cursor.style.left = point.x + "px";

				
			}
		};

		overlayCanvas.onmouseup = function(e){
			isDrawing = false;
		};
		
		overlayCanvas.onmouseenter = function(){
			UI.setMouseOver("iconEditorCanvas");
		};

		overlayCanvas.onmouseleave = function(){
			UI.removeMouseOver("iconEditorCanvas");	
		};
		
		overlayCanvas.oncontextmenu = function(){return false};
		paletteCanvas.oncontextmenu  = function(){return false};

		paletteCanvas.onmousedown = function(e){
			isRight = false;
			if ("which" in e)
				isRight = e.which === 3;
			else if ("button" in e)
				isRight = e.button === 2;
			
			if (e.metaKey) isRight=true;
			
			var point = getCursorPosition(paletteCanvas,e);
			var pixel = paletteCtx.getImageData(point.x, point.y, 1, 1).data;
			if (isRight){
				backgroundColor = [pixel[0],pixel[1],pixel[2]];
				console.log("set backGroundcolor to " + backgroundColor);
				EventBus.trigger(EVENT.backgroundColorChanged);
			}else{
				drawColor = "rgb(" + pixel[0] +"," + pixel[1] +"," + pixel[2] +")";
				console.log("set drawcolor to " + drawColor);
				EventBus.trigger(EVENT.drawColorChanged);
			}
			
		};
	};
	
	me.setState = function(active){
		var state1 = document.getElementById("inactiveicon");
		var state2 = document.getElementById("activeicon");
		if (active){
			state1.classList.remove("selected");
			state2.classList.add("selected");
			activeState = 2;
		}else{
			state1.classList.add("selected");
			state2.classList.remove("selected");
			activeState = 1;
		}
		me.drawIcon();
	};

	me.toggleState = function(){
		me.setState(activeState===1);
	};

	me.editIcon = function(_canvas){
		var state = currentIcon["state" + activeState];
		state.originalCanvas = _canvas;

		iconWidth = _canvas.width;
		iconHeight = _canvas.height;
		canvas.width = iconWidth;
		canvas.height = iconHeight;
		overlayCanvas.width = iconWidth;
		overlayCanvas.height = iconHeight;

		zoomFactor = 480/iconWidth;

		state.processedCanvas = $canvas(iconWidth,iconHeight);
		state.processedCanvas.getContext("2d").drawImage(_canvas,0,0);

		me.drawIcon();

	};

	me.editIconDualState = function(canvas1,canvas2){
		activeState = 1;
		currentIcon = {
			state1:{},
			state2:{}
		};
		me.editIcon(canvas1);
		me.setState(true);
		me.editIcon(canvas2);
		me.setState(false);
	};

	// update Icon Canvas with edit Canvas;
	me.updateIcon = function(updatePalette){
		var state = currentIcon["state" + activeState];
		var stateCtx = state.processedCanvas.getContext("2d");
		stateCtx.clearRect(0,0,iconWidth,iconHeight);
		stateCtx.drawImage(canvas,0,0);

		if (updatePalette){
			var colorInfo = ImageProcessing.getColors(canvas);
			me.setPalette(colorInfo);
		}

		EventBus.trigger(EVENT.iconUpdated);
	};

	// update edit Canvas from Icon
	me.drawIcon = function(){
		var state = currentIcon["state" + activeState];
		ctx.clearRect(0,0,canvas.width,canvas.height);
		if (state.processedCanvas){
			ctx.drawImage(state.processedCanvas,0,0);
		}
		var colorInfo = ImageProcessing.getColors(canvas);
		me.setPalette(colorInfo);

		EventBus.trigger(EVENT.iconUpdated);
		
	};
	
	me.getCurrentIcon = function(stateIndex){
		return currentIcon;

	};

	me.getCurrentIconState = function(stateIndex){
		var state = currentIcon["state" + activeState];
		if (stateIndex){
			state = currentIcon["state" + stateIndex];
		}
		return state;

	};
	
	me.getDrawColor = function(){
		return drawColor;
	};

	me.getBackgroundColor = function(asString){
		return asString ? ("rgb(" + backgroundColor.join(",") + ")"):backgroundColor;
	};
	
	me.setPalette = function(colors){
		var state = currentIcon["state" + activeState];
		state.palette = colors;

		infoText.innerHTML = colors.length + " colours";

		var rows = 1;
		if (colors.length>8) rows = 2;
		if (colors.length>16) rows = 4;
		if (colors.length>64) rows = 6;

		var cols = Math.ceil(colors.length/rows);
		var w = paletteWidth/cols;
		var h = paletteHeight/rows;

		paletteCtx.clearRect(0,0,paletteCanvas.width, paletteCanvas.height);
		colors.forEach(function(c,index){

			if (!Array.isArray(c)){
				paletteCtx.fillStyle = "rgb(" + c.Red + "," + c.Green + "," + c.Blue + ")";
			}else{
				paletteCtx.fillStyle = "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
			}

			var row = Math.floor(index/cols);
			var col = index%cols;
			var x = col * w;
			var y = row * h;
			paletteCtx.fillRect(x,y,w,h);
		});
	};

	me.getPalette = function(){
		var state = currentIcon["state" + activeState];
		var colors = state.palette;
		return colors;
	};
	
	me.reduceColours = function(palette){
		var state = currentIcon["state" + activeState];
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.drawImage(state.originalCanvas,0,0);

		if (palette){
			console.warn(palette);
			ImageProcessing.reduce(canvas,palette);
		}else{
			IconEditor.updateIcon();
		}
		
	};
	
	
	EventBus.on(EVENT.iconUpdated,function(){
		var state = currentIcon["state" + activeState];
		var stateCanvas = activeState === 1 ? inactiveCanvas : activeCanvas;
		var stateCtx = stateCanvas.getContext("2d");
		stateCtx.clearRect(0,0,stateCanvas.width,stateCanvas.height);
		
		var drawCanvas = state.processedCanvas || state.originalCanvas;
		if (drawCanvas){
			var aspectRatio = drawCanvas.width/drawCanvas.height;
			var h = 48;
			var w = h*aspectRatio;
			if (w>48){
				w=48;
				h=w/aspectRatio;
			}

			stateCtx.drawImage(drawCanvas,0,0,w,h);
		}
	});
	
	EventBus.on(EVENT.backgroundColorChanged,function(){
		iconEditorPanel.style.backgroundColor = me.getBackgroundColor(true);
	});
	
	
		
		
	return me;
}();