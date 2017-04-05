//Returns two points and a command 'L'
function generateLine(start, end, width)
{
	var offset = end.clone();
	offset.subtract(start);
	var perpLine = perpindicularLine(offset, true).normalize();

	var spos = start.clone();
	spos.add(new Victor(perpLine.x * width, perpLine.y * width));
	var sneg = start.clone();
	sneg.add(new Victor(perpLine.x * -width, perpLine.y * -width));

	var pos = end.clone();
	pos.add(new Victor(perpLine.x * width, perpLine.y * width));
	var neg = end.clone();
	neg.add(new Victor(perpLine.x * -width, perpLine.y * -width));

	return ['L', spos, sneg, pos, neg];
}

function generateFlatLine()
{
	var end = RandomInsideBox();
	return ['L', end];
}

function perpindicularLine(vector, left_handed)
{
	if(left_handed)
		return new Victor(vector.y, -vector.x);
	else
		return new Victor(-vector.y, vector.x);	
}

//Returns four points and a command 'Q'
function generateQuadratic(start, end, control_point, width)
{	
	var perpStart = perpindicularQuadratic([start, control_point, end], 0, true).normalize();
	var perpCp = perpStart.clone();

	var spos = start.clone();
	spos.add(new Victor(perpStart.x * width, perpStart.y * width));
	var sneg = start.clone();
	sneg.add(new Victor(perpStart.x * -width, perpStart.y * -width));

	var perpEnd = perpindicularQuadratic([start, control_point, end], 1, true).normalize();
	perpCp.add(perpEnd);

	var pos = end.clone();
	pos.add(new Victor(perpEnd.x * width, perpEnd.y * width));
	var neg = end.clone();
	neg.add(new Victor(perpEnd.x * -width, perpEnd.y * -width));

	perpCp = perpCp.normalize();
	var cpos = control_point.clone();
	cpos.add(new Victor(perpCp.x * width * 2, perpCp.y * width * 2));
	var cneg = control_point.clone();
	cneg.add(new Victor(perpCp.x * -width * 2, perpCp.y * -width * 2));

	return ['Q', spos, sneg, pos, neg, cpos, cneg, perpStart, perpEnd, perpCp];	
}

//Takes a list of three points (start, control, end)
function perpindicularQuadratic(quad, t, handed)
{
	var quadTang = quadraticDerivative(quad, t);
	return perpindicularLine(quadTang, handed);
}

//Takes a list of three points and returns the tangent line
//at the point t [0, 1] along the curve
function quadraticDerivative(quad, t)
{
	var start = quad[0].clone();
	var cp = quad[1].clone();
	var end = quad[2].clone();

	cp.subtract(start);
	var t1 = new Victor(cp.x * 2 * (1-t), cp.y * 2 * (1-t));
	end.subtract(quad[1]);
	t2 = new Victor(end.x * 2 * t, end.y * 2 * t);

	return t1.add(t2);
}

//Returns six points and a command 'C'
function generateCubic(start, end, control_point_1, control_point_2, width)
{
	var spos = start.clone();
	var sneg = start.clone();
	
	var pos = end.clone();
	var neg = end.clone();

	var c1pos = control_point_1.clone();
	var c1neg = control_point_1.clone();
	var c2pos = control_point_2.clone();
	var c2neg = control_point_2.clone();

	var startPerp = 
	perpindicularCubic([start, control_point_1, control_point_2, end], 0, true).normalize();

	spos.add(new Victor(startPerp.x * width, startPerp.y * width));
	sneg.add(new Victor(startPerp.x * -width, startPerp.y * -width));

	var endPerp = 
	perpindicularCubic([start, control_point_1, control_point_2, end], 1, true).normalize();
	
	pos.add(new Victor(endPerp.x * width, endPerp.y * width));	
	neg.add(new Victor(endPerp.x * -width, endPerp.y * -width));

	var cpPerp = startPerp.clone();
	cpPerp.add(endPerp).normalize();

	c1pos.add(new Victor(cpPerp.x * width, cpPerp.y * width));	
	c1neg.add(new Victor(cpPerp.x * -width, cpPerp.y * -width));
	
	c2pos.add(new Victor(cpPerp.x * width, cpPerp.y * width));	
	c2neg.add(new Victor(cpPerp.x * -width, cpPerp.y * -width));
	
	return ['C', spos, sneg, pos, neg, c1pos, c1neg, c2pos, c2neg];
}

//Takes a list of three points (start, control1, control2, end)
function perpindicularCubic(cube, t, handed)
{
	var cubeTang = cubicDerivative(cube, t);
	return perpindicularLine(cubeTang, handed);
}

//Takes a list of three points and returns the tangent line
//at the point t [0, 1] along the curve
function cubicDerivative(cube, t)
{
	var start = cube[0].clone();
	var cp1 = cube[1].clone();
	var cp2 = cube[2].clone();
	var end = cube[3].clone();

	cp1.subtract(start);
	var t1 = new Victor(cp1.x * 3*(1-(t*t)), cp1.y * 3*(1-(t*t)));

	cp2.subtract(cube[1]);
	var t2 = new Victor((6*(1-t))*t*cp2.x,(6*(1-t))*t*cp2.y);

	end.subtract(cube[2]);
	var t3 = new Victor(3*t*t*end.x, 3*t*t*end.y);

	return t1.add(t2.add(t3));
}