var margin = {top: 20, right: 20, bottom: 20, left: 20},
                        mWidth = 500 - margin.left - margin.right,
                        mHeight = 500 - margin.top - margin.bottom;

            var canvas = d3.select("body").append("svg")
                .attr("class", "container")
                .attr("width", (2*mWidth) + (margin.left) + (margin.right))
                .attr("height", (2*mHeight) + (margin.top) + (margin.bottom))

            d3.csv("bosque.csv", function(bosque)
            {
                var xRes = 12;
                var patchX = parseInt(canvas.style("width")) / xRes;
                var patchY = patchX;

                //Slice up the data by nesting on a per-plot basis
                var plots = d3.nest()
                    .key(function(data) { return data.V4; })
                    .entries(bosque);

                for(var i = 0; i < plots.length; i++)
                {
                    for(var j = 0; j < plots[i].values.length; j++)
                    {
                        plots[i].values[j].V5 = d3.randomUniform(patchX/4, 3*patchX/4)();
                        plots[i].values[j].V6 = d3.randomUniform(patchY/4, 3*patchY/4)();
                    }
                } console.log(plots);

                //Create an svg element for each plot?
                var patches = canvas.selectAll("patch").data(plots).enter()
                    .append("svg")
                        .attr("class", "patch")
                        .attr("x", function(d, i) 
                            { var mod = i%xRes; return mod * patchX; })
                        .attr("y", function(d, i)
                            { var tens = ((i - (i%xRes))/xRes); return tens * patchY; })
                        .attr("width", patchX)
                        .attr("height", patchY);

                var trees = patches.selectAll("trees").data(function(d) { return d.values; })
                    .enter().append("circle")
                            .attr("class", "tree")
                            .attr("cx", function(d) { return d.V5; })
                            .attr("cy", function(d) { return d.V6; })
                            .attr("r", function(d) { return d.V1 / patchX; })
                            .style("fill", "green")
                            .style("fill-opacity", function(d) 
                                { return parseInt(d.V3) === 1 ? 0.5:1.0; });
            });