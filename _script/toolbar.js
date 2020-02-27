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
	
	var content = [
		{
			label: "File",
			items: [
				{label: "Load", action: "main.import"},
				{label: "Save", action: "main.save"}
			]
		},
		{
			label: "Colors",
			content : function(parent){
				colorIcon = $div("coloricon");
				backgroundIcon = $div("coloricon");

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
		container = $div("","toolbar");
		UI.mainContainer.appendChild(container);
		container.appendChild(UI.createGroup(content));
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
		var color = IconEditor.getBackgroundColor();
		backgroundIcon.style.backgroundColor = color;
	});
	
	return me;
}();