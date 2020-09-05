// Get the data
d3.csv("/assets/csv/projects/featuresize.csv")
    .then(function(data) {
        //format data

        data.forEach(function(d) {
            d.key = d['Feature Link'];
            d.total = +d['Total'];
        });


        //****** SETUP DIVS ******//

        var margin = {
                top: 10,
                right: 50,
                bottom: 50,
                left: 50
            },
            width = $("#chart").width() - margin.left - margin.right,
            height = $(window).innerHeight() * 0.6 - margin.top - margin.bottom;

        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // create a tooltip
        var tooltip = d3.select("#chart")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden");

        // X axis: scale and draw:
        var xAxis = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.total)]) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
            .range([0, width]);

        var colourScheme = d3.scaleSequential().interpolator(piecewise(d3.interpolateRgb, ["white", "yellow"]))
            .domain([0, data.length]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axis")
            .call(d3.axisBottom(xAxis));

        // text label for the x axis
        svg.append("text")
            .attr("class", "axis")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 25) + ")")
            .style("text-anchor", "middle")
            .text("Size of Feature (Number of User Stories)");

        // set the parameters for the histogram
        var histogram = d3.histogram()
            .value(function(d) {
                return d.total;
            }) // I need to give the vector of value
            .domain(xAxis.domain()) // then the domain of the graphic
            .thresholds(xAxis.ticks(xAxis.domain()[1] / 2)); // then the numbers of bins

        // And apply this function to data to get the bins
        var bins = histogram(data);

        bins.unshift({
            x0: 0,
            x1: 0,
            length: 0
        })

        // Y axis: scale and draw:
        var yAxis = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(bins, function(d) {
                return d.length;
            })]);
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yAxis));

        // text label for the y axis
        svg.append("text")
            .attr("class", "axis")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Frequency");

        // append the bar rectangles to the svg element
        svg.selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 1)
            .attr("transform", function(d) {
                return "translate(" + xAxis(d.x0) + "," + yAxis(d.length) + ")";
            })
            .attr("width", function(d) {
                return xAxis(d.x1) - xAxis(d.x0) - 1;
            })
            .attr("height", function(d) {
                return height - yAxis(d.length);
            })
            .style("fill", "white")
            .style("opacity", 0.3);

        // define the line
        var valueline = d3.area()
            //.curve(d3.curveCatmullRom)
            .x(d => {
                return xAxis(d.x0) + (xAxis(d.x1) - xAxis(d.x0)) / 2;
            })
            .y0(yAxis(0))
            .y1(d => {
                return yAxis(d.length);
            });

        // Add the valueline path.
        var line = svg.append("path")
            .data([bins])
            .attr("class", "path")
            .attr("id", "areachart")
            .attr("clip-path", "url(#clip)")
            .attr("d", valueline)
            .style("stroke-width", "2px")
            .style("stroke", "#FDBB32")
            .style("fill", "#FDBB32")
            .style("fill-opacity", 0.2);

        // MOUSE OVER TOOLTIPS //

        var mouseG = svg.append("g")
            .attr("class", "mouse-over-effects");

        //vertical hover line
        var lineHover = mouseG.append("line")
            .attr("class", "mouse-line")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        var hoverCircle = mouseG
            .append("circle")
            .attr("id", "circle")
            .attr("class", "hoverCircle")
            .attr("r", 7)
            .style("stroke-width", "1px")
            .style("opacity", "0");

        mouseG.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mouseout", function() {
                d3.selectAll(".hoverCircle").transition().style("opacity", "0");
                d3.selectAll(".hoverBackground").transition().style("opacity", "0");
                d3.selectAll(".hoverText").transition().style("opacity", "0");
                d3.select("#areachart").transition().style("opacity", "0");
                tooltip.transition().style("visibility", "hidden");
                d3.selectAll(".bar").transition().style("opacity", 0.3)
            })
            .on("mouseover", function() {
                d3.selectAll(".hoverCircle").transition().style("opacity", "1");
                d3.selectAll(".hoverBackground").transition().style("opacity", "1");
                d3.selectAll(".hoverText").transition().style("opacity", "1");
                d3.select("#areachart").transition().style("opacity", "1");
                d3.selectAll(".bar").transition().style("opacity", 0.1)
            })
            .on("mousemove", function() {
                updateMouseOver(d3.mouse(this), bins);
            });

        // draw a circle
        svg.append("clipPath") // define a clip path
            .attr("id", "clip") // give the clipPath an ID
            .append("rect") // shape it as an ellipse
            .attr("x", 0) // position the x-centre
            .attr("y", 0) // position the y-centre
            .attr("width", width) // set the x radius
            .attr("height", height);

        var root = d3.select("svg");
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
            x: 10,
            y: 10
        };

        function updateMouseOver(mouse, table) {
            var offsetLeft = document.getElementById("chart").getBoundingClientRect().left;
            var accuracy = 1; //lower is better but slower;
            var padding = 2;
            var lineNode = line.node();
            var pathLength = lineNode.getTotalLength();
            var bisect = d3.bisector(d => d.x1).right;

            //draw line for each mouse update
            d3.selectAll(".mouse-line")
                .attr("x1", mouse[0])
                .attr("x2", mouse[0])
                .attr("y1", height)
                .attr("y2", 0);

            //update clip path
            d3.select("#clip").select("rect")
                .attr("width", mouse[0]);

            //get x value based on mouse value
            var x = d3.event.pageX - offsetLeft - margin.left - 14; //14 == circle radius * 2

            //get other values for given x value
            var lineItem = table[bisect(table, xAxis.invert(x))];
            var lineIndex = bisect(table, xAxis.invert(x));
            var totalFeatures = d3.sum(table.slice(0, lineIndex + 1), d => d.length);

            // UPDATE CYCLE HOVER //

            //update Cycle Path coordinates
            for (i = x; i < pathLength; i += accuracy) {
                var Pos = lineNode.getPointAtLength(i);
                if (Pos.x >= x) {
                    break;
                }
            }

            //update Cycle Path hover node
            d3.select("#circle")
                .style("fill", "white")
                .style("opacity", 1)
                .attr("cx", x)
                .attr("cy", Pos.y);

            //update tooltip
            var m = d3.mouse(root.node());
            scr.x = window.scrollX;
            scr.y = window.scrollY;
            //m[0] += svgpos.x;
            //m[1] += svgpos.y;
            tooltip.style("right", "");
            tooltip.style("left", "");
            tooltip.style("bottom", "");
            tooltip.style("top", "");
            tooltip.html("<p id='heading'><span style='color:#FDBB32;'> " + totalFeatures + " Features </span>(or " + d3.format(".0%")(totalFeatures / data.length) + " of the " + data.length + " Features recorded) <span style='color:#FDBB32;'><br>hold " + lineItem.x1 + " User Stories </span>or less within them.</p>");
            tooltip.style("height", $("#heading").height())
                //d3.format(".0%")(totalFeatures / data.length)
            if (m[0] > scr.x + scr.w / 2) {
                tooltip.style("left", (x + margin.left) + 15 + "px");
            } else {
                tooltip.style("left", (x + margin.left) + 15 + "px");
            }

            if (m[1] > scr.y + scr.h / 2) {
                tooltip.style("top", (Pos.y - $("#tooltip").height()) - 15 + "px");
            } else {
                tooltip.style("top", (Pos.y - $("#tooltip").height()) - 15 + "px");
            }
            tooltip.style("visibility", "visible");

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
    })