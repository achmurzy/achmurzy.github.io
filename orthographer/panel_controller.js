function Panel(name, draw, glyph)
{
	var _this = this;

	this.name = name;
	this.drawParams = draw;
    this.generator = glyph;

	this.glyphData = [];
	this.group = canvas.append("g").attr("transform", "translate("+this.drawParams.x+","+this.drawParams.y+")");

	this.fullClick = false;
	this.fullButton = this.group.append("rect")
						.attr("x", 0)
						.attr("y", this.drawParams.boxScale)
						.attr("width", this.drawParams.boxScale)
						.attr("height", 0)
						.style("fill", this.drawParams.boxColor)
						.style("fill-opacity", 0.35)
						.on("click", function() 
						{
							if(!_this.fullClick)
							{
								_this.fullClick = true;
								_this.hideFullButton();
		    					_this.glyphData = [];
		    					_this.expandedElement = Number.MAX_SAFE_INTEGER;
								_this.toggleGeneration();
							}
							
						});
						this.group.append("line")
							.attr("x1", (3*this.drawParams.boxScale/4))
							.attr("y1", this.drawParams.boxScale + this.drawParams.boxScale/8)
							.attr("x2", this.drawParams.boxScale/4)
							.attr("y2", this.drawParams.boxScale + this.drawParams.boxScale/8);
						this.group.append("line")
							.attr("x1", this.drawParams.boxScale - this.drawParams.boxScale/3)
							.attr("y1", this.drawParams.boxScale)
							.attr("x2", this.drawParams.boxScale - this.drawParams.boxScale/4)
							.attr("y2", this.drawParams.boxScale + this.drawParams.boxScale/8);
						this.group.append("line")
							.attr("x1", this .drawParams.boxScale - this.drawParams.boxScale/3)
							.attr("y1", this.drawParams.boxScale + this.drawParams.boxScale/4)
							.attr("x2", this.drawParams.boxScale - this.drawParams.boxScale/4)
							.attr("y2", this.drawParams.boxScale + this.drawParams.boxScale/8);

	this.showFullButton = function() 
					{ 
						var _this = this;
						d3.select(this.fullButton).remove();
						var lines = this.group.selectAll("line").remove();
						var lastElement = this.group.selectAll("g").filter(function(d, i) 
						{
							return i === (_this.drawParams.glyphsX()*_this.drawParams.glyphsY())-1;
						});
						lastElement.append(function() { return _this.fullButton._groups[0][0]; });
						for(var i = 0; i < 3; i++)
						{
							lastElement.append(function () { return lines._groups[0][i]; });							
						}

						this.fullButton.transition()
						.duration(100)
		    			.attr("height", this.drawParams.boxScale/4)
		    			.on("end", function() { lastElement.selectAll("line")
		    										.transition()
		    											.duration(100)
		    											.style("stroke-opacity", 1); });
					};
	this.hideFullButton = function() 
					{	
						var _this = this;
						var lastElement = this.group.selectAll("g").filter(function(d, i) 
						{
							return i === (_this.drawParams.glyphsX()*_this.drawParams.glyphsY())-1;
						});
						d3.select(this.fullButton).remove();
						var lines = lastElement.selectAll("line").remove();
						lines.transition()
							.duration(0)
							.style("stroke-opacity", 0);
						this.fullButton.transition()
							.duration(0)
							.attr("height", 0)
							.on("end", function() { _this.fullClick = false; });
						this.group.append(function() { return _this.fullButton._groups[0][0]; });
						for(var i = 0; i < 3; i++)
						{
							this.group.append(function () { return lines._groups[0][i]; });							
						}
					};

	this.glyphCounter = 0;
    this.expandedElement = Number.MAX_SAFE_INTEGER;
    this.lastExpanded = this.expandedElement;
    this.glyphsFull = function() 
    { return this.drawParams.glyphsX()*this.drawParams.glyphsY() === this.glyphData.length; };


    this.firehose = false;
    this.inspect = true;
	this.addGlyph = function()  //Can add functions here or with 'prototype' ; <-- just don't forget this
	{
		console.log("add");
      	var glyph = this.generator.generateGlyph(this.glyphCounter);
      	this.glyphData.push(glyphToStrokes(glyph));
      	this.glyphCounter++;   
      	this.update();
		if(this.glyphsFull())
    	{   
	    	if(this.firehose)
	    	{
	    		this.glyphData = [];
	    	}
	    	else
	    	{
	    		this.toggleGeneration();
	    		this.showFullButton();
	    	}
    	} 
	};

	//Storing a member function as a callback requires some contortion
	var addMethod = this.addGlyph;
	var timeCall = function()
		{ 
			_this.totalTime += (d3.now() - _this.lastTime);
	 		_this.lastTime = d3.now(); 
	 		addMethod.call(_this); 
	 	};

	this.timer = d3.interval(timeCall, this.drawParams.generationTime);
	this.lastTime = 0;
	this.totalTime = 0.1;
	this.stopTime = 0;
	this.toggleGeneration = function ()
      {
      	if(this.totalTime > this.stopTime)
      		this.timer.stop();
      	else
      		this.timer = d3.interval(timeCall, this.drawParams.generationTime);
      	this.stopTime = this.totalTime;
      };

    //Our own double-click call-back
    this.clicked = false;
    this.clickLength = 350; //milliseconds
}

