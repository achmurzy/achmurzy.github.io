function Viewer(context, _url)
{
	this.svg = context;
	this.group = context.append("g")
						.attr("transform", "translate(0, 0)");
	this.url = _url;

	this.x = d3.scaleLinear()
				.domain([0, 2])
				.range([0, context.attr("width")]);
	this.y = d3.scaleLinear()
				.domain([0, 2])
				.range([0, context.attr("height")]);
	this.upX = false;
	this.boundsX = 1;
	this.boundsY = 1;
}

Viewer.prototype.RenderTag = function()
{
	var _this = this;
	d3.jsonp(this.url, function(data)
	{
		var strokeData = _this.ParseGML(data);
		if(strokeData.pt != undefined) 
		{ strokeData = [strokeData]; }
		var strokes = _this.group.selectAll("path").data(strokeData);

		if(_this.upX)
		{
			strokes.enter()
			.append("path")
				.attr("d", function (d) { return _this.InterpretStrokeUpX(d.pt); })
				.style("stroke", function(d) { return 0; })
				.style("stroke-width", function(d) { return 1; });
		}
		else
		{
			strokes.enter()
			.append("path")
				.attr("d", function (d) { return _this.InterpretStroke(d.pt); })
				.style("stroke", function(d) { return 0; })
				.style("stroke-width", function(d) { return 1; });
		}
	});
}

Viewer.prototype.InterpretStroke = function(points)
{
	var stroke = d3.path();
	var firstPoint = points[0];
	stroke.moveTo(this.x(firstPoint.x), this.y(1-firstPoint.y));
	for(var i = 1; i < points.length; i++)
	{
		stroke.lineTo(this.x(points[i].x), this.y(1-points[i].y));
	}
	return stroke.toString();
}

Viewer.prototype.InterpretStrokeUpX = function(points)
{
	var stroke = d3.path();
	var firstPoint = points[0];
	stroke.moveTo(this.aY(this.y(firstPoint.y)), this.aX(this.x(1-firstPoint.x)));
	for(var i = 1; i < points.length; i++)
	{
		stroke.lineTo(this.aY(this.y(points[i].y)), this.aX(this.x(1-points[i].x)));
	}
	return stroke.toString();
}

Viewer.prototype.ParseGML = function(json)
{
	console.log(json);
	if(json.gml.tag.environment != null)
	{
		if(json.gml.tag.environment.up.x === "1")
			this.upX = true;
		console.log(json.gml.tag.environment.screenBounds.x);
		this.aX = d3.scaleLinear().domain([0, 2]).range([0, json.gml.tag.environment.screenBounds.x]);
		this.aY = d3.scaleLinear().domain([0, 2]).range([0, json.gml.tag.environment.screenBounds.y]);
		this.x = d3.scaleLinear()
					.domain([0, json.gml.tag.environment.screenBounds.x])
					.range([0, this.svg.attr("width")]);
		this.y = d3.scaleLinear()
					.domain([0, json.gml.tag.environment.screenBounds.y])
					.range([0, this.svg.attr("height")]);
	}
	if(json.gml.tag.drawing != null)
		return json.gml.tag.drawing.stroke;
	else
	{
		console.log("GML contains no glyph");
		return [];
	}
}

//A last resort for pulling content from our graffiti database
//Provided by: https://github.com/d3/d3-plugins/tree/master/jsonp
d3.jsonp = function (url, callback) {
  function rand() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      c = '', i = -1;
    while (++i < 15) c += chars.charAt(Math.floor(Math.random() * 52));
    return c;
  }

  function create(url) {
    var e = url.match(/callback=d3.jsonp.(\w+)/),
      c = e ? e[1] : rand();
    d3.jsonp[c] = function(data) {
      callback(data);
      delete d3.jsonp[c];
      script.remove();
    };
    return 'd3.jsonp.' + c;
  }

  var cb = create(url),
    script = d3.select('head')
    .append('script')
    .attr('type', 'text/javascript')
    .attr('src', url.replace(/(\{|%7B)callback(\}|%7D)/, cb));
};
