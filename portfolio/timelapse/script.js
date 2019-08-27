        //****** CREATE DIVS ******//

        // set the dimensions and margins of the graph
        const formatNumber = d3.format(',.0f');
        const format = d => `${formatNumber(d)} Days`;
        //const color = d3.scaleSequential().interpolator(d3.interpolateCool).domain([0, dataset.nodes.length - 1]);
        //const color = d3.scaleSequential().interpolator(piecewise(d3.interpolateHsl, ["#43B7B8", "#DE791E", "#63FD88"])).domain([0, dataset.nodes.length - 1]);
        var widthFactor, heightFactor,
            linkTable = [],
            nodeTable = [],
            links = [],
            nodes = [],
            dependencies = [],
            parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S"),
            formatDate = d3.timeFormat("%Y/%m/%d"),
            parseTime = d3.timeParse("%d/%m/%Y"),
            cleanDate = d3.timeFormat("%e %b '%y"),
            emptyDate = formatDate(parseDate(0));

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ||
            (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform))) {
            widthFactor = 5,
                heightFactor = 1.2;
        } else {
            widthFactor = 1,
                heightFactor = 0.8;
        }
        const margin = {
                top: 100,
                right: 30,
                bottom: 20,
                left: 30
            },
            width = ($('#chart').innerWidth() * widthFactor) - margin.left - margin.right - parseFloat($('.container').css('padding-left')) - parseFloat($('.container').css('padding-right')),
            height = ($(window).innerHeight() * heightFactor) - margin.top - margin.bottom,
            nodeWidth = 100,
            nodeHeight = 40;

        const svg = d3.select("#chart")
            .append("svg")
            .style("position", "relative")
            .attr("width", width)
            .attr("height", height);

        //****** PREPARE DATA ******//

        // Get the data
        d3.csv("data.csv", function(error, data) {
            if (error) throw error;

            //create base node table using the 'target' as key
            linkTable = d3.nest()
                .key(d => formatDate(parseTime(d.date))).sortKeys(d3.ascending)
                .key(d => d.action)
                .object(data);

            //get all dates from linkTable object for reference in the loop
            dateTable = Object.keys(linkTable);

            for (entry in linkTable) {
                if (linkTable[entry].added) {
                    linkTable[entry].added.forEach(d => {
                        nodeTable.push({
                            id: d.target,
                            added: entry
                        })
                    })
                }

            }

            var color = d3.scaleSequential().interpolator(d3.interpolateRainbow).domain([0, 4]);

            var simulation = d3.forceSimulation(nodes)
                .force("charge", d3.forceManyBody().strength(d => {
                    if (d.id == "root") return -5000
                    else return -5000
                }))
                .force('collision', d3.forceCollide().radius(function(d) {
                    return 100
                }))
                .force("link", d3.forceLink(links).distance(d => {
                    if (d.source.id == "root") return 200
                    else return 200
                }))
                .force("x", d3.forceX(d => {
                    type = d.id.substr(0, d.id.indexOf('-'));
                    if (type == "root") {
                        return width / 2
                    } else return null
                }))
                .force("y", d3.forceY(d => {
                    type = d.id.substr(0, d.id.indexOf('-'));
                    if (type == "root") {
                        return height / 2
                    } else return null
                }))
                //                .force("x", d3.forceX())
                //                .force("y", d3.forceY(d => {
                //                    type = d.id.substr(0, d.id.indexOf('-'));
                //                    if (type == "root") {
                //                        return 0
                //                    } else if (type == "THEME") {
                //                        return height * 0.2
                //                    } else if (type == "FEATURE") {
                //                        return height * 0.4
                //                    } else if (type == "EPIC") {
                //                        return height * 0.6
                //                    } else if (type == "STORY") {
                //                        return height * 0.8
                //                    } else return 0
                //                }))
                .alphaTarget(1)
                .on("tick", ticked);

            var g = svg.append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
            var link = g.append("g")
                .attr("stroke", "#000")
                .attr("stroke-width", 1.5)
                .selectAll(".link");
            var dependency = g.append("g")
                .attr("stroke", "#000")
                .attr("stroke-width", 1.5)
                .selectAll(".dependency");
            var node = g.append("g")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .selectAll(".node");
            var label = g.append("g")
                .attr("font-color", "#fff")
                .attr("text-anchor", "middle")
                .attr("pointer-events", "none")
                .selectAll(".label");
            // create a tooltip
            var tooltip = d3.select("#chart")
                .append("div")
                .attr("id", "tooltip")
                .style("position", "absolute")
                .style("visibility", "hidden");

            // calculate most of the coordinates for tooltipping just once:
            var root = d3.select("svg"); // WARNING: only works when the first SVG in the page is us!
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
            var header = d3.select("#header").node().getBoundingClientRect();
            var navbar = d3.select("#navbar").node().getBoundingClientRect();
            var chart = $("#chart").position();

            //add drag capabilities  
            var drag_handler = d3.drag()
                .on("start", drag_start)
                .on("drag", drag_drag)
                .on("end", drag_end);

            drag_handler(node);

            //add zoom capabilities 
            var zoom_handler = d3.zoom()
                .on("zoom", zoom_actions);

            zoom_handler(svg);

            restart();

            var interval = 0;
            //the loop through each date
            var timer = d3.interval(function() {
                //create tempTable with all nodes created on the interval date
                tempTable = nodeTable.filter(d => d.added == dateTable[interval]);
                if (tempTable) {
                    tempTable.forEach(d => {
                        nodes.push(d);
                    })
                    restart();
                }

                //create tempTable with all links created on the interval date
                tempTable = linkTable[dateTable[interval]].linked;
                if (tempTable) {
                    tempTable.forEach(d => {
                        if (d.type != "dependency") {
                            links.push({
                                source: nodeTable.find(e => e.id == d.source).index.toString(),
                                target: nodeTable.find(f => f.id == d.target).index.toString(),
                                type: d.type
                            });
                        } else {
                            dependencies.push({
                                source: nodeTable.find(e => e.id == d.source).index.toString(),
                                target: nodeTable.find(f => f.id == d.target).index.toString(),
                                type: d.type
                            });
                        }
                    })
                    restart();
                }

                console.log(nodes);
                console.log(links);
                console.log(dependencies);

                //update info with the current date
                d3.select("#info")
                    .style("color", "white")
                    .html(dateTable[interval]);

                console.log(dateTable[interval]);
                //console.log(tempTable);
                interval++;

                if (interval == dateTable.length) {
                    timer.stop();
                }
            }, 1000, d3.now());


            //i think this is what we want to call every time we want to update the simulation
            function restart() {

                // Apply the general update pattern to the nodes.
                node = node.data(nodes, function(d) {
                    return d.id;
                });
                node.exit().remove();

                label = label.data(nodes, function(d) {
                    return d.id;
                });
                label.exit().remove();

                //rect nodes
                node = node.enter()
                    .append("rect")
                    .attr("fill", function(d, i) {
                        //return color(i);
                        return "grey"
                    })
                    .attr("width", nodeWidth)
                    .attr("height", nodeHeight)
                    .attr("rx", "2px")
                    .attr("ry", "2px")
                    .attr("transform", "translate(-" + nodeWidth / 2 + ",-" + nodeHeight / 2 + ")")
                    .merge(node)
                    .on("mouseover", function() {
                        return tooltip.style("visibility", "visible");
                    })
                    .on("mousemove", function(d, i) {
                        //determine defect/discard text colours
                        //                        var defectColour, discardColour;
                        //
                        //                        defectColour = d.defectRate > 0.4 ? "red" : "white";
                        //                        discardColour = d.discardRate > 0.2 ? "red" : "white";

                        var m = d3.mouse(root.node());
                        scr.x = window.scrollX;
                        scr.y = window.scrollY;
                        m[0] += svgpos.x;
                        m[1] += svgpos.y;
                        tooltip.style("right", "");
                        tooltip.style("left", "");
                        tooltip.style("bottom", "");
                        tooltip.style("top", "");
                        tooltip.html(d.id + "<br>Completion %:");
                        if (m[0] > scr.x + scr.w / 2) {
                            tooltip.style("right", (body.w - m[0] + dist.x) + margin.right + "px");
                        } else {
                            tooltip.style("left", (m[0] + dist.x) + margin.left - chart.left + "px");
                        }

                        if (m[1] > scr.y + scr.h / 2) {
                            tooltip.style("bottom", (body.h - m[1] + dist.y) + header.height + navbar.height + "px");
                        } else {
                            tooltip.style("top", (m[1] + dist.y) - header.height - navbar.height + "px");
                        }
                        tooltip.style("visibility", "visible");
                    })
                    .on("mouseout", function() {
                        return tooltip.style("visibility", "hidden");
                    })
                    .call(drag_handler);

                label = label.enter()
                    .append("text")
                    .attr("dx", 12)
                    .attr("dy", ".35em")
                    .attr("transform", "translate(-" + ((nodeWidth / 4) - 7.5) + ",0)")
                    .text(function(d) {
                        return d.id
                    })
                    .merge(label);

                // Apply the general update pattern to the links.
                link = link.data(links, function(d) {
                    return d.source.id + "-" + d.target.id;
                });
                link.exit().remove();

                link = link.enter()
                    .append("line")
                    .attr("stroke", function(d, i) {
                        type = nodes[d.source].id.substr(0, nodes[d.source].id.indexOf('-'));
                        if (d.source == 0) {
                            return color(0)
                        } else if (type == "THEME") {
                            return color(1)
                        } else if (type == "FEATURE") {
                            return color(2)
                        } else if (type == "EPIC") {
                            return color(3)
                        }
                    })
                    .merge(link);

                // Apply the general update pattern to the dependencies.
                dependency = dependency.data(dependencies, function(d) {
                    return d.source.id + "-" + d.target.id;
                });
                dependency.exit().remove();

                dependency = dependency.enter()
                    .append("line")
                    .attr("stroke", "red")
                    .attr("x1", width / 2)
                    .attr("x2", width / 2 + 100)
                    .attr("y1", height / 2)
                    .attr("y2", height / 2 + height)
                    .merge(dependency);

                // Update and restart the simulation.
                simulation.nodes(nodes);
                simulation.force("link").links(links);
                simulation.alpha(1).restart();
            }

            function ticked() {
                node.attr("x", function(d) {
                        return d.x;
                    })
                    .attr("y", function(d) {
                        return d.y;
                    })

                label.attr("x", function(d) {
                        return d.x;
                    })
                    .attr("y", function(d) {
                        return d.y;
                    })

                link.attr("x1", function(d) {
                        return d.source.x;
                    })
                    .attr("y1", function(d) {
                        return d.source.y;
                    })
                    .attr("x2", function(d) {
                        return d.target.x;
                    })
                    .attr("y2", function(d) {
                        return d.target.y;
                    });

                dependency.attr("x1", function(d) {
                        return d.source.x;
                    })
                    .attr("y1", function(d) {
                        return d.source.y;
                    })
                    .attr("x2", function(d) {
                        return d.target.x;
                    })
                    .attr("y2", function(d) {
                        return d.target.y;
                    });
            }

            function drag_start(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            //make sure you can't drag the circle outside the box
            function drag_drag(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function drag_end(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            //Zoom functions 
            function zoom_actions() {
                g.attr("transform", d3.event.transform)
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
        })
