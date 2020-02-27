var PreviewWindow = function(backgroundColor){
	var me = {};
	
	var container;
	var canvas, ctx;
	var frame;
	var plus, minus;
	
	var canvasWidth = 300;
	var canvasHeight= 170;
	
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
		console.error("init preview");
		
		var img = new Image();
		img.className = "frame";
		img.src = "_img/frame.png";
		
		
		container = $div("panel");
		
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
		
		var parent = document.getElementById("previews");
		if (!parent){
			parent=UI.createPanel("Previews","","previews");
			UI.mainContainer.appendChild(parent);
		}
		
		container.appendChild(canvas);
		container.appendChild(img);
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
			for (var i = 0; i<8 ; i++){
				var x = 32 + (i%4)*(64);
				var y = 32 + Math.floor(i/4) * (64);
				
				ctx.drawImage(icon.processedCanvas,x,y);
			}
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