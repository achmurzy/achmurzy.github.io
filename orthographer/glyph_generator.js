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

	for(var i = 0; i < strokeNum; i++)
	{
		var start = RandomInsideBox();

		var randomStroke = Math.floor(Math.random() * 3);
		randomStroke = 2;

		addStroke(glyphPath, randomStroke, start, 25);
		addContour(glyphPath);
	}

	var glyph = new opentype.Glyph(
	{
		name: 'glyph '+counter,
        unicode: unicode,
        index: counter,
        advanceWidth: glyphScale,
        path: glyphPath
	});
	return glyph;
}

function addStroke(path, selection, point, width)
{
	var stroke = [];
	switch(selection)
	{
		case 0:
			stroke = generateLine(point, width);
			break;
		case 1:
			stroke = generateQuadratic(point, width);
			path.cp1Pos = stroke[5];
			path.cp1Neg =  stroke[6];
			/*path.start = stroke[7];
			path.end = stroke[8];
			path.cp = stroke[9];
			path.startPerp=stroke[10];
			path.endPerp=stroke[11];
			path.perp = stroke[12];*/
			break;
		case 2:
			stroke = generateCubic(point, width);
			path.cp1Pos = stroke[5];
			path.cp1Neg =  stroke[6];
			path.cp2Pos = stroke[7];
			path.cp2Neg = stroke[8];
			break;
		default:
			console.log("Invalid stroke generation selection");
	}
	path.command = stroke[0];
	path.startPos = stroke[1];
	path.startNeg = stroke[2];
	path.endPos = stroke[3];
	path.endNeg = stroke[4];
}

//Takes <opentype.js> Path object, a stroke object of up to three vectors containing 
//the point and two control points for curves, and a code to describe the line
function addContour(path)
{
	path.moveTo(path.startNeg.x, path.startNeg.y);
	path.lineTo(path.startPos.x, path.startPos.y);
	switch(path.command)
	{
		case 'L':
			path.lineTo(path.endPos.x, path.endPos.y);
			path.lineTo(path.endNeg.x, path.endNeg.y);
			path.lineTo(path.startNeg.x, path.startNeg.y);
			break;
		case 'Q':
			path.quadTo(path.cp1Pos.x, path.cp1Pos.y, path.endPos.x, path.endPos.y);
			path.lineTo(path.endNeg.x, path.endNeg.y);
			path.quadTo(path.cp1Neg.x, path.cp1Neg.y, path.startNeg.x, path.startNeg.y);
			break;
		case 'C':
			path.curveTo(path.cp1Pos.x, path.cp1Pos.y, 
								path.cp2Pos.x, path.cp2Pos.y,
									path.endPos.x, path.endPos.y);
			path.lineTo(path.endNeg.x, path.endNeg.y);
			path.curveTo(path.cp2Neg.x, path.cp2Neg.y, 
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

