// Get the data
d3.csv("/assets/csv/projects/cycletimehorizon.csv")
    .then(function(data) {

        //****** STYLE GUIDE ******//

        var colourPallete = {
            backgroundColour1: '#333333', //grey
            backgroundColour2: 'black',
            colour1: '#FBB03B', //yellow
            colour2: '#D4145A', //orange
            colour3: '#00FFFF', //aqua
            colour4: '#00FFA1', //blue
        };

        var styleGuide = {
            xAxis: 'white',
            releaseLine: 'white',
            mouseoverSelectedNode: colourPallete.colour3,
            mouseoverConnectedNode: colourPallete.colour4,
            mouseoverUnconnectedNode: colourPallete.colour1,
            nodeColour: '#2E2E2E',
            nodeOpacity: 0.2,
            nodeSelectedOpacity: 0.2,
            nodeUnselectedOpacity: 0.1,
            linkOpacity: 0.7,
            linkSelectedOpacity: 1,
            linkUnselectedOpacity: 0.1,
        };


        //****** END STYLE GUIDE ******//

        // //****** PREPARE DATA ******//

        //the v4 version of parseTime
        var parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S");
        var formatDate = d3.timeFormat("%Y-%m-%d");
        var formatSummaryDate = d3.timeFormat("%d-%m-%Y");
        var parseTime = d3.timeParse("%Y-%m-%d");
        var emptyDate = formatDate(parseDate(0));

        data.forEach(function(d) {
            d.key = d['Key'];
            d.inProgressDate = formatDate(parseDate(d['First In Progress Date']));
            d.resolvedDate = formatDate(parseDate(d['Last Resolved Date']));
        });

        //group data by resolved/inprogress date pairing
        var cycleTable = d3.nest()
            .key(d => d.inProgressDate).sortKeys(d3.ascending)
            .key(d => d.resolvedDate).sortKeys(d3.ascending)
            .rollup(d => d.length)
            .entries(data);

        //remove empty values and create cycle time links
        cycleTable.forEach((d, i) => {
            if (d.key != emptyDate) {

                for (var j = 0; j < d.values.length; j++) {
                    if (d.values[j].key != emptyDate) {
                        d.source = parseTime(d.key);
                        d.target = parseTime(d.values[j].key);
                        d.count = d.values[j].value;
                    }
                }

                delete d.key;
                delete d.values;
            }
        })

        //group data by resolved date
        var resolvedTable = d3.nest()
            .key(d => d.resolvedDate).sortKeys(d3.ascending)
            .rollup(d => d.length)
            .entries(data);

        var cfd = 0;

        //remove empty values and find cfd of count
        resolvedTable.forEach((d, i) => {
            if (d.key == emptyDate) resolvedTable.shift();
            else d.key = parseTime(d.key);

            if (i == 0) cfd = d.value;
            else cfd += d.value;

            d.cfd = cfd;
        })

        //create nodes table
        var nodesTable = resolvedTable;

        //    //add resolved values

        //sort by date
        nodesTable.sort((a, b) => {
            return d3.ascending(a.key, b.key);
        })

        //remove empty values
        nodesTable = nodesTable.filter(d => formatDate(d.key) != emptyDate);

        //****** END PREPARE DATA ******//

        //****** CREATE CYCLE CHART ******//

        // LINKS //

        // set the dimensions and margins of the graph
        var margin = {
                top: 20,
                right: 40,
                bottom: 40,
                left: 40
            },
            width = $("#cycleChart").width() - margin.left - margin.right,
            height = $(window).innerHeight() * 0.3 - margin.top - margin.bottom;

        // append the svg obgect to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var cycleSVG = d3.select("#cycleChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        var cycleLayer = cycleSVG.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //add heading
        cycleLayer
            .append("text")
            .attr("id", "wew")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (width) / 2 + ",0)")
            .attr("dy", "0.35em")
            .text("Lifecyle (Cycle Time) of Each Release");

        // set the ranges
        var cycleXAxis = d3.scaleTime().range([0, width]);
        var cycleYAxis = d3.scaleLinear().range([height, 0]);

        //set the domains
        cycleXAxis.domain([d3.min(cycleTable, d => d.source), d3.max(cycleTable, d => d.target)]);
        //cycleXAxis.domain(d3.extent(nodesTable, d => d.key));
        cycleYAxis.domain([0, d3.max(cycleTable, d => d.count)]);

        var nodeSize = d3.scaleLinear()
            .domain(d3.extent(nodesTable, d => d.value))
            .range([5, 15]);

        var linkColorScaleInProgress = d3.scaleSequential().interpolator(piecewise(d3.interpolateHcl, ["#D19E1F", "#CC3B43"]))
            .domain(d3.extent(cycleTable, d => cycleXAxis(d.target) - cycleXAxis(d.source)));

        var releaseColour = d3.scaleSequential().interpolator(piecewise(d3.interpolateHcl, ["#6D469D", "#37B96A"]))
            .domain(d3.extent(nodesTable, (d, i) => i));

        var linkHighlightedColorScale = d3.scaleLinear()
            .domain(d3.extent(cycleTable, d => cycleXAxis(d.target) - cycleXAxis(d.source)))
            .range([colourPallete.colour3, colourPallete.colour4]);

        var countScale = d3.scaleLinear()
            .domain(d3.extent(cycleTable, d => d.count))
            .range([2, 5]);

        //standard arc
        var arc = d3.arc()
            .innerRadius(d => ((cycleXAxis(d.target) - cycleXAxis(d.source)) / 2) - countScale(d.count))
            .outerRadius(d => (cycleXAxis(d.target) - cycleXAxis(d.source)) / 2);

        var nodeArc = d3.arc()
            .innerRadius(d => 0)
            .outerRadius(d => nodeSize(d.value));

        var inProgressLink = cycleLayer.append('g').selectAll("path")
            .data(cycleTable)
            .enter()
            .append('path')
            .attr('class', 'arc')
            .attr('id', d => 'inProgress_' + formatDate(d.source) + '_' + formatDate(d.target))
            .attr('source', d => formatDate(d.source))
            .attr('target', d => formatDate(d.target))
            .attr("transform", d => "translate(" + (cycleXAxis(d.target) - ((cycleXAxis(d.target) - cycleXAxis(d.source)) / 2)) + "," + height + ")")
            .style('fill', d => linkColorScaleInProgress(cycleXAxis(d.target) - cycleXAxis(d.source)))
            .style('opacity', styleGuide.linkOpacity)
            .attr('d', arc
                .startAngle(Math.PI * 1.5)
                .endAngle(Math.PI * 2.5))
            .on("mouseover", d => {
                releaseLineHighlight
                    .style("stroke", function(o) {
                        if ( /*formatDate(o.key) === formatDate(d.source) ||*/ formatDate(o.key) === formatDate(d.target)) {
                            return styleGuide.mouseoverConnectedNode;
                        } else return styleGuide.mouseoverUnconnectedNode;
                    })
                    .style("opacity", function(o) {
                        if ( /*formatDate(o.key) === formatDate(d.source) ||*/ formatDate(o.key) === formatDate(d.target)) {
                            return 1;
                        } else return 0;
                    });

                releaseNodeHighlight
                    .style("fill", function(o) {
                        if ( /*formatDate(o.key) === formatDate(d.source) ||*/ formatDate(o.key) === formatDate(d.target)) {
                            return styleGuide.mouseoverConnectedNode;
                        } else return styleGuide.mouseoverUnconnectedNode;
                    })
                    .style("opacity", function(o) {
                        if ( /*formatDate(o.key) === formatDate(d.source) ||*/ formatDate(o.key) === formatDate(d.target)) {
                            return 1;
                        } else return 0;
                    });
                nodeHighlight
                    .style("fill", function(o) {
                        if ( /*formatDate(o.key) === formatDate(d.source) ||*/ formatDate(o.key) === formatDate(d.target)) {
                            return styleGuide.mouseoverConnectedNode;
                        } else return styleGuide.mouseoverUnconnectedNode;
                    })
                    .style("opacity", function(o) {
                        if ( /*formatDate(o.key) === formatDate(d.source) ||*/ formatDate(o.key) === formatDate(d.target)) {
                            return 1;
                        } else return 0;
                    });

                inProgressLinkHighlight
                    .style("fill", function(o) {

                        if (formatDate(o.source) === formatDate(d.source) && formatDate(o.target) === formatDate(d.target)) {
                            return linkHighlightedColorScale(cycleXAxis(o.target) - cycleXAxis(o.source));
                        } else return linkColorScaleInProgress(cycleXAxis(o.target) - cycleXAxis(o.source));
                    })
                    .style("opacity", function(o) {

                        if (formatDate(o.source) === formatDate(d.source) && formatDate(o.target) === formatDate(d.target)) {
                            return 1;
                        } else return 0;
                    });
            })
            .on("mouseout", d => {
                resetDefault();
            });

        // END LINKS //

        // NODES //

        //build a dictionary of nodes that are linked
        var linkedByIndex = {};
        cycleTable.forEach(function(d) {
            linkedByIndex[formatDate(d.source) + "," + formatDate(d.target)] = d.count;
        });

        // add the x Axis
        var xAxis = cycleLayer.append("g")
            .attr('id', 'x')
            .attr('class', 'axis')
            .attr("transform", "translate(0," + height + ")")
            .style("pointer-events", "none")
            .call(d3.axisBottom(cycleXAxis));

        //add top semi-circle nodes
        var node = cycleLayer.append('g')
            .selectAll('path')
            .data(nodesTable)
            .enter().append('path')
            .attr('class', 'nodes')
            .attr('id', d => ('node' + formatDate(d.key)))
            .attr("transform", d => "translate(" + cycleXAxis(d.key) + "," + height + ")")
            .attr('d', nodeArc
                .startAngle(Math.PI * 1.5)
                .endAngle(Math.PI * 2.5))
            .style("fill", (d, i) => releaseColour(i))
            .attr("stroke", styleGuide.nodeColour)
            .on('mouseover', d => nodeMouseover(d))
            .on('mouseout', d => resetDefault());

        var inProgressLinkHighlight = cycleLayer.append('g').selectAll("path")
            .data(cycleTable)
            .enter()
            .append('path')
            .attr('class', 'arc')
            .attr('id', d => 'inProgress_' + formatDate(d.source) + '_' + formatDate(d.target))
            .attr('source', d => formatDate(d.source))
            .attr('target', d => formatDate(d.target))
            .attr("transform", d => "translate(" + (cycleXAxis(d.target) - ((cycleXAxis(d.target) - cycleXAxis(d.source)) / 2)) + "," + height + ")")
            .style("pointer-events", "none")
            .style('opacity', 0)
            .attr('d', arc
                .startAngle(Math.PI * 1.5)
                .endAngle(Math.PI * 2.5));

        var nodeHighlight = cycleLayer.append('g')
            .selectAll('circle')
            .data(nodesTable)
            .enter().append('circle')
            .attr('class', 'nodeHighlight')
            .attr('id', d => ('node' + formatDate(d.key)))
            .attr("transform", d => "translate(" + cycleXAxis(d.key) + "," + height + ")")
            .attr('r', d => nodeSize(d.value))
            .style("pointer-events", "none")
            .style("stroke", "black")
            .style("stroke-width", 0.25)
            .style('opacity', 0);

        //remove null nodes
        d3.selectAll('#node0NaN-NaN-NaN').remove();
        d3.selectAll('#node0NaN-NaN').remove();
        d3.selectAll('#node0NaN').remove();

        // END NODES //

        //****** END CREATE CYCLE CHART ******//

        //****** CREATE RELEASE CHART ******//

        // append the svg obgect to the body of the page
        var releaseSVG = d3.select("#releaseChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        var releaseLayer = releaseSVG.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //add heading
        releaseLayer
            .append("text")
            .attr("id", "wew")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (width) / 2 + ",0)")
            .attr("dy", "0.35em")
            .text("Cumulative Releases (Throughput) Over Time");

        var releaseYAxis = d3.scaleLinear()
            .domain([0, nodesTable[nodesTable.length - 1].cfd])
            .range([height, 0]);

        // add the x Axis
        releaseLayer.append("g")
            .attr('id', 'x')
            .attr('class', 'axis')
            .attr("transform", "translate(0," + height + ")")
            .style("pointer-events", "none")
            .call(d3.axisBottom(cycleXAxis));

        // add the y Axis
        releaseLayer.append("g")
            .attr('id', 'y')
            .attr('class', 'axis')
            .style("pointer-events", "none")
            .call(d3.axisLeft(releaseYAxis));

        nodesTable.forEach((d, i) => {
            if (i == 0) {
                //add cfd line
                releaseLayer.append("line")
                    .attr("class", "cfdLine")
                    .attr("x1", cycleXAxis.domain()[0])
                    .attr("y1", releaseYAxis(0))
                    .attr("x2", cycleXAxis(d.key))
                    .attr("y2", releaseYAxis(d.cfd))
                    .attr("stroke-width", "2px")
                    .attr("stroke", releaseColour(i));
            } else {
                //add cfd line
                releaseLayer.append("line")
                    .attr("class", "cfdLine")
                    .attr("x1", cycleXAxis(nodesTable[i - 1].key))
                    .attr("y1", releaseYAxis(nodesTable[i - 1].cfd))
                    .attr("x2", cycleXAxis(d.key))
                    .attr("y2", releaseYAxis(d.cfd))
                    .attr("stroke-width", "2px")
                    .attr("stroke", releaseColour(i));
            }

        })

        //add release line
        var releaseLine = releaseLayer.append('g')
            .selectAll('line')
            .data(nodesTable)
            .enter().append('line')
            .attr("class", "releaseLine")
            .attr("x1", d => cycleXAxis(d.key))
            .attr("y1", d => releaseYAxis(0))
            .attr("x2", d => cycleXAxis(d.key))
            .attr("y2", d => releaseYAxis(d.cfd) + nodeSize(d.value))
            .attr("stroke-width", "1px")
            .attr("stroke-dasharray", "2 2")
            .style('opacity', styleGuide.nodeOpacity)
            .attr("stroke", styleGuide.releaseLine)
            .on('mouseover', d => nodeMouseover(d))
            .on('mouseout', d => resetDefault());

        //add nodes to lollipop graph
        var releaseNode = releaseLayer.append('g')
            .selectAll('circle')
            .data(nodesTable)
            .enter().append('circle')
            .attr('class', 'nodes')
            .attr('id', d => ('node' + formatDate(d.key)))
            .attr("cx", d => cycleXAxis(d.key))
            .attr("cy", d => releaseYAxis(d.cfd))
            .attr('r', d => nodeSize(d.value))
            .style("fill", (d, i) => releaseColour(i))
            .attr("stroke", styleGuide.nodeColour)
            .attr("stroke-width", "1px")
            .on('mouseover', d => nodeMouseover(d))
            .on('mouseout', d => {
                resetDefault();
            });

        var releaseNodeHighlight = releaseLayer.append('g')
            .selectAll('circle')
            .data(nodesTable)
            .enter().append('circle')
            .attr('class', 'nodeHighlight')
            .attr('id', d => ('node' + formatDate(d.key)))
            .attr("cx", d => cycleXAxis(d.key))
            .attr("cy", d => releaseYAxis(d.cfd))
            .attr('r', d => nodeSize(d.value))
            .style("pointer-events", "none")
            .style("stroke", "black")
            .style("stroke-width", 0.25)
            .style('opacity', 0);

        //add release highlight line
        var releaseLineHighlight = releaseLayer.append('g')
            .selectAll('line')
            .data(nodesTable)
            .enter().append('line')
            .attr("class", "releaseLine")
            .attr("x1", d => cycleXAxis(d.key))
            .attr("y1", d => releaseYAxis(0))
            .attr("x2", d => cycleXAxis(d.key))
            .attr("y2", d => releaseYAxis(d.cfd) + nodeSize(d.value))
            .style("pointer-events", "none")
            .style("stroke", "black")
            .style("stroke-width", 0.25)
            .style('opacity', 0);

        //****** END CREATE RELEASE CHART ******//

        //****** HELPER FUNCTIONS ******//

        //check the dictionary to see if nodes are linked
        function isReleasedConnected(a, b) {
            return linkedByIndex[formatDate(b.key) + "," + formatDate(a.key)] || formatDate(a.key) == formatDate(b.key);
        }

        function nodeMouseover(d) {
            d3.select('#node' + formatDate(d.key))
                .style("fill", styleGuide.mouseoverSelectedNode);

            releaseLineHighlight
                .style("stroke", function(o) {

                    if (formatDate(d.key) === formatDate(o.key)) {
                        return styleGuide.mouseoverSelectedNode;
                    }
                    //connected nodes
                    else if (isReleasedConnected(d, o)) {
                        return styleGuide.mouseoverConnectedNode;
                    } else return styleGuide.mouseoverUnconnectedNode;
                })
                .style("opacity", function(o) {

                    if ((formatDate(d.key) === formatDate(o.key)) /*|| isReleasedConnected(d, o)*/ ) {
                        return 1;
                    }
                    //connected nodes
                    else return 0;
                });

            releaseNodeHighlight
                .style("fill", function(o) {

                    if (formatDate(d.key) === formatDate(o.key)) {
                        return styleGuide.mouseoverSelectedNode;
                    }
                    //connected nodes
                    else if (isReleasedConnected(d, o)) {
                        return styleGuide.mouseoverConnectedNode;
                    } else return styleGuide.mouseoverUnconnectedNode;
                })
                .style("opacity", function(o) {

                    if ((formatDate(d.key) === formatDate(o.key)) /*|| isReleasedConnected(d, o)*/ ) {
                        return 1;
                    }
                    //connected nodes
                    else return 0;
                });

            nodeHighlight
                .style("fill", function(o) {

                    if (formatDate(d.key) === formatDate(o.key)) {
                        return styleGuide.mouseoverSelectedNode;
                    }
                    //connected nodes
                    else if (isReleasedConnected(d, o)) {
                        return styleGuide.mouseoverConnectedNode;
                    } else return styleGuide.mouseoverUnconnectedNode;
                })
                .style("opacity", function(o) {

                    if ((formatDate(d.key) === formatDate(o.key)) /*|| isReleasedConnected(d, o)*/ ) {
                        return 1;
                    }
                    //connected nodes
                    else return 0;
                });

            inProgressLinkHighlight
                .style("fill", function(o) {

                    if (formatDate(o.target) === formatDate(d.key) || formatDate(o.source) === formatDate(d.key)) {
                        return linkHighlightedColorScale(cycleXAxis(o.target) - cycleXAxis(o.source));
                    } else return linkColorScaleInProgress(cycleXAxis(o.target) - cycleXAxis(o.source));
                })
                .style("opacity", function(o) {
                    var target = formatDate(o.target);
                    var node = formatDate(d.key);

                    if (target === node) {
                        return 1;
                    } else return 0;
                });
        }

        function resetDefault() {
            node
                .style("fill", (d, i) => releaseColour(i))
                .attr("stroke", styleGuide.nodeColour);
            releaseLineHighlight.style("opacity", 0);
            releaseNodeHighlight.style("opacity", 0);
            nodeHighlight.style("opacity", 0);
            inProgressLink
                .style("fill", d => linkColorScaleInProgress(cycleXAxis(d.target) - cycleXAxis(d.source)))
                .style("opacity", styleGuide.linkOpacity);
            inProgressLinkHighlight
                .style("opacity", 0);
        }

        function undefinedCheck(t) {
            if (t === undefined) {
                return 0;
            } else return t;
        }

        function calcCycleTime(startDate, endDate) {

            // Validate input
            if (endDate < startDate)
                return 0;

            // Calculate days between dates
            var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
            startDate.setHours(0, 0, 0, 1); // Start just after midnight
            endDate.setHours(23, 59, 59, 999); // End just before midnight
            var diff = endDate - startDate; // Milliseconds between datetime objects    
            var days = Math.ceil(diff / millisecondsPerDay);

            // Subtract two weekend days for every week in between
            var weeks = Math.floor(days / 7);
            days = days - (weeks * 2);

            // Handle special cases
            var startDay = startDate.getDay();
            var endDay = endDate.getDay();

            // Remove weekend not previously removed.   
            if (startDay - endDay > 1)
                days = days - 2;

            // Remove start day if span starts on Sunday but ends before Saturday
            if (startDay == 0 && endDay != 6)
                days = days - 1

            // Remove end day if span ends on Saturday but starts after Sunday
            if (endDay == 6 && startDay != 0)
                days = days - 1

            return days;
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

        //****** END HELPER FUNCTIONS ******//

    });