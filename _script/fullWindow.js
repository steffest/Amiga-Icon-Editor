var FullWindow = function(backgroundColor){
	var me = {};
	
	var container;
	var canvas, ctx;
	var frame;
	var plus, minus;
	
	var canvasWidth = 500;
	var canvasHeight= 400;
	
	backgroundColor = backgroundColor || "rgb(192,192,192)";
	
	var backGroundColors = [
		"rgb(240,240,240)",
		"rgb(192,192,192)",
		"rgb(89,131,177)",
		"rgb(92,171,138)",
		"rgb(157,83,83)",
		"rgb(141,127,106)",
		"rgb(40,40,40)",
	];
	
	var zoom = [1,1.5,2,3,4];
	var zoomIndex = 0;
	
	me.init = function(){

		container = $div("panelfull");
		
		canvas = document.createElement("canvas");
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		ctx = canvas.getContext("2d");


		plus = $div("button plus","","+");
		plus.onclick = function () {
			zoomIndex++;
			setZoom();
		};

		minus = $div("button minus","","-");
		minus.onclick = function () {
			zoomIndex--;
			setZoom();
		};
		
		var parent = document.getElementById("fullpreview");
		if (!parent){
			parent=UI.createPanel("fullpreview","","fullpreview");
			UI.mainContainer.appendChild(parent);
		}
		
		container.appendChild(canvas);
		container.appendChild(plus);
		container.appendChild(minus);
		
		backGroundColors.forEach(function(color,index){
			var btn = $div("button");
			btn.style.left = 147+ (index*15);
			btn.style.backgroundColor = color;
			btn.onclick = function(){
				setBackgroundColor(color);
			};
			container.appendChild(btn);
		});
		
		parent.appendChild(container);
	};
	
	me.update = function(){
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0,0,canvas.width, canvas.height);
		
		var icon = IconEditor.getCurrentIconState();
		
		if (icon && icon.processedCanvas){
			ctx.drawImage(icon.processedCanvas,0,0);
		}
	};
	
	function setZoom(){
		var zoomFactor = zoom[zoomIndex];
		canvas.style.width = (canvasWidth*zoomFactor) + "px";
		canvas.style.height= (canvasHeight*zoomFactor) + "px";
		canvas.className = "zoom" + (zoomFactor*100)
	}

	function setBackgroundColor(color){
		backgroundColor = color;
		me.update();
	}
	
	me.init();
	
	return me;
};