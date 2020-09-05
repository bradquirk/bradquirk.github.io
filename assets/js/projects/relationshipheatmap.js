        //test for mobile
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ||
            (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform))) {
            //mobile
            $('#chart').append('<img src="../../img/portfolio/cards/relationship-heatmap_card.png"/>');
            $('#chart').append('<p>For the interactive version, please visit this site on desktop!</p>');
            d3.select("#header")
                .html("<h3 class='amber-text'>Relationship Heatmap</h3><h6>version 1.0</h6>");
        } else {
            var margin = {
                    top: 10,
                    right: 200,
                    bottom: 150,
                    left: 150
                },
                tooltipMargin = {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 60
                },
                width = $("#chart").width() - margin.left - margin.right,
                height = $(window).innerHeight() * 0.6 - margin.top - margin.bottom,
                tooltipWidth = $(window).innerHeight() * 0.4 - tooltipMargin.left - tooltipMargin.right,
                tooltipHeight = $(window).innerHeight() * 0.4 - tooltipMargin.top - tooltipMargin.bottom;

            //****** SETUP TOOLTIP ******//

            // create a tooltip
            var tooltip = d3.select("#chart")
                .append("div")
                .attr("id", "tooltip")
                .style("max-width", tooltipWidth * 1.2)
                .style("position", "absolute")
                .style("visibility", "hidden");

            tooltipSVG = tooltip.append("p")
                .attr("id", "tooltipText")
                .attr("font-size", "0.5em");

            tooltipSVG = tooltip.append("svg")
                .attr("width", tooltipWidth + tooltipMargin.left + tooltipMargin.right)
                .attr("height", tooltipHeight + tooltipMargin.top + tooltipMargin.bottom)
                .style("background-color", "#333")
                .append("g")
                .attr("transform",
                    "translate(" + tooltipMargin.left + "," + tooltipMargin.top + ")");;

            var tooltipX = d3.scaleLinear()
                .domain([0, 1])
                .range([0, tooltipWidth]);

            tooltipSVG.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (tooltipHeight) + ")")
                .call(d3.axisBottom(tooltipX));

            // text label for the x axis
            tooltipSVG.append("text")
                .attr("id", "tooltipXText")
                .attr("transform",
                    "translate(" + (tooltipWidth / 2) + " ," +
                    (tooltipHeight + tooltipMargin.top + 20) + ")")
                .style("text-anchor", "middle");

            var tooltipY = d3.scaleLinear()
                .domain([0, 1])
                .range([tooltipHeight, 0]);

            tooltipSVG.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(tooltipY));

            // text label for the y axis
            tooltipSVG.append("text")
                .attr("id", "tooltipYText")
                .attr("transform", "rotate(-90)")
                //.attr("y", 0 - tooltipMargin.left)
                .attr("x", 0 - (tooltipHeight / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle");

            d3.select("#tooltipYText")
                .attr("y", 0 - tooltipMargin.left)

            //append scatter group
            tooltipSVG.append("g")
                .attr("id", "scatterGroup");

            //define path
            var PearsonPath = d3.line()
                .x(d => tooltipX(d.xValues))
                .y(d => tooltipY(d.yValues));

            //append line group
            tooltipSVG.append("path")
                .attr("id", "tooltipLine")
                .attr("stroke-width", "1px")
                .style("stroke", "white");

            //add text to line
            tooltipSVG.append("text")
                .append("textPath")
                .attr("id", "tooltipLineText")
                .attr("xlink:href", "#tooltipLine")
                .attr("startOffset", "50%")
                .style("text-anchor", "middle")
                .style("fill", "white")
                .style("dy", -10);
            //****** END SETUP TOOLTIP ******//

            //****** PREPARE DATA ******//

            var dataTable = [];

            //format data table
            d3.csv("/assets/csv/projects/relationshipheatmap.csv")
                .then(function(data) {

                    var traits = d3.keys(data[0]).filter(function(d) {
                            return d !== "key" && d !== "index";
                        }),
                        n = traits.length;

                    for (var i = 0; i < traits.length; i++) {
                        for (var j = 0; j < traits.length; j++) {
                            var bestFit = {};
                            var xVals = data.map(d => +d[traits[i]]);
                            var yVals = data.map(d => +d[traits[j]]);
                            leastSquares(xVals, yVals, true, bestFit);

                            //ensure there are enough unique values to draw a line of best fit (3 points or more)
                            if (xVals.filter((item, i, ar) => ar.indexOf(item) === i).length >= 3 && yVals.filter((item, i, ar) => ar.indexOf(item) === i).length >= 3) {

                                //determine line of best fit properties
                                dataTable.push({
                                    xName: traits[i],
                                    yName: traits[j],
                                    xValues: xVals,
                                    yValues: yVals,
                                    linReg: bestFit,
                                    pearson: Math.pow(corr(xVals, yVals), 2)
                                });
                            }
                        }
                    }

                    //create new traits based on the new set of values
                    traits = dataTable.map(d => d.xName).filter((item, i, ar) => ar.indexOf(item) === i)

                    //****** END PREPARE DATA ******//

                    //****** BUILD CHART ******//

                    var svg = d3.select("#chart")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");

                    // Build X scales and axis:
                    var x = d3.scaleBand()
                        .range([0, width])
                        .domain(traits)
                        .padding(0.01);
                    svg.append("g")
                        .attr("transform", "translate(0," + height + ")")
                        .call(d3.axisBottom(x))
                        .selectAll("text")
                        .attr("class", "axisValues")
                        .attr("id", d => "xAxis" + camelise(d.replace('(', ' ').replace(')', ' ')))
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", "rotate(-45)")

                    // Build X scales and axis:
                    var y = d3.scaleBand()
                        .range([height, 0])
                        .domain(traits.reverse())
                        .padding(0.01);
                    svg.append("g")
                        .call(d3.axisLeft(y))
                        .selectAll("text")
                        .attr("class", "axisValues")
                        .attr("id", d => "yAxis" + camelise(d.replace('(', ' ').replace(')', ' ')));

                    // Build color scale
                    var cellColour = d3.scaleSequential().interpolator(d3.interpolateWarm);
                    var scatterColour = d3.scaleSequential().interpolator(d3.interpolateWarm);

                    //add cells
                    svg.selectAll()
                        .data(dataTable)
                        .enter()
                        .append("rect")
                        .attr("x", function(d) {
                            return x(d.xName)
                        })
                        .attr("y", function(d) {
                            return y(d.yName)
                        })
                        .attr("width", x.bandwidth())
                        .attr("height", y.bandwidth())
                        .style("fill", d => {
                            if (d.xName == d.yName || d.xValues.filter(e => e > 0).length <= 1 || d.yValues.filter(e => e > 0).length <= 1) {
                                return "#333"
                            } else return cellColour(d.pearson)
                        })
                        .attr("box-sizing", "border-box")
                        .on("mouseout", function() {
                            d3.selectAll('.axisValues').transition().attr('fill', "white");
                            tooltip.transition().style("visibility", "hidden");
                        })
                        .on("mouseover", function(d) {
                            d3.select('#xAxis' + camelise(d.xName.replace('(', ' ').replace(')', ' '))).transition().attr('fill', cellColour(0.5));
                            d3.select('#yAxis' + camelise(d.yName.replace('(', ' ').replace(')', ' '))).transition().attr('fill', cellColour(0.5));

                            updateMouseOver(d3.mouse(this), d);
                        })
                        .on("mousemove", function(d) {
                            updateMouseOver(d3.mouse(this), d);
                        });

                    //Draw the legend

                    var legendColours = d3.range(20).map(d => cellColour(d / 20)).reverse();
                    var defs = svg.append("defs");

                    //Calculate the gradient  
                    defs.append("linearGradient")
                        .attr("id", "gradient-colors")
                        .attr("x1", "0%").attr("y1", "0%")
                        .attr("x2", "0%").attr("y2", "100%")
                        .selectAll("stop")
                        .data(legendColours)
                        .enter().append("stop")
                        .attr("offset", function(d, i) {
                            return i / (legendColours.length - 1);
                        })
                        .attr("stop-color", function(d) {
                            return d;
                        });

                    //Color Legend container
                    var legendsvg = svg.append("g")
                        .attr("class", "legendWrapper")
                        .attr("transform", "translate(" + (width + 10) + "," + (margin.top) + ")");

                    //Draw the Rectangle
                    legendsvg.append("rect")
                        .attr("class", "legendRect")
                        //.attr("x", -legendWidth / 2)
                        .attr("y", 10)
                        .attr("width", "15px")
                        .attr("height", height / 2)
                        .style("fill", "url(#gradient-colors)");

                    //Append title
                    legendsvg.append("text")
                        .attr("class", "legendTitle")
                        .text("Relationship Strength");

                    //Set scale for x-axis
                    var yLegendScale = d3.scaleLinear()
                        .domain([0, 1])
                        .range([height / 2 - 1, 0]);

                    //Set up X axis
                    legendsvg.append("g")
                        .attr("class", "legendAxis") //Assign "axis" class
                        .attr("transform", "translate(" + (15) + "," + (10) + ")")
                        .call(d3.axisRight(yLegendScale)
                            .ticks(5)
                            .tickFormat(d3.format(".0%")))
                        .selectAll("path")
                        .style("stroke", "none");

                    //perform once-off mouseover calculations
                    var root = svg;
                    var scr = {
                        x: window.scrollX,
                        y: window.scrollY,
                        w: window.innerWidth,
                        h: window.innerHeight
                    };

                    // it's jolly rotten but <body> width/height can be smaller than the SVG it's carrying inside! :-((
                    var body_sel = d3.select('#chart');
                    // this is browser-dependent, but screw that for now!
                    var body = {
                        w: body_sel.node().offsetWidth,
                        h: body_sel.node().offsetHeight
                    };
                    var doc = {
                        w: document.width,
                        h: document.height
                    };
                    var svgpos = getNodePos(root.node());
                    var dist = {
                        x: 15,
                        y: 15
                    };

                    var chart = $("#chart").position();

                    function camelise(str) {
                        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
                            if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
                            return index == 0 ? match.toLowerCase() : match.toUpperCase();
                        });
                    }

                    function piecewise(interpolate, values) {
                        var i = 0,
                            n = values.length - 1,
                            v = values[0],
                            I = new Array(n < 0 ? 0 : n);
                        while (i < n) I[i] = interpolate(v, v = values[++i]);
                        return function(t) {
                            var i = Math.max(0, Math.min(n - 1, Math.floor(t *= n)));
                            return I[i](t - i);
                        };
                    }

                    function pythagorean(sideA, sideB) {
                        return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
                    }

                    function leastSquares(X, Y, computeError, ret) {
                        if (typeof computeError == 'object') {
                            ret = computeError
                            computeError = false
                        }

                        if (typeof ret == 'undefined') ret = {}

                        var sumX = 0
                        var sumY = 0
                        var sumXY = 0
                        var sumXSq = 0
                        var N = X.length

                        for (var i = 0; i < N; ++i) {
                            sumX += X[i]
                            sumY += Y[i]
                            sumXY += X[i] * Y[i]
                            sumXSq += X[i] * X[i]
                        }

                        ret.m = ((sumXY - sumX * sumY / N)) / (sumXSq - sumX * sumX / N)
                        ret.b = sumY / N - ret.m * sumX / N

                        if (computeError) {
                            var varSum = 0
                            for (var j = 0; j < N; ++j) {
                                varSum += (Y[j] - ret.b - ret.m * X[j]) * (Y[j] - ret.b - ret.m * X[j])
                            }

                            var delta = N * sumXSq - sumX * sumX
                            var vari = 1.0 / (N - 2.0) * varSum

                            ret.bErr = Math.sqrt(vari / delta * sumXSq)
                            ret.mErr = Math.sqrt(N / delta * vari)
                        }

                        return function(x) {
                            return ret.m * x + ret.b
                        }
                    }

                    function corr(d1, d2) {
                        let {
                            min,
                            pow,
                            sqrt
                        } = Math
                        let add = (a, b) => a + b
                        let n = min(d1.length, d2.length)
                        if (n === 0) {
                            return 0
                        }
                        [d1, d2] = [d1.slice(0, n), d2.slice(0, n)]
                        let [sum1, sum2] = [d1, d2].map(l => l.reduce(add))
                        let [pow1, pow2] = [d1, d2].map(l => l.reduce((a, b) => a + pow(b, 2), 0))
                        let mulSum = d1.map((n, i) => n * d2[i]).reduce(add)
                        let dense = sqrt((pow1 - pow(sum1, 2) / n) * (pow2 - pow(sum2, 2) / n))
                        if (dense === 0) {
                            return 0
                        }
                        return (mulSum - (sum1 * sum2 / n)) / dense
                    }

                    function updateMouseOver(mouse, table) {
                        var offsetLeft = document.getElementById("chart").offsetLeft;
                        //get x value based on mouse value
                        var x = d3.event.pageX - offsetLeft - margin.left;

                        tooltipSVG.select(".x").transition().call(d3.axisBottom(tooltipX));
                        tooltipSVG.select(".y").transition().call(d3.axisLeft(tooltipY));

                        //update tooltip
                        var m = d3.mouse(root.node());
                        scr.x = window.scrollX;
                        scr.y = window.scrollY;
                        m[0] += svgpos.x;
                        m[1] += svgpos.y;
                        tooltip.style("right", "");
                        tooltip.style("left", "");
                        tooltip.style("bottom", "");
                        tooltip.style("top", "");
                        d3.select("#tooltipText").html(table.xName + " vs. " + table.yName + "</br>Strength: <span style='color:" + cellColour(table.pearson) + ";'>" + d3.format(".0%")(table.pearson) + "</span>")
                        tooltip.style("height", $("#heading").height())
                        if (m[0] > $(window).innerWidth() / 2) {
                            tooltip.style("left", (event.clientX - chart.left - dist.x - $("#tooltip").width()) + "px");
                        } else {
                            tooltip.style("left", (event.clientX - chart.left + dist.x) + "px");
                        }

                        if (m[1] > $(window).innerHeight() / 2) {
                            tooltip.style("top", (event.clientY - chart.top - dist.y - $("#tooltip").height()) + "px");
                        } else {
                            tooltip.style("top", (event.clientY - chart.top + dist.y) + "px");
                        }
                        tooltip.style("visibility", "visible");

                        var circleData = [];
                        var values = table.xValues;

                        for (var i = values.length - 1; i >= 0; i--) {
                            circleData.push({
                                xValues: table.xValues[i],
                                yValues: table.yValues[i]
                            })
                        }

                        //update axes
                        tooltipX.domain([0, d3.max(table.xValues)]);
                        tooltipY.domain([0, d3.max(table.yValues)]);
                        scatterColour.domain(tooltipX.domain());

                        //update scatter plot
                        var circle = tooltipSVG.select("#scatterGroup").selectAll("circle").data(circleData);
                        circle.exit().remove();
                        circle.enter().append("circle").attr("r", 0);

                        //update all circles to new positions
                        circle.transition()
                            .attr("cx", d => tooltipX(d.xValues))
                            .attr("cy", d => tooltipY(d.yValues))
                            .attr("r", 3)
                            .style("opacity", 0.5)
                            .attr("fill", d => scatterColour((d.xValues)));

                        //generate path data
                        var pathData = [];

                        var linReg = table.linReg;

                        for (var i = 0; i < tooltipX.domain()[1]; i += tooltipX.domain()[1] / 50) {
                            pathData.push({
                                xValues: i,
                                yValues: linReg.m * i + linReg.b
                            })
                        }

                        //remove path data that exceeds y domain
                        pathData = pathData.filter(d => d.xValues >= tooltipX.domain()[0] && d.xValues <= tooltipX.domain()[1] &&
                            d.yValues >= tooltipY.domain()[0] && d.yValues <= tooltipY.domain()[1]);

                        // Create a update selection: bind to the new data
                        var tooltipLine = tooltipSVG.selectAll("#tooltipLine")
                            .data([pathData]);

                        // Update the line
                        tooltipLine
                            .enter()
                            .append("path")
                            .attr("id", "tooltipLine")
                            .merge(tooltipLine)
                            .transition()
                            .attr("d", PearsonPath)
                            .attr("fill", "none")
                            .attr("stroke-width", 2.5)

                        //update the line text
                        d3.select("#tooltipLineText").text(function() {
                            if (linReg.b > 0) {
                                return "y = " + linReg.m.toFixed(2) + "*x + " + linReg.b.toFixed(2);
                            } else return "y = " + linReg.m.toFixed(2) + "*x " + linReg.b.toFixed(2);
                        })

                        //update the axis text
                        d3.select("#tooltipXText").text(table.xName);
                        d3.select("#tooltipYText").text(table.yName);
                    }

                    function getNodePos(el) {
                        var body = d3.select('body').node();

                        for (var lx = 0, ly = 0; el != null && el != body; lx += (el.offsetLeft || el.clientLeft), ly += (el.offsetTop || el.clientTop), el = (el.offsetParent || el.parentNode))
                        ;
                        return {
                            x: lx,
                            y: ly
                        };
                    }
                });
        }