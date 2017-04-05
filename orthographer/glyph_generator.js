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
function generateGlyph(strokeNum, counter, unicode)
{
	var glyphPath = new opentype.Path();
	var pathList = []; 
	colors = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan', 'orange', 'purple'];

	for(var i = 0; i < strokeNum; i++)
	{
		var randomStroke = Math.floor(Math.random() * 3);
		var strokeWidth = (Math.random() * 25) + 10;

		var newPath = addStroke(randomStroke, strokeWidth);
		var colorIndex = Math.floor(Math.random() * colors.length);
		newPath.color = colors[colorIndex];
		colors.splice(colorIndex, 1);
		pathList.push(newPath);
		addContour(newPath, glyphPath);
	}

	var glyph = new opentype.Glyph(
	{
		name: 'glyph '+counter,
        unicode: unicode,
        index: counter,
        advanceWidth: glyphScale,
        path: glyphPath
	});
	glyph.strokeData = pathList;
	return glyph;
}

function addStroke(selection, width)
{
	var stroke = [];
	path = new opentype.Path();
	start = RandomInsideBox();
	end = RandomInsideBox();
	switch(selection)
	{
		case 0:
			stroke = generateLine(start, end, width);
			break;
		case 1:
			var control_point = RandomInsideBox();
			stroke = generateQuadratic(start, end, control_point, width);
			path.cp1Pos = stroke[5];
			path.cp1Neg =  stroke[6];
			path.cp1 = control_point;
			break;
		case 2:
			var control_point_1 = RandomInsideBox();
			var control_point_2 = RandomInsideBox();
			stroke = generateCubic(start, end, control_point_1, control_point_2, width);
			path.cp1 = control_point_1;
			path.cp2 = control_point_2;
			path.cp1Pos = stroke[5];
			path.cp1Neg =  stroke[6];
			path.cp2Pos = stroke[7];
			path.cp2Neg = stroke[8];
			break;
		default:
			console.log("Invalid stroke generation selection");
	}
	path.start = start;
	path.end = end;
	
	path.command = stroke[0];
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
	switch(path.command)
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
	return (new Victor().randomize(new Victor(0, glyphScale), new Victor(glyphScale, 0)));
}

//Flip y point for computer graphics fuckery - float y value
function MirrorY(y)
{
	return glyphScale - y;
}

