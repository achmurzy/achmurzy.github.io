function Generator(min=2, max=5, width=50, wvariance=0, length=100, lvariance=0, connect=0, size = 100)
{
	this.line = true;
	this.quadratic = true;
	this.cubic = true;

	this.minStrokes = min;
	this.maxStrokes = max;

	if(length > GLYPH_SCALE/2)
		length = GLYPH_SCALE/2;
	this.strokeLength = length;
	if(lvariance > length)
		lvariance = length;
	this.lengthVariance = lvariance;
	
	if(width > length)
		width = length;
	this.strokeWidth = width;
	if(wvariance > width)
		wvariance = width;
	this.widthVariance = wvariance;
	
	this.connectProbability = connect;

	this.trainingDataSize = size;
}

Generator.prototype.generateGlyph = function(counter)
{
	var glyphPath = new opentype.Path();
	var pathList = []; 
	var colors = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan', 'orange', 'purple'];
	var strokes = ['L', 'Q', 'C'];
	var strokeNum = Math.floor(this.minStrokes + this.maxStrokes * Math.random());
	for(var i = 0; i < strokeNum; i++)
	{
		var randomStroke = Math.floor(Math.random() * 3);
		while(!this.checkStroke(randomStroke))
			randomStroke = Math.floor(Math.random() * 3);
		randomStroke = strokes[randomStroke];
		var varyW = Math.random() * this.widthVariance;
		var varyL = Math.random() * this.lengthVariance;
		var strokeWidth, strokeLength;
		if(Math.floor(Math.random()*2))
		{
			strokeWidth = this.strokeWidth + varyW;
		}else
			{strokeWidth = this.strokeWidth - varyW;}

		if(Math.floor(Math.random()*2))
		{
			strokeLength = this.strokeLength + varyL;
		}else
			{strokeLength = this.strokeLength - varyL;}

		var connect = Math.random();
		var newPath;
		if(connect <= this.connectProbability && i != 0) //Always connect when connectProbability === 1
		{
			newPath = this.addStroke(randomStroke, strokeWidth, strokeLength, pathList[i-1].end);
		}
		else
			newPath = this.addStroke(randomStroke, strokeWidth, strokeLength);

		
		var colorIndex = Math.floor(Math.random() * colors.length);
		newPath.color = colors[colorIndex];
		colors.splice(colorIndex, 1);
		
		pathList.push(newPath);
		addContour(newPath, glyphPath);
	}

	var glyph = new opentype.Glyph(
	{
		name: 'glyph '+counter,
        unicode: counter,
        index: counter,
        advanceWidth: GLYPH_SCALE,
        path: glyphPath
	});
	glyph.strokeData = pathList;
	return glyph;
}

Generator.prototype.checkStroke = function(int)
{
	switch(int)
	{
		case 0:
		return this.line;
		break;
		case 1:
		return this.quadratic;
		break;
		case 2:
		return this.cubic;
		break;
		default:
		console.log("invalid stroke");
	}
	return;
}


Generator.prototype.addStroke = function(selection, width, length, connect=null)
{
	var stroke = [];
	path = new opentype.Path();
	switch(selection)
	{
		case 'L':
			var line;
			if(connect != null)
			 	line = baseLine(length, connect);
			else
				line = baseLine(length);
			path.start = line[0];
			path.end = line[1];
			stroke = generateLine(line[0], line[1], width);
			break;
		case 'Q':
			var quad;
			if(connect != null)
			 	quad = baseQuadratic(length, connect);
			else
				quad = baseQuadratic(length);
			path.start = quad[0];
			path.cp1 = quad[1];
			path.end = quad[2];
			stroke = generateQuadratic(quad[0], quad[1], quad[2], width);
			path.cp1Pos = stroke[5];
			path.cp1Neg =  stroke[6];
			break;
		case 'C':
			var cube;
			if(connect != null)
			 	cube = baseCubic(length, connect);
			else
				cube = baseCubic(length);
			path.start = cube[0];
			path.cp1 = cube[1];
			path.cp2 = cube[2];
			path.end = cube[3];
			stroke = generateCubic(cube[0], cube[1], cube[2], cube[3], width);
			path.cp1Pos = stroke[5];
			path.cp1Neg = stroke[6];
			path.cp2Pos = stroke[7];
			path.cp2Neg = stroke[8];
			break;
		default:
			console.log("Invalid stroke generation selection");
	}
	
	path.type = stroke[0];
	path.startPos = stroke[1];
	path.startNeg = stroke[2];
	path.endPos = stroke[3];
	path.endNeg = stroke[4];

	return path;
}

