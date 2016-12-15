

//Select container with class foo
//Append SVG to DOM w/attributes
//var svg = d3.select('div.foo').append('svg').attr('width', 'Xpx').attr('height', 'Ypx');  

var peppers =[
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"},
    {"width": 20, "height": Math.floor(Math.random() * (100 - 60 + 1)) + 60, "color": "yellow"}
]

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    width = 490 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;

//Importantly, select does not necessarily find an element in the current document.
var gSVG = d3.select('div.gardenDiv').append('svg').
	attr('width', width + margin.left + margin.right).
	attr('height', height + margin.top + margin.bottom);
//	append('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//selectAll creates a set of potential svg 'rect' elements of class 'colorBar'- infinite size
//Add data 'peppers' which defines attributes of elements - and the number of them
//enter adds the data to the set of selected elements
//append decides which SVG primitive will render the data points
//attr acceses attributes of the svg element 'rect', defined using data
//'divHeight' comes from the fact that we are operating in the context of the gardenDiv
gSVG.selectAll('rect.colorBar').data(peppers).enter().append('rect').attr('width', 
		function(d, i) { return d.width; }).attr('height', 
		function(d, i) { return d.height; }).attr('x', 
		function(d, i) { return margin.left + (i * d.width); }).attr('y', 
		function(d, i) { return parseInt(gSVG.style("height"),10) - (d.height + margin.bottom/2); }).
		attr('fill', function(d, i) { return d3.interpolateRgb(0, d3.color(d.color)).toString(); });

//Recall we bound 'data' to 'peppers' above
//Inclusion of domain and range maps data to SVG graphics attribute 'width'
var xScale = d3.scaleLinear().domain([0, gSVG.data.length]).
	range([0, width]);

//use d3 function to get the max of the data w.r.t. a particular attribute
//Remember, data is a collection of SVG rect objects instantiated with 'pepper' values
var yScale = d3.scaleLinear().domain([0, d3.max(peppers, 
	function(d){ return d.height; })]).
	range([parseInt(gSVG.style("height")), 0]);

var xAxis = d3.axisBottom(xScale);
gSVG.append("g").attr("transform", "translate("+margin.left+", " + 
	(parseInt(gSVG.style("height"), 10) - margin.bottom/2) + ")").
	call(xAxis);

var yAxis = d3.axisLeft(yScale);
gSVG.append("g").attr("transform", "translate(" + margin.left + "," + (-margin.bottom/2) + ")").
	call(yAxis);