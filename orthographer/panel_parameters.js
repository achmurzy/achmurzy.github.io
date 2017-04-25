function DrawParameters(x, y, width, height, scale, color, inspect, rate, speed)
{
	this.x = x;
	this.y = y;
	this.boxScale = scale;
    this.boxColor = color;
    this.width = width;
    this.height = height;
    this.inspectScale = inspect;

    this.xScale = d3.scaleLinear()
                .domain([0, GLYPH_SCALE])
                .range([0, this.boxScale]);
    this.yScale = d3.scaleLinear()
                .domain([0, GLYPH_SCALE])
                .range([0, this.boxScale]);

    this.glyphsX = function() { return this.width / this.boxScale; };
    this.glyphsY = function() { return this.height / this.boxScale; };

    if(this.inspectScale > this.glyphsX())
    	this.inspectScale = this.glyphsX();

    this.gScaleX = d3.scaleLinear()
	    .domain([0, this.glyphsX()])
	    .range([0, this.width]);

	this.gScaleY = d3.scaleLinear()
	    .domain([0, this.glyphsY()])
	    .range([0, this.height]);

    this.generationTime = rate;
    this.drawDuration = speed;
}