//General update pattern
Panel.prototype.update = function() 
{ 
	//A common practice where call-backs, anonymous functions are embedded in a local
	//scope where this may have an important meaning that needs to be preserved
	var _this = this;

	//Use glyph index as a key function to uniquely identify glyphs
    var glyphs = this.group.selectAll("g").data(this.glyphData, function(d, i) 
          { if(d === undefined) console.log("Undefined: "+i); else return d.index; });

    glyphs.exit().remove();

    glyphs.attr("class", this.name);
    glyphs.selectAll("rect")
          .attr("class", "update");
          
    enterGlyphs = glyphs.enter()
          .append("g")
          	.attr("class", this.name)
            .attr("transform", function(d, i) { return _this.positionGlyph(i, _this.expandedElement); });
    enterGlyphs.append("rect")
    		.attr("class", "enter")
              .attr("x", 0)
              .attr("y", function(d, i) { return 0; })
              .attr("width", this.drawParams.boxScale)
              .attr("height", this.drawParams.boxScale)
              .attr("stroke", 'black')
              .style("fill-opacity", 0)
              .attr("fill", this.drawParams.boxColor)
              .on("click", function(d, i) //Callbacks store references "as-is"
                { 
                	var gElement = this.parentNode;
                	if(_this.inspect)
                		_this.clickFunction(d, i, gElement, partial(_this.doubleClickSemantics, _this, gElement));
                }).transition()
              		.duration(function(d) 
              			{ return d3.select(this.parentNode).datum().strokes.length * _this.drawParams.drawDuration; })
              		.style("fill-opacity", 0.35);

     var strokes = glyphs.merge(enterGlyphs).selectAll("path").data(function(d, i) { return d.strokes; });
    //In-place update, filtering for the current glyph being updated
    /*if(this.glyphCounter === this.drawParams.glyphsX()*this.drawParams.glyphsY())
    {
    	strokes.filter(function(d, i)
    	{
    		return i === this.glyphCounter;
    	}).attr("d", function(d) 
   			{ return strokeInterpret(d.contours, _this.drawParams.xScale, _this.drawParams.yScale); });
    }*/
    
    //Enter update - stroke-by-stroke render
    strokes.enter()
      .append("path")  
        .attr("class", "undrawn")
        .style("fill-opacity", 0)      
        .style("stroke-opacity", 0)
        .attr("d", function(d) { return strokeInterpret(d.contours, _this.drawParams.xScale, _this.drawParams.yScale); })
        .style("stroke-dasharray", function(d) 
          { return this.getTotalLength(); })
        .style("stroke-dashoffset", function(d) 
          { return this.getTotalLength(); })
        .transition()
          .duration(this.drawParams.drawDuration)
          .delay(function(d, i) { return _this.drawParams.drawDuration * i; })
          .ease(d3.easeLinear)
          .style("fill-opacity", 0.25)
          .style("stroke-opacity", 0.5)
          .style("stroke-dashoffset", function(d) 
          { return 0+"px"; })
          .on("end", function() { d3.select(this).attr("class", "drawn"); });

    //Responsible for initializing glyph points for editing
    initGlyphData(enterGlyphs, _this.drawParams.xScale, _this.drawParams.yScale, _this);
};

//Factored click function with click/double-click semantics
Panel.prototype.clickFunction = function(d, i, gElement, dblClick) //if this can be referred to directly, it should be
{														//i.e. avoid aliases like _this
    var positionIndex;
    var _this = this;

	if(!this.clicked)
	{
		this.clicked = true;
    	var t = d3.timer(function(dt) //Click
		{

			if(dt > _this.clickLength || !_this.clicked)
			{
				if(!_this.clicked)
					t.stop();
				else
				{
					t.stop();
					_this.clicked = false;
					_this.clickSemantics(_this, gElement);
				}	
			}
		});
	}
	else
	{  
		this.clicked = false;
		dblClick();
	}
};

//Pass reference to panel for use in method-chaining
Panel.prototype.clickSemantics = function(_this, gElement)
{
	var drawing = false;
	var gSelect = d3.select(gElement);
	gSelect.selectAll("path").each(function(d, i) //Blocks inspection of undrawn glyphs
		{ if(d3.select(this).attr("class") === "undrawn") drawing = true; });
	if(!drawing)
	{
		_this.group.selectAll("g").each(function(d, i) //re-select elements in place
		{
		  if(d.index === gSelect.datum().index)                    
		  { positionIndex = i; }
		});
		_this.inspectGlyph(gElement, positionIndex);
	}
};