//Takes <opentype.js> Path object, a stroke object of up to three vectors containing 
//the point and two control points for curves, and a code to describe the line
function addContour(path, glyphPath)
{
	glyphPath.moveTo(path.startNeg.x, path.startNeg.y);
	glyphPath.lineTo(path.startPos.x, path.startPos.y);

	switch(path.type)
	{
		case 'L':
			glyphPath.lineTo(path.endPos.x, path.endPos.y);
			glyphPath.lineTo(path.endNeg.x, path.endNeg.y);
			glyphPath.lineTo(path.startNeg.x, path.startNeg.y);
			break;
		case 'Q':
			glyphPath.quadTo(path.cp1Pos.x, path.cp1Pos.y, path.endPos.x, path.endPos.y);
			glyphPath.lineTo(path.endNeg.x, path.endNeg.y);
			glyphPath.quadTo(path.cp1Neg.x, path.cp1Neg.y, path.startNeg.x, path.startNeg.y);
			break;
		case 'C':
			glyphPath.curveTo(path.cp1Pos.x, path.cp1Pos.y, 
								path.cp2Pos.x, path.cp2Pos.y,
									path.endPos.x, path.endPos.y);
			glyphPath.lineTo(path.endNeg.x, path.endNeg.y);
			glyphPath.curveTo(path.cp2Neg.x, path.cp2Neg.y, 
								path.cp1Neg.x, path.cp1Neg.y,
									path.startNeg.x, path.startNeg.y);			
			break;
		default:
			console.log("Invalid stroke symbol");
	}
}

Generator.prototype.trainGlyph = function()
{
	var strokeList = ['M']; 
	var strokeNum = this.minStrokes + Math.floor(this.maxStrokes * Math.random());
	var strokes = ['L', 'Q', 'C'];
	for(var i = 0; i < strokeNum; i++)
	{
		var randomStroke = Math.floor(Math.random() * 3);
		while(!this.checkStroke(randomStroke))
			randomStroke = Math.floor(Math.random() * 3);
		randomStroke = strokes[randomStroke];
		
		var varyW = Math.random() * this.widthVariance;
		var varyL = Math.random() * this.lengthVariance;
		var strokeWidth, strokeLength;
		if(Math.floor(Math.random()*2))
		{
			strokeWidth = this.strokeWidth + varyW;
		}else
			{strokeWidth = this.strokeWidth - varyW;}

		if(Math.floor(Math.random()*2))
		{
			strokeLength = this.strokeLength + varyL;
		}else
			{strokeLength = this.strokeLength - varyL;}

		var stroke;
		strokeList.push(randomStroke);
		var connect = Math.random();	
		if(connect <= this.connectProbability && i != 0) //Always connect when connectProbability === 1
		{
			var lastEnd = strokeList[i-1];
			switch(randomStroke)
			{
				case 'L':
					stroke = baseLine(strokeLength, lastEnd[1]);
					break;
				case 'Q':
					stroke = baseQuadratic(strokeLength, lastEnd[2]);
					break;
				case 'C':
					stroke = baseCubic(strokeLength, lastEnd[3]);
					break;
				default:
					stroke = [];
			}
		}
		else
		{
			switch(randomStroke)
			{
				case 'L':
					stroke = baseLine(strokeLength);
					break;
				case 'Q':
					stroke = baseQuadratic(strokeLength);
					break;
				case 'C':
					stroke = baseCubic(strokeLength);
					break;
				default:
					stroke = [];
			}	
		}
		strokeList.push.apply(strokeList, stroke); //apply push to each new stroke element to add to list
	}

	return strokeList;
}

