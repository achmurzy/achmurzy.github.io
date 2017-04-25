//Qualitatively different strokes will generalize this method, which simply randomly
//generates from stroke primitives. It is essential that on the lowest level, we maintain
//the formal structure characterized by the body of this loop, where: 
//Strokes S recursively compose Glyph G, M (move) separating L (line), Q (quad), C(cubic):
/*	
	G -> S
	S -> SS
	S -> ML
	S -> MQ
	s -> MC
*/

function Generator(types, min, max, width, wvariance, length, lvariance, connect)
{
	this.strokeTypes = types;
	this.minStrokes = min;
	this.maxStrokes = max;

	this.strokeLength = length;
	if(lvariance > length)
		lvariance = length;
	this.lengthVariance = lvariance;
	this.strokeWidth = width;
	if(wvariance > width)
		wvariance = width;
	this.widthVariance = wvariance;
	
	this.connectProbability = connect;
}

Generator.prototype.generateGlyph = function(counter)
{
	var glyphPath = new opentype.Path();
	var pathList = []; 
	var colors = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan', 'orange', 'purple'];
	var strokeNum = this.minStrokes + Math.floor(this.maxStrokes * Math.random());
	for(var i = 0; i < strokeNum; i++)
	{
		var randomStroke = this.strokeTypes[Math.floor(Math.random() * this.strokeTypes.length)];
		console.log(randomStroke);
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

		var newPath = this.addStroke(randomStroke, strokeWidth, strokeLength);
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

Generator.prototype.addStroke = function(selection, width, length)
{
	var stroke = [];
	path = new opentype.Path();
	switch(selection)
	{
		case 'L':
		console.log("Making line");
			var line = baseLine(length);
			path.start = line[0];
			path.end = line[1];
			stroke = generateLine(line[0], line[1], width);
			break;
		case 'Q':
			var quad = baseQuadratic(length);
			path.start = quad[0];
			path.end = quad[1];
			path.cp1 = quad[2];
			stroke = generateQuadratic(quad[0], quad[1], quad[2], width);
			path.cp1Pos = stroke[5];
			path.cp1Neg =  stroke[6];
			break;
		case 'C':
			var cube = baseCubic(length);
			path.start = cube[0];
			path.end = cube[1];
			path.cp1 = cube[2];
			path.cp2 = cube[3];
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