//Defaults to moving glyph to alphabet Panel
Panel.prototype.doubleClickSemantics = function(_this, gElement)
{
	var drawing = false;
	var gSelect = d3.select(gElement);
	gSelect.selectAll("path").each(function(d, i) //Blocks inspection of undrawn glyphs
		{ if(d3.select(this).attr("class") === "undrawn") drawing = true; });
	if(!drawing)
	{
        _this.group.selectAll("g").each(function(d, i) //Double-click
        {                	
          if(d.index === gSelect.datum().index)                    
          { positionIndex = i; }
        });

        alphabetize(gElement);
        toggleGlyphData(gSelect, false);
        _this.removeGlyph(_this, positionIndex);
        if(_this.totalTime === _this.stopTime)
        	_this.toggleGeneration();
    }
};

Panel.prototype.removeGlyph = function(_this, index){
	_this.glyphData.splice(index, 1);
	if(index === _this.expandedElement)
	{
		_this.expandedElement = Number.MAX_SAFE_INTEGER;
		_this.transformGlyphs(_this.collapse);
		return;
	}
	else if(index < _this.expandedElement)
	{
		_this.expandedElement--;
	}
	_this.transformGlyphs(_this.expand);
};

Panel.prototype.inspectGlyph = function(gElement, i)
  {
    this.lastExpanded = this.expandedElement;
    var positionFunc;
    if(i === this.expandedElement) 
    {
      this.expandedElement = Number.MAX_SAFE_INTEGER;
      positionFunc = this.collapse;
    }
    else {
      this.expandedElement = i;
      positionFunc = this.expand;
      toggleGlyphData(d3.select(gElement), true);
    }

    this.transformGlyphs(positionFunc);
  };

  //PositionFunction is collapse or expand
  Panel.prototype.transformGlyphs = function(positionFunction)
  {
  	var _this = this;
    this.group.selectAll("g").each(function(d, i) 
    {
      var groupElement = d3.select(this);
      var startTransform = parseTransform(groupElement.attr("transform"));
      var endTransform = positionFunction(i, _this); 
      if(i===_this.lastExpanded)
      { toggleGlyphData(groupElement, false); }
      groupElement.transition()
        .attrTween("transform", function(t)
        {
          return function(t)
          { 
            return interpolateTransform(t, startTransform, endTransform);
          };
        });
    });
  };

  Panel.prototype.positionGlyph = function(index, element)
      {
      	var offset = 0;
      	if(element != Number.MAX_SAFE_INTEGER && index > element)
      	{
      		var columnNumber = (element) % this.drawParams.glyphsX();
 			var emptyColumns = this.drawParams.inspectScale - (this.drawParams.glyphsX() - columnNumber);
 			if(emptyColumns < 0)
 				emptyColumns = 0;
	        var boundaryIndex = Math.floor((index - element - 1) / 
	        	(this.drawParams.glyphsX() - (this.drawParams.inspectScale - emptyColumns)))+1;
	        if(boundaryIndex > this.drawParams.inspectScale)
	        	boundaryIndex = this.drawParams.inspectScale;

	        offset = (boundaryIndex * (this.drawParams.inspectScale - emptyColumns)) - 1;
      	}

        var gY = Math.floor((index+offset) / this.drawParams.glyphsX());
        var gX = (offset+index) - (gY * this.drawParams.glyphsX());

        return "translate(" + this.drawParams.gScaleX(gX) + "," + this.drawParams.gScaleY(gY) + ") scale(1,1)";
      };

      //Adds false glyphs to make room for expanded element
      Panel.prototype.expand = function(i, panel)
      {  
        if(i >= panel.expandedElement) //Only position glyphs past the expanded element
        {       
          if(i === panel.expandedElement)
          { 
          	console.log(panel);
          	console.log(panel.name);
          	console.log(panel.drawParams.inspectScale);
            var transform = parseTransform(panel.positionGlyph(i, Number.MAX_SAFE_INTEGER));
            transform.scale = [panel.drawParams.inspectScale, panel.drawParams.inspectScale];
            return transform;
          }
          else
          {
            return parseTransform(panel.positionGlyph(i, panel.expandedElement));
          }
        }
        else
        {
          return parseTransform(panel.positionGlyph(i, Number.MAX_SAFE_INTEGER));
        }   
      };

      //Collapses transforms to return to default panel formatting
      Panel.prototype.collapse = function(i, panel)
      {
        return parseTransform(panel.positionGlyph(i, Number.MAX_SAFE_INTEGER));
      };
      