//Parse pseudo-JSON format output from AI modules
Generator.prototype.parseGlyphs = function(text, panel) 
{                                  
	  var count = 0;
	  var glyphCount = 0;
	  var currentGlyph;
	  var pathList;
	  var glyphs = JSON.parse(text);
	  var drawGlyphs = [];
	  while(count < glyphs.length)
	  {
	    if(glyphs[count] === 'M') //Start a new glyph
	    {
	      var glyphPath = new opentype.Path();
	      pathList = [];
	      currentGlyph = new opentype.Glyph(
	        {
	          name: 'glyph '+glyphCount,
	              unicode: glyphCount,
	              index: glyphCount,
	              advanceWidth: GLYPH_SCALE,
	              path: glyphPath
	        });
	      currentGlyph.strokeData = pathList;
	      drawGlyphs.push(currentGlyph);
	      glyphCount++;
	      count++;
	    }
	    else
	    {
	      var path = new opentype.Path();
	      if(glyphs[count] === 'L') //Parse x -y
	      {
	        var line = [new Victor(glyphs[count+1].x, glyphs[count+1].y), 
	                    new Victor(glyphs[count+2].x, glyphs[count+2].y)];
	        var stroke = generateLine(line[0], line[1], this.strokeWidth)
	        path.start = line[0];
	        path.end = line[1];
	        count += 3;
	      }
	      else if(glyphs[count] === 'Q') //Parse x -y -cp1
	      {
	        var quad = [new Victor(glyphs[count+1].x, glyphs[count+1].y), 
	                    new Victor(glyphs[count+2].x, glyphs[count+2].y),
	                    new Victor(glyphs[count+3].x, glyphs[count+3].y)];
	        var stroke = 
	          generateQuadratic(quad[0], quad[1], quad[2], this.strokeWidth);
	        path.start = quad[0];
	        path.cp1 = quad[1];
	        path.end = quad[2];
	        path.cp1Pos = stroke[5];
	        path.cp1Neg =  stroke[6];
	        count += 4;
	      }
	      else if(glyphs[count] === 'C') //Parse x - y- cp1 - cp2
	      {
	        var cube =  [new Victor(glyphs[count+1].x, glyphs[count+1].y), 
	                    new Victor(glyphs[count+2].x, glyphs[count+2].y),
	                    new Victor(glyphs[count+3].x, glyphs[count+3].y),
	                    new Victor(glyphs[count+4].x, glyphs[count+4].y)];
	        var stroke = generateCubic(cube[0], cube[1], cube[2], cube[3], this.strokeWidth);
	        path.start = cube[0];
	        path.cp1 = cube[1];
	        path.cp2 = cube[2];
	        path.end = cube[3];
	        path.cp1Pos = stroke[5];
	        path.cp1Neg = stroke[6];
	        path.cp2Pos = stroke[7];
	        path.cp2Neg = stroke[8];
	        count += 5;
	      }
	      else
	      {
	        console.log("Parsing error, check your data");
	      }
	      
	      path.type = stroke[0];
	      path.startPos = stroke[1];
	      path.startNeg = stroke[2];
	      path.endPos = stroke[3];
	      path.endNeg = stroke[4];
	      pathList.push(path);
	      addContour(path, currentGlyph.path);
	    }
	  }
	  console.log(drawGlyphs);
	  for(var i =0;i<drawGlyphs.length;i++)
	  {
	  	panel.addGlyph(drawGlyphs[i]);
	  }
  };

function RandomInsideBox()
{
	return (new Victor().randomize(new Victor(0, GLYPH_SCALE), new Victor(GLYPH_SCALE, 0)));
}

//Flip y point for computer graphics fuckery - float y value
function MirrorY(y)
{
	return GLYPH_SCALE - y;
}

function InsideBox(point) //Doesnt work with while loopp
{
	return (point.x > 0 && point.x < GLYPH_SCALE && point.y > 0 && point.y < GLYPH_SCALE);
}

