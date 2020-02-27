function $div(className,id,content){
	var d = document.createElement("div");
	if (className) d.className = className;
	if (id) d.id = id;
	if (content) {
		if (typeof content === "string"){
			d.innerHTML = content;
		}else{
			d.appendChild(content);
		}
		
	}
	return d;
}

function $canvas(width, height, id){
	var canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	if (id) canvas.id = id;
	return canvas;
}


function getCursorPosition(elm, event) {
	const rect = elm.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	return{x:x,y:y};
}

function getElementPosition(el) {
	var rect = el.getBoundingClientRect(),
		scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
		scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

// clones an element including any canvas content
function cloneElement(elm){
	var clone = elm.cloneNode(true);

	var canvas = elm.querySelectorAll("canvas");
	var canvasClone = clone.querySelectorAll("canvas");
	for (var i = 0, max = canvas.length; i<max; i++){
		canvasClone[i].getContext("2d").drawImage(canvas[i],0,0);
	}
	return clone;
}
