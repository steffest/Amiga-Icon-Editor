var ImageProcessing = function(){
	var me = {};

	var ImageInfos = {};
	
	var dithering = [
			{ Name: "none", label: "None", pattern: null},
			{ Name: "checks1", label: "Checks (very low)", pattern : [ 1 * 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] },
			{ Name: "checks2", label: "Checks (low)", pattern :  [ 2 * 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] },
			{ Name: "checks3", label: "Checks (medium)", pattern: [ 4 * 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] },
			{ Name: "checks4", label: "Checks (high)", pattern : [ 8 * 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] },
			{ Name: "checks5", label: "Checks (very high)", pattern: [ 16 * 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] },
			{ Name: "checks6", label: "Checks (very high 2)", pattern: [ 32 * 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] },
			{ Name: "fs", label: "Floyd-Steinberg", pattern: [ 0, 0, 0, 7.0 / 16.0, 0, 0, 3.0 / 16.0, 5.0 / 16.0, 1.0 / 16.0, 0, 0, 0, 0, 0, 0 ] },
			{ Name: "fs85", label: "Floyd-Steinberg (85%)", pattern: [ 0, 0, 0, 7.0 * 0.85 / 16.0, 0, 0, 3.0 * 0.85 / 16.0, 5.0 * 0.85 / 16.0, 1.0 * 0.85 / 16.0, 0, 0, 0, 0, 0, 0 ] },
			{ Name: "fs75", label: "Floyd-Steinberg (75%)", pattern: [ 0, 0, 0, 7.0 * 0.75 / 16.0, 0, 0, 3.0 * 0.75 / 16.0, 5.0 * 0.75 / 16.0, 1.0 * 0.75 / 16.0, 0, 0, 0, 0, 0, 0 ] },
			{ Name: "fs50", label: "Floyd-Steinberg (50%)", pattern: [ 0, 0, 0, 7.0 * 0.5 / 16.0, 0, 0, 3.0 * 0.5 / 16.0, 5.0 * 0.5 / 16.0, 1.0 * 0.5 / 16.0, 0, 0, 0, 0, 0, 0 ] },
			{ Name: "ffs", label: "False Floyd-Steinberg", pattern:  [ 0, 0, 0, 3.0 / 8.0, 0, 0, 0, 3.0 / 8.0, 2.0 / 8.0, 0, 0, 0, 0, 0, 0 ]},
			{ Name: "jjn", label: "Jarvis, Judice, and Ninke", pattern: [ 0, 0, 0, 7.0 / 48.0, 5.0 / 48.0, 3.0 / 48.0, 5.0 / 48.0, 7.0 / 48.0, 5.0 / 48.0, 3.0 / 48.0, 1.0 / 48.0, 3.0 / 48.0, 5.0 / 48.0, 3.0 / 48.0, 1.0 / 48.0 ] },
			{ Name: "s", label: "Stucki", pattern: [ 0, 0, 0, 8.0 / 42.0, 4.0 / 42.0, 2.0 / 42.0, 4.0 / 42.0, 8.0 / 42.0, 4.0 / 42.0, 2.0 / 42.0, 1.0 / 42.0, 2.0 / 42.0, 4.0 / 42.0, 2.0 / 42.0, 1.0 / 42.0 ] },
			{ Name: "a", label: "Atkinson", pattern: [ 0, 0, 0, 1.0 / 8.0, 1.0 / 8.0, 0, 1.0 / 8.0, 1.0 / 8.0, 1.0 / 8.0, 0, 0, 0, 1.0 / 8.0, 0, 0 ] },
			{ Name: "b", label: "Burkes", pattern: [ 0, 0, 0, 8.0 / 32.0, 4.0 / 32.0, 2.0 / 32.0, 4.0 / 32.0, 8.0 / 32.0, 4.0 / 32.0, 2.0 / 32.0, 0, 0, 0, 0, 0 ] },
			{ Name: "s", label: "Sierra", pattern: [ 0, 0, 0, 5.0 / 32.0, 3.0 / 32.0, 2.0 / 32.0, 4.0 / 32.0, 5.0 / 32.0, 4.0 / 32.0, 2.0 / 32.0, 0, 2.0 / 32.0, 3.0 / 32.0, 2.0 / 32.0, 0 ] },
			{ Name: "trs", label: "Two-Row Sierra", pattern: [ 0, 0, 0, 4.0 / 16.0, 3.0 / 16.0, 1.0 / 16.0, 2.0 / 16.0, 3.0 / 16.0, 2.0 / 16.0, 1.0 / 16.0, 0, 0, 0, 0, 0 ] },
			{ Name: "sl", label: "Sierra Lite", pattern: [ 0, 0, 0, 2.0 / 4.0, 0, 0, 1.0 / 4.0, 1.0 / 4.0, 0, 0, 0, 0, 0, 0, 0 ] } 
		];
	var DitherPattern = null;
	var alphaThreshold = 44;
	var mattingColor = "rgb(149,149,149)";
	mattingColor = "rgb(192,192,192)";
	
	me.getDithering = function(){
		return dithering;
	};
	
	me.setDithering = function(index){
		DitherPattern = dithering[index].pattern;
		
		if (ImageInfos && ImageInfos.colorCount){
			IconEditor.reduceColours(ImageInfos.colorCount);
		}
	};
	
	me.setAlphaThreshold = function(threshold){
		alphaThreshold = threshold;

		if (ImageInfos && ImageInfos.colorCount){
			IconEditor.reduceColours(ImageInfos.colorCount);
		}else{
			IconEditor.showIcon();
			me.matting();
		}
	};
	
	me.matting = function(){
		if (ImageInfos.canvas){
			var opaqueCanvas = document.createElement("canvas");
			opaqueCanvas.width = ImageInfos.canvas.width;
			opaqueCanvas.height = ImageInfos.canvas.height;
			var opaqueCtx = opaqueCanvas.getContext("2d");
			opaqueCtx.fillStyle = mattingColor;
			opaqueCtx.fillRect(0,0,opaqueCanvas.width,opaqueCanvas.height);
			opaqueCtx.drawImage(ImageInfos.canvas,0,0);
			
			var ctx = ImageInfos.canvas.getContext("2d");
			
			var data = ctx.getImageData(0, 0, ImageInfos.canvas.width, ImageInfos.canvas.height);
			var opaqueData = opaqueCtx.getImageData(0, 0, ImageInfos.canvas.width, ImageInfos.canvas.height);

			for(var y = 0; y < ImageInfos.canvas.height; y++){
				for(var x = 0; x < ImageInfos.canvas.width; x++){
					var index = (x + y * ImageInfos.canvas.width) * 4;

					var red = opaqueData.data[index];
					var green = opaqueData.data[index + 1];
					var blue = opaqueData.data[index + 2];
					
					var alpha = data.data[index + 3];

					if(alpha < 255){
						if (alpha>=alphaThreshold){
							ctx.fillStyle = "rgb("+ red +"," + green + "," + blue + ")";
							ctx.fillRect(x,y,1,1);
						}else{
							ctx.clearRect(x,y,1,1);
						}
					}
				}
			}

			EventBus.trigger(EVENT.iconUpdated);
			
		}
	};
	
	me.getColors = function(canvas) {

		ImageInfos.canvas = canvas;
		
		var ctx = canvas.getContext("2d");
		var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
		var ColorCube = new Uint32Array(256 * 256 * 256);
		var Colors = [];

		for(var Y = 0; Y < canvas.height; Y++)
		{
			for(var X = 0; X < canvas.width; X++)
			{
				var PixelIndex = (X + Y * canvas.width) * 4;

				var red = data[PixelIndex];
				var green = data[PixelIndex + 1];
				var blue = data[PixelIndex + 2];
				var alpha = data[PixelIndex + 3];

				if(alpha >= alphaThreshold)
				{
					if(ColorCube[red * 256 * 256 + green * 256 + blue] == 0)
						Colors.push({ Red: red, Green: green, Blue: blue });

					ColorCube[red * 256 * 256 + green * 256 + blue]++;
				}
			}
		}

		Colors.sort(function (Color1, Color2) { return (SrgbToRgb(Color1.Red) * 0.21 + SrgbToRgb(Color1.Green) * 0.72 + SrgbToRgb(Color1.Blue) * 0.07) - (SrgbToRgb(Color2.Red) * 0.21 + SrgbToRgb(Color2.Green) * 0.72 + SrgbToRgb(Color2.Blue) * 0.07) });
		
		return Colors;
	};
	
	me.reduce = function(canvas,colors){
		
		var bitsPerColor = 8;
		
		var mode = "Palette";
		if (!isNaN(colors)){
			mode = colors;
		}else{
			ImageInfos.palette = colors;
		}
		
		ImageInfos.canvas = canvas;
		ImageInfos.colorCount = colors;
		
		me.matting();
		
		ProcessImage(mode, bitsPerColor, DitherPattern, "id");
	};

	function RgbToSrgb(ColorChannel) {
		return Math.pow(ColorChannel / 255, 1 / 2.2) * 255;
	}

	function SrgbToRgb(ColorChannel) {
		return Math.pow(ColorChannel / 255, 2.2) * 255;
	}

	function ColorDistance(RedDelta, GreenDelta, BlueDelta, LuminanceDelta) {
		return RedDelta * RedDelta + GreenDelta * GreenDelta + BlueDelta * BlueDelta + LuminanceDelta * LuminanceDelta * 6;
	}
	
	function RemapImage(canvas, Colors, ditherPattern)
	{
		var Context = canvas.getContext("2d");
		var Data = Context.getImageData(0, 0, canvas.width, canvas.height);

		var MixedColors = [];

		for(var Index = 0; Index < Colors.length; Index++)
			MixedColors.push({ Red: Colors[Index].Red, Green: Colors[Index].Green, Blue: Colors[Index].Blue, TrueRed: SrgbToRgb(Colors[Index].Red), TrueGreen: SrgbToRgb(Colors[Index].Green), TrueBlue: SrgbToRgb(Colors[Index].Blue) });

		if(ditherPattern && ditherPattern[0] > 0 && Colors.length <= 64)
		{
			for(var Index1 = 0; Index1 < Colors.length; Index1++)
			{
				for(var Index2 = Index1 + 1; Index2 < Colors.length; Index2++)
				{
					var Luminance1 = SrgbToRgb(Colors[Index1].Red) * 0.21 + SrgbToRgb(Colors[Index1].Green) * 0.72 + SrgbToRgb(Colors[Index1].Blue) * 0.07;
					var Luminance2 = SrgbToRgb(Colors[Index2].Red) * 0.21 + SrgbToRgb(Colors[Index2].Green) * 0.72 + SrgbToRgb(Colors[Index2].Blue) * 0.07;
					var LuminanceDeltaSquare = (Luminance1 - Luminance2) * (Luminance1 - Luminance2);

					if(LuminanceDeltaSquare < ditherPattern[0] * ditherPattern[0])
					{
						var Red = RgbToSrgb((SrgbToRgb(Colors[Index1].Red) + SrgbToRgb(Colors[Index2].Red)) / 2.0);
						var Green = RgbToSrgb((SrgbToRgb(Colors[Index1].Green) + SrgbToRgb(Colors[Index2].Green)) / 2.0);
						var Blue = RgbToSrgb((SrgbToRgb(Colors[Index1].Blue) + SrgbToRgb(Colors[Index2].Blue)) / 2.0);

						MixedColors.push({ Index1: Index1, Index2: Index2, Red: Red, Green: Green, Blue: Blue, TrueRed: SrgbToRgb(Red), TrueGreen: SrgbToRgb(Green), TrueBlue: SrgbToRgb(Blue) });
					}
				}
			}
		}

		Colors = MixedColors;

		for(var Y = 0; Y < canvas.height; Y++) {
			for(var X = 0; X < canvas.width; X++)
			{
				var pixelIndex = (X + Y * canvas.width) * 4;
				var SrgbIndex = X + Y * canvas.width;

				var Red = Data.data[pixelIndex];
				var Green = Data.data[pixelIndex + 1];
				var Blue = Data.data[pixelIndex + 2];
				var alpha = Data.data[pixelIndex + 3];

				var TrueRed = SrgbToRgb(Red);
				var TrueGreen = SrgbToRgb(Green);
				var TrueBlue = SrgbToRgb(Blue);

				var Luminance = TrueRed * 0.21 + TrueGreen * 0.72 + TrueBlue * 0.07;
				
				if(alpha >= alphaThreshold) {
					// Find the matching color index.

					var LastDistance = Number.MAX_VALUE;
					var RemappedColorIndex = 0;

					for(var ColorIndex = 0; ColorIndex < Colors.length; ColorIndex++){
						var RedDelta = Colors[ColorIndex].TrueRed - TrueRed;
						var GreenDelta = Colors[ColorIndex].TrueGreen - TrueGreen;
						var BlueDelta = Colors[ColorIndex].TrueBlue - TrueBlue;
						var LuminanceDelta = Colors[ColorIndex].TrueRed * 0.21 + Colors[ColorIndex].TrueGreen * 0.72 + Colors[ColorIndex].TrueBlue * 0.07 - Luminance;

						var Distance = 0;

						if(Colors[ColorIndex].Index1 !== undefined)
						{
							var RedDelta1 = Colors[Colors[ColorIndex].Index1].TrueRed - TrueRed;
							var GreenDelta1 = Colors[Colors[ColorIndex].Index1].TrueGreen - TrueGreen;
							var BlueDelta1 = Colors[Colors[ColorIndex].Index1].TrueBlue - TrueBlue;

							var LuminanceDelta1 = Colors[Colors[ColorIndex].Index1].TrueRed * 0.21 + Colors[Colors[ColorIndex].Index1].TrueGreen * 0.72 + Colors[Colors[ColorIndex].Index1].TrueBlue * 0.07 - Luminance;

							var RedDelta2 = Colors[Colors[ColorIndex].Index2].TrueRed - TrueRed;
							var GreenDelta2 = Colors[Colors[ColorIndex].Index2].TrueGreen - TrueGreen;
							var BlueDelta2 = Colors[Colors[ColorIndex].Index2].TrueBlue - TrueBlue;

							var LuminanceDelta2 = Colors[Colors[ColorIndex].Index2].TrueRed * 0.21 + Colors[Colors[ColorIndex].Index2].TrueGreen * 0.72 + Colors[Colors[ColorIndex].Index2].TrueBlue * 0.07 - Luminance;

							Distance = ColorDistance(RedDelta, GreenDelta, BlueDelta, LuminanceDelta) * 4;
							Distance += ColorDistance(RedDelta1, GreenDelta1, BlueDelta1, LuminanceDelta1);
							Distance += ColorDistance(RedDelta2, GreenDelta2, BlueDelta2, LuminanceDelta2);

							Distance /= 4 + 1 + 1;
						}
						else
						{
							Distance = ColorDistance(RedDelta, GreenDelta, BlueDelta, LuminanceDelta);
						}


						if(Distance < LastDistance)
						{
							RemappedColorIndex = ColorIndex;
							LastDistance = Distance;
						}


					}

					if(ditherPattern) {
						if(ditherPattern[0] > 0) { // Checker pattern.
 							if(Colors[RemappedColorIndex].Index1 !== undefined)
							{
								if((X ^ Y) & 1)
									RemappedColorIndex = Colors[RemappedColorIndex].Index1;
								else
									RemappedColorIndex = Colors[RemappedColorIndex].Index2;
							}

							Data.data[pixelIndex] = Colors[RemappedColorIndex].Red;
							Data.data[pixelIndex + 1] = Colors[RemappedColorIndex].Green;
							Data.data[pixelIndex + 2] = Colors[RemappedColorIndex].Blue;
							Data.data[pixelIndex + 3] = alpha;
						}
						else { // Error diffusion.
							var RedDelta = Colors[RemappedColorIndex].Red - Red;
							var GreenDelta = Colors[RemappedColorIndex].Green - Green;
							var BlueDelta = Colors[RemappedColorIndex].Blue - Blue;

							if(X < canvas.width - 2)
							{
								if(ditherPattern[4])
								{
									Data.data[pixelIndex + 8] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + 8] - RedDelta * ditherPattern[4])));
									Data.data[pixelIndex + 8 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + 8 + 1] - GreenDelta * ditherPattern[4])));
									Data.data[pixelIndex + 8 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + 8 + 2] - BlueDelta * ditherPattern[4])));
								}

								if(Y < canvas.height - 1 && ditherPattern[9])
								{
									Data.data[pixelIndex + canvas.width * 4 + 8] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 + 8] - RedDelta * ditherPattern[9])));
									Data.data[pixelIndex + canvas.width * 4 + 8 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 + 8 + 1] - GreenDelta * ditherPattern[9])));
									Data.data[pixelIndex + canvas.width * 4 + 8 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 + 8 + 2] - BlueDelta * ditherPattern[9])));
								}

								if(Y < canvas.height - 2 && ditherPattern[14])
								{
									Data.data[pixelIndex + canvas.width * 2 * 4 + 8] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 + 8] - RedDelta * ditherPattern[14])));
									Data.data[pixelIndex + canvas.width * 2 * 4 + 8 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 + 8 + 1] - GreenDelta * ditherPattern[14])));
									Data.data[pixelIndex + canvas.width * 2 * 4 + 8 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 + 8 + 2] - BlueDelta * ditherPattern[14])));
								}
							}

							if(X < canvas.width - 1)
							{
								if(ditherPattern[3])
								{
									Data.data[pixelIndex + 4] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + 4] - RedDelta * ditherPattern[3])));
									Data.data[pixelIndex + 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + 4 + 1] - GreenDelta * ditherPattern[3])));
									Data.data[pixelIndex + 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + 4 + 2] - BlueDelta * ditherPattern[3])));
								}

								if(Y < canvas.height - 1 && ditherPattern[8])
								{
									Data.data[pixelIndex + canvas.width * 4 + 4] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 + 4] - RedDelta * ditherPattern[8])));
									Data.data[pixelIndex + canvas.width * 4 + 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 + 4 + 1] - GreenDelta * ditherPattern[8])));
									Data.data[pixelIndex + canvas.width * 4 + 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 + 4 + 2] - BlueDelta * ditherPattern[8])));
								}

								if(Y < canvas.height - 2 && ditherPattern[13])
								{
									Data.data[pixelIndex + canvas.width * 2 * 4 + 4] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 + 4] - RedDelta * ditherPattern[13])));
									Data.data[pixelIndex + canvas.width * 2 * 4 + 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 + 4 + 1] - GreenDelta * ditherPattern[13])));
									Data.data[pixelIndex + canvas.width * 2 * 4 + 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 + 4 + 2] - BlueDelta * ditherPattern[13])));
								}
							}

							if(Y < canvas.height - 1 && ditherPattern[7])
							{
								Data.data[pixelIndex + canvas.width * 4] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4] - RedDelta * ditherPattern[7])));
								Data.data[pixelIndex + canvas.width * 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 + 1] - GreenDelta * ditherPattern[7])));
								Data.data[pixelIndex + canvas.width * 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 + 2] - BlueDelta * ditherPattern[7])));
							}

							if(Y < canvas.height - 2 && ditherPattern[12])
							{
								Data.data[pixelIndex + canvas.width * 2 * 4] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4] - RedDelta * ditherPattern[12])));
								Data.data[pixelIndex + canvas.width * 2 * 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 + 1] - GreenDelta * ditherPattern[12])));
								Data.data[pixelIndex + canvas.width * 2 * 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 + 2] - BlueDelta * ditherPattern[12])));
							}

							if(X > 0)
							{
								if(Y < canvas.height - 1 && ditherPattern[6])
								{
									Data.data[pixelIndex + canvas.width * 4 - 4] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 - 4] - RedDelta * ditherPattern[6])));
									Data.data[pixelIndex + canvas.width * 4 - 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 - 4 + 1] - GreenDelta * ditherPattern[6])));
									Data.data[pixelIndex + canvas.width * 4 - 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 - 4 + 2] - BlueDelta * ditherPattern[6])));
								}

								if(Y < canvas.height - 2 && ditherPattern[11])
								{
									Data.data[pixelIndex + canvas.width * 2 * 4 - 4] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 - 4] - RedDelta * ditherPattern[11])));
									Data.data[pixelIndex + canvas.width * 2 * 4 - 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 - 4 + 1] - GreenDelta * ditherPattern[11])));
									Data.data[pixelIndex + canvas.width * 2 * 4 - 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 - 4 + 2] - BlueDelta * ditherPattern[11])));
								}
							}

							if(X > 1)
							{
								if(Y < canvas.height - 1 && ditherPattern[5])
								{
									Data.data[pixelIndex + canvas.width * 4 - 8] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 - 8] - RedDelta * ditherPattern[5])));
									Data.data[pixelIndex + canvas.width * 4 - 8 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 - 8 + 1] - GreenDelta * ditherPattern[5])));
									Data.data[pixelIndex + canvas.width * 4 - 8 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 4 - 8 + 2] - BlueDelta * ditherPattern[5])));
								}

								if(Y < canvas.height - 2 && ditherPattern[10])
								{
									Data.data[pixelIndex + canvas.width * 2 * 4 - 8] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 - 8] - RedDelta * ditherPattern[10])));
									Data.data[pixelIndex + canvas.width * 2 * 4 - 8 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 - 8 + 1] - GreenDelta * ditherPattern[10])));
									Data.data[pixelIndex + canvas.width * 2 * 4 - 8 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[pixelIndex + canvas.width * 2 * 4 - 8 + 2] - BlueDelta * ditherPattern[10])));
								}
							}

							Data.data[pixelIndex] = Colors[RemappedColorIndex].Red;
							Data.data[pixelIndex + 1] = Colors[RemappedColorIndex].Green;
							Data.data[pixelIndex + 2] = Colors[RemappedColorIndex].Blue;
							Data.data[pixelIndex + 3] = alpha;
						}
					}
					else {
						var c = Colors[RemappedColorIndex];
						Data.data[pixelIndex] = c.Red;
						Data.data[pixelIndex + 1] = c.Green;
						Data.data[pixelIndex + 2] =c.Blue;
						Data.data[pixelIndex + 3] = alpha;
					}
				}
			}
		}

		Context.putImageData(Data, 0, 0);
	}

	function RemapFullPaletteImage(Canvas, BitsPerColor, DitherPattern) {
		var Context = Canvas.getContext("2d");
		var Data = Context.getImageData(0, 0, Canvas.width, Canvas.height);
		var ShadesPerColor = 1 << BitsPerColor;

		for(var Y = 0; Y < Canvas.height; Y++) {
			for(var X = 0; X < Canvas.width; X++) {
				var PixelIndex = (X + Y * Canvas.width) * 4;

				var Red = Data.data[PixelIndex];
				var Green = Data.data[PixelIndex + 1];
				var Blue = Data.data[PixelIndex + 2];
				var Alpha = Data.data[PixelIndex + 3];
				var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

				var MatchingRed = Red;
				var MatchingGreen = Green;
				var MatchingBlue = Blue;

				if(Alpha >= alphaThreshold) {
					if(DitherPattern) {
						if(DitherPattern[0] == 1) {
							// Checker pattern.
						}
						else {
							// Error diffusion.
							var ShadesScale = (ShadesPerColor - 1) / 255;
							var InverseShadesScale = 1 / ShadesScale;

							MatchingRed = Math.round(Math.round(Red * ShadesScale) * InverseShadesScale);
							MatchingGreen = Math.round(Math.round(Green * ShadesScale) * InverseShadesScale);
							MatchingBlue = Math.round(Math.round(Blue * ShadesScale) * InverseShadesScale);

							var RedDelta = MatchingRed - Red;
							var GreenDelta = MatchingGreen - Green;
							var BlueDelta = MatchingBlue - Blue;

							if(X < Canvas.width - 2) {
								if(DitherPattern[4])
								{
									Data.data[PixelIndex + 8] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + 8] - RedDelta * DitherPattern[4])));
									Data.data[PixelIndex + 8 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + 8 + 1] - GreenDelta * DitherPattern[4])));
									Data.data[PixelIndex + 8 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + 8 + 2] - BlueDelta * DitherPattern[4])));
								}

								if(Y < Canvas.height - 1 && DitherPattern[9])
								{
									Data.data[PixelIndex + Canvas.width * 4 + 8] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 + 8] - RedDelta * DitherPattern[9])));
									Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] - GreenDelta * DitherPattern[9])));
									Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] - BlueDelta * DitherPattern[9])));
								}

								if(Y < Canvas.height - 2 && DitherPattern[14])
								{
									Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] - RedDelta * DitherPattern[14])));
									Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] - GreenDelta * DitherPattern[14])));
									Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] - BlueDelta * DitherPattern[14])));
								}
							}

							if(X < Canvas.width - 1)
							{
								if(DitherPattern[3])
								{
									Data.data[PixelIndex + 4] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + 4] - RedDelta * DitherPattern[3])));
									Data.data[PixelIndex + 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + 4 + 1] - GreenDelta * DitherPattern[3])));
									Data.data[PixelIndex + 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + 4 + 2] - BlueDelta * DitherPattern[3])));
								}

								if(Y < Canvas.height - 1 && DitherPattern[8])
								{
									Data.data[PixelIndex + Canvas.width * 4 + 4] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 + 4] - RedDelta * DitherPattern[8])));
									Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] - GreenDelta * DitherPattern[8])));
									Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] - BlueDelta * DitherPattern[8])));
								}

								if(Y < Canvas.height - 2 && DitherPattern[13])
								{
									Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] - RedDelta * DitherPattern[13])));
									Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] - GreenDelta * DitherPattern[13])));
									Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] - BlueDelta * DitherPattern[13])));
								}
							}

							if(Y < Canvas.height - 1 && DitherPattern[7])
							{
								Data.data[PixelIndex + Canvas.width * 4] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4] - RedDelta * DitherPattern[7])));
								Data.data[PixelIndex + Canvas.width * 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 + 1] - GreenDelta * DitherPattern[7])));
								Data.data[PixelIndex + Canvas.width * 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 + 2] - BlueDelta * DitherPattern[7])));
							}

							if(Y < Canvas.height - 2 && DitherPattern[12])
							{
								Data.data[PixelIndex + Canvas.width * 2 * 4] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4] - RedDelta * DitherPattern[12])));
								Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] - GreenDelta * DitherPattern[12])));
								Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] - BlueDelta * DitherPattern[12])));
							}

							if(X > 0)
							{
								if(Y < Canvas.height - 1 && DitherPattern[6])
								{
									Data.data[PixelIndex + Canvas.width * 4 - 4] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 - 4] - RedDelta * DitherPattern[6])));
									Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] - GreenDelta * DitherPattern[6])));
									Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] - BlueDelta * DitherPattern[6])));
								}

								if(Y < Canvas.height - 2 && DitherPattern[11])
								{
									Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] - RedDelta * DitherPattern[11])));
									Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] - GreenDelta * DitherPattern[11])));
									Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] - BlueDelta * DitherPattern[11])));
								}
							}

							if(X > 1)
							{
								if(Y < Canvas.height - 1 && DitherPattern[5])
								{
									Data.data[PixelIndex + Canvas.width * 4 - 8] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 - 8] - RedDelta * DitherPattern[5])));
									Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] - GreenDelta * DitherPattern[5])));
									Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] - BlueDelta * DitherPattern[5])));
								}

								if(Y < Canvas.height - 2 && DitherPattern[10])
								{
									Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] - RedDelta * DitherPattern[10])));
									Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] - GreenDelta * DitherPattern[10])));
									Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] = Math.round(Math.min(255, Math.max(0, Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] - BlueDelta * DitherPattern[10])));
								}
							}
						}
					}

					console.error(MatchingRed);
					Data.data[PixelIndex] = MatchingRed;
					Data.data[PixelIndex + 1] = MatchingGreen;
					Data.data[PixelIndex + 2] = MatchingBlue;
					Data.data[PixelIndex + 3] = Alpha;
				}else{
					// transparency?
				}
			}
		}

		Context.putImageData(Data, 0, 0);
	}



	function ProcessImage(colorCount, bitsPerColor, ditherPattern, Id) {
		var Colors = [];

		if(colorCount == "Global") {
			for(var Index = 0; Index < GlobalColors.length; Index++)
				Colors.push({ Red: GlobalColors[Index].Red, Green: GlobalColors[Index].Green, Blue: GlobalColors[Index].Blue });

			ImageInfos.QuantizedColors = Colors;

			RemapImage(ImageInfos.canvas, Colors, ditherPattern);
		}else if(colorCount == "Palette") {

			for(var i = 0; i < ImageInfos.palette.length; i++){
				var color = ImageInfos.palette[i];
				Colors.push({ Red: color[0], Green: color[1], Blue: color[2], Alpha: 255 });
			}
			ImageInfos.QuantizedColors = Colors;
			RemapImage(ImageInfos.canvas, Colors, ditherPattern);
		}else{
			if(!ImageInfos.Colors || ImageInfos.Colors.length > colorCount) {
				if(colorCount == 2){
					Colors.push({ Red: 0, Green: 0, Blue: 0 });
					Colors.push({ Red: 255, Green: 255, Blue: 255 });

					ImageInfos.QuantizedColors = Colors;

					RemapImage(ImageInfos.canvas, Colors, ditherPattern);

					UpdateImageWindow(Id);
				}
				else
				{
					var MaxRecursionDepth = 1;

					while(Math.pow(2, MaxRecursionDepth) < colorCount)
						MaxRecursionDepth++;

					var QuantizeWorker = new Worker("_script/quantize.js");

					var QuantizeData = { LineIndex: 0, CanvasData: ImageInfos.canvas.getContext("2d").getImageData(0, 0, ImageInfos.canvas.width, ImageInfos.canvas.height), MaxRecursionDepth: MaxRecursionDepth, BitsPerColor: bitsPerColor, ColorCount: colorCount };

					QuantizeWorker.addEventListener(
						"message",
						function(e)
						{
							ImageInfos.QuantizedColors = e.data.Colors;

							console.error(ImageInfos.QuantizedColors);

							RemapImage(ImageInfos.canvas, ImageInfos.QuantizedColors, ditherPattern);

							UpdateImageWindow(Id);
						},
						false);

					QuantizeWorker.postMessage(QuantizeData);
					
				}

				return;
			}else{
				for (var Index = 0; Index < ImageInfos.Colors.length; Index++)
					Colors.push({ Red: ImageInfos.Colors[Index].Red, Green: ImageInfos.Colors[Index].Green, Blue: ImageInfos.Colors[Index].Blue });
			}

			var ShadesPerColor = 1 << bitsPerColor;

			for(var Index = 0; Index < Colors.length; Index++)
			{
				var ShadesScale = (ShadesPerColor - 1) / 255;
				var InverseShadesScale = 1 / ShadesScale;

				Colors[Index].Red = Math.round(Math.round(Colors[Index].Red * ShadesScale) * InverseShadesScale);
				Colors[Index].Green = Math.round(Math.round(Colors[Index].Green * ShadesScale) * InverseShadesScale);
				Colors[Index].Blue = Math.round(Math.round(Colors[Index].Blue * ShadesScale) * InverseShadesScale);
			}
		}

		// Remap image.

		if(colorCount === "Palette") {
			RemapFullPaletteImage(ImageInfos.canvas, bitsPerColor, ditherPattern);
		}

		ImageInfos.QuantizedColors = Colors;
		
		UpdateImageWindow(Id);
	}
	
	
	function UpdateImageWindow(){
		console.error(ImageInfos);
		
		if (ImageInfos.QuantizedColors){
			var palette = [];
			ImageInfos.QuantizedColors.forEach(function(c){
				palette.push([c.Red,c.Green,c.Blue]);
			});
			IconEditor.setPalette(palette);
			IconEditor.updateIcon();
		}
	}


	EventBus.on(EVENT.backgroundColorChanged,function(){
		mattingColor = IconEditor.getBackgroundColor();
	});
	
	return me;
}();