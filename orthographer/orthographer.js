      function strokeInterpret(datum, scaleX, scaleY)
      {
        var path = d3.path();
        for(var c = 0; c < datum.length; c++)
        {
          for(var i  = 0; i < datum.length; i++)
          {
            var point = datum[i];
            var pointX = scaleX(point.x);
            var pointY = scaleY(point.y);
            
            switch(point.type)
            {
              case 'M':
                path.moveTo(pointX, pointY);
                break;
              case 'L':
                path.lineTo(pointX, pointY);
                break ;
              case 'Q':
                path.quadraticCurveTo(scaleX(point.x1), scaleY(point.y1), pointX, pointY);
                break;
              case 'C':
                path.bezierCurveTo(scaleX(point.x1), scaleY(point.y1), 
                  scaleX(point.x2), scaleY(point.y2), pointX, pointY);
                break;
              case 'Z':                                    
                path.closePath();
                break;
              default:
                console.log("Uninterpretable symbol. Check path generation algorithm");
            }
          }
        }
        
        return path.toString();
      }

            //Cut glyphs into strokes separated by 'M' symbols
      function glyphsToStrokes(glyphData)
      {
        var strokeData = [];
        for(var i = 0; i < glyphData.length; i++)
        {
          strokeData[i] = glyphToStrokes(glyphData[i]);
        }
        return strokeData;
      }

      //The following two functions mimic <opentype.js> objects in a d3-friendly rendering format
      //Takes an <opentype.js> Glyph object and converts it into an array of stroke data
      function glyphToStrokes(glyphData)
      {
        var glyphObject = new Object();
        glyphObject.strokes = [];
        glyphObject.index = glyphData.index;
        glyphObject.glyph = glyphData;

        //Loop through stroke data and access path list as needed
        for(var i = 0; i < glyphData.strokeData.length; i++)
        {
          var stroke = glyphData.strokeData[i];
          var strokeObject = new Object();
          strokeObject.type = stroke.type;
          strokeObject.color = stroke.color;

          var flipStart = JSON.parse(JSON.stringify(stroke.start));
          flipStart.y = MirrorY(flipStart.y);
          strokeObject.start = flipStart;

          var flipEnd = JSON.parse(JSON.stringify(stroke.end));
          flipEnd.y = MirrorY(flipEnd.y);
          strokeObject.end = flipEnd;

          copyStroke(stroke, glyphData.path, strokeObject, i);
          glyphObject.strokes.push(strokeObject);
        }

        return glyphObject;
      }

      //Takes an opentype path commmand and converts to a d3-renderable stroke object
      //This function was factored for use in editing glyphs interactively
      function copyStroke(stroke, glyphPath, strokeObject, index)
      {
        strokeObject.contours = [];
        //Exactly 5 path symbols per stroke: MLXLX, where X is L | Q | C
        for(var j = 0; j < 5; j++)
        {
          var flipPoint = JSON.parse(JSON.stringify(glyphPath.commands[(index*5)+j]));
          if(flipPoint.type === 'Q' || flipPoint.type === 'C')
          {
            flipPoint.y1 = MirrorY(flipPoint.y1);
            
            var flipCp1 = JSON.parse(JSON.stringify(stroke.cp1));
            flipCp1.y = MirrorY(flipCp1.y);
            strokeObject.cp1 = flipCp1;

            if(flipPoint.type === 'C')
            {
              flipPoint.y2 = MirrorY(flipPoint.y2);

              var flipCp2 = JSON.parse(JSON.stringify(stroke.cp2));
              flipCp2.y = MirrorY(flipCp2.y);
              strokeObject.cp2 = flipCp2;
            }
          }
          flipPoint.y = MirrorY(flipPoint.y);
          strokeObject.contours.push(flipPoint);
        }
      }

      function interpolateTransform(t, startT, endT)
      {
        var is = d3.interpolateNumber(startT.scale[0], endT.scale[0]);
        var tsx = d3.interpolateNumber(startT.translate[0], endT.translate[0]);
        var tsy = d3.interpolateNumber(startT.translate[1], endT.translate[1]);
        newTrans = "translate("+tsx(t)+","+tsy(t)+"),scale("+is(t)+","+is(t)+")";
        return newTrans;
      }

      function parseTransform (a)
      {
          var b={};
          for (var i in a = a.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?)+\))+/g))
          {
              var c = a[i].match(/[\w\.\-]+/g);
              b[c.shift()] = c;
          }
          return b;
      }

      //Helper for anonymously calling methods with a list of arguments
      function partial(func /*, 0..n args */) 
      {
        var args = Array.prototype.slice.call(arguments, 1);
        return function() {
          var allArguments = args.concat(Array.prototype.slice.call(arguments));
          return func.apply(this, allArguments);
        };
      }

      function toggleGlyphData(glyph, up)
      {
        var radius = up ? 2 : 0;
        
        //Draw stroke elements for interactive editing
        var startPoints = glyph.selectAll("circle.start").attr("r", radius);
        var endPoints = glyph.selectAll("circle.end").attr("r", radius);
        var controlPoints1 = glyph.selectAll("circle.cp1").attr("r", radius);
        var controlPoints2 = glyph.selectAll("circle.cp2").attr("r", radius);

        glyph.selectAll("path").transition()
          .style("fill", function(d) { if(up) return d.color; else return 'black'; })
          .style("stroke",function(d) { if(up) return d.color; else return 'black'; });
      }

      //Transfer elements to the alphabet panel and disable inappropriate callbacks
      function alphabetize(gElement)
      {
        var glyphElement = d3.select(gElement);
        alphabetPanel.group.append(function() { return gElement; });
        alphabetPanel.glyphData.push(glyphElement.datum());
        if(alphabetPanel.glyphsFull())
        {
          alphabetPanel.showFullButton();
        }
        else
        {
          console.log(alphabetPanel.drawParams.glyphsX());
          console.log(alphabetPanel.drawParams.glyphsY());
          console.log(alphabetPanel.glyphData.length);
        }
        alphabetPanel.group.select("g.draw").attr("class", "font").select("rect").on("click", function(d, i)
          { 
            var gElement = this.parentNode;           //Pass function reference with list of arguments
            alphabetPanel.clickFunction(d, i, gElement, partial(function(ap, i)
              {
                d3.select(gElement).remove();
                alphabetPanel.removeGlyph(ap, i); 
              }, alphabetPanel, alphabetPanel.glyphData.length-1)); //position is length of current dataset
          }).attr("fill", alphabetPanel.drawParams.boxColor);
        
        var startTransform = parseTransform(glyphElement.attr("transform"));
        var endTransform = alphabetPanel.collapse(alphabetPanel.glyphData.length - 1, alphabetPanel);

        glyphElement.transition()
        .attrTween("transform", function(t)
            {
              return function(t)
              { 
                return interpolateTransform(t, startTransform, endTransform);
              };
            });
      }

      function initGlyphData(glyphs, x, y)
      {
        //Draw stroke elements for interactive editing
        var startPoints = glyphs.selectAll("circle.start").data(function(d, i)
                            { return d.strokes; });
        startPoints.enter()
          .append("circle")
            .attr("class", "start")
            .attr("cx", function(d) { return x(d.start.x); })
            .attr("cy", function(d) { return y(d.start.y); })
            .attr("r", 0)
            .style("fill", function(d) { return d.color; })
            .style("stroke", 'black')
            .call(d3.drag().on("drag", function(d, i) { dragFunction(this, d3.event, i, x, y); }))
            .on("click", function(d)
              {
                editFunction();
              });

        var endPoints = glyphs.selectAll("circle.end").data(function(d, i)
                            { return d.strokes; });
        endPoints.enter()
          .append("circle")
            .attr("class", "end")
            .attr("cx", function(d) { return x(d.end.x); })
            .attr("cy", function(d) { return y(d.end.y); })
            .attr("r", 0)
            .style("fill", function(d) { return d.color; })
            .style("stroke", 'black')
            .call(d3.drag().on("drag", function(d, i) { dragFunction(this, d3.event, i, x, y); }))
            .on("click", function(d)
              {
                editFunction();
              });
        //Select cubic and quadratic strokes
        var controlPoints1 = glyphs.selectAll("circle.cp1").data(function(d, i)
                            { 
                              var qcCollect = [];
                              for(var i = 0; i < d.strokes.length; i++) 
                              {
                                if(d.strokes[i].type === 'Q' || d.strokes[i].type === 'C')
                                {
                                  d.strokes[i].index = i;
                                  qcCollect.push(d.strokes[i]);
                                }                               }
                              return qcCollect; 
                            });
        controlPoints1.enter()
          .append("circle")
            .attr("class", "cp1")
            .attr("cx", function(d) { return x(d.cp1.x); })
            .attr("cy", function(d) { return y(d.cp1.y); })
            .attr("r", 0)
            .style("fill", function(d) { return d.color; })
            .style("stroke", 'white')
            .call(d3.drag().on("drag", function(d, i) { dragFunction(this, d3.event, d.index, x, y); }))
            .on("click", function(d)
              {
                editFunction();
              });

        //Select cubic strokes
        var controlPoints2 = glyphs.selectAll("circle.cp2").data(function(d, i)
                            {                               
                              var cCollect = [];
                              for(var i = 0; i < d.strokes.length; i++) 
                              {
                                if(d.strokes[i].type === 'C')
                                {
                                  d.strokes[i].index = i;
                                  cCollect.push(d.strokes[i]);
                                }
                              }
                              return cCollect; });
        controlPoints2.enter()
          .append("circle")
            .attr("class", "cp2")
            .attr("cx", function(d) { return x(d.cp2.x); })
            .attr("cy", function(d) { return y(d.cp2.y); })
            .attr("r", 0)
            .style("fill", function(d) { return d.color; })
            .style("stroke", 'white')
            .call(d3.drag().on("drag", function(d, i) { dragFunction(this, d3.event, d.index, x, y); }))
            .on("click", function(d)
              {
                editFunction();
              });
      }

      function editFunction()
      {
        if(d3.event.defaultPrevented)   //Drag detection - click up is "Default behaviour" for click
        {
          return;  
        }
      }

      function dragFunction(element, event, index, x, y)
      {
        var selection = d3.select(element);
        selection.attr("cx", event.x).attr("cy", event.y);
        var pointType = selection.attr("class");

        //Get the Victor object on the current datum and change by d/dt
        /*var pos = selection.datum()[pointType];
        var newPos = new Victor(pos.x, pos.y).add(new Victor(event.dx, event.dy));
        selection.datum()[selection.attr("class")] = newPos;
        d3.select(element.parentNode).selectAll("path")
          .filter(function(d, i) { return i === index;})
            .attr("d", function(d) 
              { var newPath = strokeInterpret(d.contours, x, y); return newPath; });*/

        //Modify underlying opentype data - be sure to invert to glyph space
        var idx = x.invert(event.dx);
        var idy = y.invert(-1*event.dy);
        var opentypeGlyph = d3.select(element.parentNode).datum().glyph;
        var opentypePath = opentypeGlyph.path;
        var startIndex = index*5;

        switch(pointType)
        {
          case "start":
            opentypePath.commands[startIndex].x += idx;
            opentypePath.commands[startIndex].y += idy;
            opentypePath.commands[startIndex+1].x += idx;
            opentypePath.commands[startIndex+1].y += idy;
            opentypePath.commands[startIndex+4].x += idx;
            opentypePath.commands[startIndex+4].y += idy;
          break;
          case "end":
            opentypePath.commands[startIndex+2].x += idx;
            opentypePath.commands[startIndex+2].y += idy;
            opentypePath.commands[startIndex+3].x += idx;
            opentypePath.commands[startIndex+3].y += idy;
          break;
          case "cp1":
            opentypePath.commands[startIndex+2].x1 += idx;
            opentypePath.commands[startIndex+2].y1 += idy;
            opentypePath.commands[startIndex+4].x1 += idx;
            opentypePath.commands[startIndex+4].y1 += idy;
          break;
          case "cp2":
            opentypePath.commands[startIndex+2].x2 += idx;
            opentypePath.commands[startIndex+2].y2 += idy;
            opentypePath.commands[startIndex+4].x2 += idx;
            opentypePath.commands[startIndex+4].y2 += idy;
          break;
          default:
            console.log("Point type not recognized");
        }
        opentypeGlyph.path = opentypePath;
        copyStroke(opentypeGlyph.strokeData[index], opentypeGlyph.path, selection.datum(), index);

        //Manually update the new path
        d3.select(element.parentNode).selectAll("path")
          .filter(function(d, i) { return i === index;})
            .attr("d", function(d) 
              { var newPath = strokeInterpret(d.contours, x, y); return newPath; });
      }