var UI = function(){
	var me = {};
	
	var currentDragItem;
	var currentDropTarget;
	var globalDragItem;
	var globalDragSource;
	var currentResizeItem;
	var dragpos1 = 0, dragpos2 = 0, dragpos3 = 0, dragpos4 = 0;
	var layout=[];

	me.init = function(){
		me.mainContainer = $div("maincontainer");
		document.body.appendChild(me.mainContainer);


		document.body.addEventListener("mousedown",function(){
			Main.isMouseDown = true;
			document.body.classList.add("mousedown");
		});

		document.body.addEventListener("mouseup",function(){
			currentDragItem = undefined;
			currentResizeItem = undefined;
			if (globalDragItem) me.handleDrop();
			Main.isMouseDown = false;
			document.body.classList.remove("mousedown");
		});

		document.body.addEventListener("mousemove",function(e){
			if (currentDragItem){
				e = e || window.event;
				e.preventDefault();
				// calculate the new cursor position:
				dragpos1 = dragpos3 - e.clientX;
				dragpos2 = dragpos4 - e.clientY;
				dragpos3 = e.clientX;
				dragpos4 = e.clientY;
				currentDragItem.style.top = (currentDragItem.offsetTop - dragpos2) + "px";
				currentDragItem.style.left = (currentDragItem.offsetLeft - dragpos1) + "px";

				if (globalDragItem) me.handleDrag(e);
			}

			if (currentResizeItem){
				e = e || window.event;
				e.preventDefault();
				dragpos1 = dragpos3 - e.clientX;
				dragpos2 = dragpos4 - e.clientY;
				currentResizeItem.style.height = (currentResizeItem.startHeight - dragpos2) + "px";
				currentResizeItem.style.width = (currentResizeItem.startWidth - dragpos1) + "px";
			}
		});

	};
	
	me.createPanel = function(title,content,id){
		var panel = $div("panel");
		if (id) panel.id = id;
		if (title){
			var label = $div("label","",title);
			panel.appendChild(label);
		}
		if (content){
			if (Array.isArray(content)){
				content.forEach(function(item){
					panel.appendChild(item);
				})
			}else{
				panel.appendChild(content);
			}
		}
		return panel;
	};

	me.createGroup = function(content,label,id,className,onClick){
		var container = $div("group",id);
		if (className) container.className += " " + className;
		if (onClick) container.onclick = onClick;

		var buttonContainer = container;
		if (label){
			container.appendChild($div("label","",label));
			buttonContainer = $div("buttons");
			container.appendChild(buttonContainer);
		}

		if (Array.isArray(content)){
			content.forEach(function(button){
				if (button.items) {
					var group = me.createGroup(button.items, button.label,button.id, button.className, button.onClick);
					buttonContainer.appendChild(group);
				}else if (button.content){
					group = me.createGroup([], button.label,button.id,button.className, button.onClick);
					button.content(group);
					buttonContainer.appendChild(group);
				}else{
					var b = $div("button","",button.label);
					b.onclick = function(){
						if (button.action){
							button.action.indexOf(".")>0?Main[button.action.split(".")[1]]():ImageProcessing[button.action]();
						}else{
							if (button.palette){
								if (button.palette === 1){
									button.palette = IconEditor.getCurrentIcon().state1.palette
								}
								IconEditor.reduceColours(button.palette);
							}else{
								IconEditor.reduceColours(button.colours);
							}
						}
					};
					buttonContainer.appendChild(b);
				}
			});
		}else{
			buttonContainer.appendChild(content);
		}



		return container;
	};
	
	me.setMouseOver= function(id){
		document.body.classList.add("hover" + id);
	};

	me.removeMouseOver= function(id){
		document.body.classList.remove("hover" + id);
	};
	
	me.enableDrag = function(item,handle,copy){
		if (handle){
			if (typeof handle === "string"){
				handle = item.querySelector(handle);
			}
			handle.onmousedown = startDrag;
		}else{
			item.onmousedown = startDrag;
		}

		function startDrag(e) {
			currentDragItem = item;

			if (copy){
				globalDragItem = document.getElementById("globalDragItem");
				if (globalDragItem) globalDragItem.remove();

				globalDragItem = cloneElement(item);
				globalDragItem.id = "globalDragItem";

				var pos = getElementPosition(item);
				globalDragItem.style.left = pos.left + "px";
				globalDragItem.style.top = pos.top + "px";
				globalDragItem.startX = pos.left;
				globalDragItem.startY = pos.top;

				document.body.appendChild(globalDragItem);
				currentDragItem = globalDragItem;
				globalDragSource = item;
				globalDragSource.classList.add("dragsource")
			}

			e = e || window.event;
			e.preventDefault();
			dragpos3 = e.clientX;
			dragpos4 = e.clientY;
		}

	};

	me.handleDrag = function(e){
		if (currentDropTarget && currentDropTarget.classList.contains("droptargetactive")){
			currentDropTarget.classList.remove("droptargetactive");
		}
		currentDropTarget = e.target;
		if (currentDropTarget.classList.contains("droptarget")){
			currentDropTarget.classList.add("droptargetactive");
		}

		var deltaX =  globalDragItem.offsetLeft - globalDragItem.startX;
		var deltaY =  globalDragItem.offsetTop - globalDragItem.startY;

		if (Math.abs(deltaX)>5 || Math.abs(deltaY)>5){
			globalDragItem.classList.add("visible");
			if (globalDragSource) globalDragSource.classList.add("dragging")
		}

	};

	me.handleDrop = function(){
		var deltaX =  globalDragItem.offsetLeft - globalDragItem.startX;
		var deltaY =  globalDragItem.offsetTop - globalDragItem.startY;

		if (currentDropTarget){
			currentDropTarget.classList.remove("droptargetactive");
			if (globalDragSource){

				if (currentDropTarget.contains(globalDragSource)){
					// moved in same parent
					globalDragSource.style.left = (globalDragSource.offsetLeft + deltaX) + "px";
					globalDragSource.style.top = (globalDragSource.offsetTop + deltaY) + "px";
				}else{
					// dragged to another parent
					if (currentDropTarget.ondrop) (currentDropTarget.ondrop(globalDragSource,globalDragItem));
				}
			}

		}


		if (globalDragSource){
			globalDragSource.classList.remove("dragsource");
			globalDragSource.classList.remove("dragging");
		}

		globalDragItem.remove();
		currentDropTarget = undefined;
		globalDragSource = undefined;



	};

	me.enableResize = function(item,handle){

		if (handle){
			if (typeof handle === "string"){
				handle = item.querySelector(handle);
			}
			handle.onmousedown = startResize;
		}else{
			item.onmousedown = startResize;
		}

		function startResize(e) {
			currentResizeItem = item;
			console.error(item);
			console.error(currentResizeItem.offsetHeight);
			currentResizeItem.startHeight = currentResizeItem.offsetHeight;
			currentResizeItem.startWidth = currentResizeItem.offsetWidth;
			e = e || window.event;
			e.preventDefault();
			dragpos3 = e.clientX;
			dragpos4 = e.clientY;
		}

	};

	me.addPanelToLayout = function(panel,config){
		if (me.mainContainer){
			me.mainContainer.appendChild(panel);
			config = config||{};
			layout.push({
				panel: panel,
				config: config,
				order: config.order || 0
			});
			me.updateLayout();
		}else{
			console.warn("Warning ... no container to add panel")
		}

	};


	me.updateLayout = function(){
		var leftMargin= AmiBase.isAmiBased ? 0 :4;
		var topMargin= AmiBase.isAmiBased ? 0 : 56;
		var rowHeight=570;
		var padding=0;

		var left = leftMargin;
		layout.sort(function(a,b){
			if (a.order>b.order) return 1;
			if (a.order<b.order) return -1;
			return 0;
		});

		layout.forEach((item)=>{
			var panel = item.panel;
			var config = item.config;
			//console.log(config.name,item.order);
			if (config.position === "left"){
				panel.style.top = topMargin + "px";
				panel.style.left = left + "px";
				panel.style.width = config.width + "px";
				panel.style.height = rowHeight + "px";
				left += config.width + padding;
			}
		})
	};


	
	
	return me;
}();