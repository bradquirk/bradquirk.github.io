        //test for mobile
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ||
            (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform))) {
            //mobile
            $('#chart').append('<img src="../../img/portfolio/magic-wheel.png"/>');
            $('#chart').append('<p>For the interactive version, please visit this site on desktop!</p>');
            d3.select("#header")
                .html("<h3 class='amber-text'>JIRA 'Magic Wheel'</h3><h6>version 1.1</h6>");
        } else {
            //desktop
            //****** PREPARE DATA ******//

            // Get the data
            d3.csv("/assets/csv/projects/magicwheel.csv")
                .then(function(data) {

                    data.forEach(function(d, i) {
                        data[i] = [d['Summary Sequence'], +d['Count'], d['Status Sequence'], d['Key Sequence'], d['To Do Sequence'], d['In Progress Sequence'], d['Done Sequence']];
                        //remove unformatted data
                        delete d.data;
                    });

                    // Dimensions of sunburst.
                    var width, height;
                    width = ($('#chart').innerWidth());
                    height = ($(window).innerHeight() * 0.6);
                    var radius = Math.min(width, height) / 2;

                    const x = d3
                        .scaleLinear()
                        .range([0, 2 * Math.PI])
                        .clamp(true);

                    const y = d3.scaleSqrt().range([radius * 0.1, radius]);

                    const textFits = d => {
                        const CHAR_SPACE = 6;

                        const deltaAngle = (d.x1) - (d.x0);
                        const r = Math.max(0, (Math.sqrt(d.y0) + Math.sqrt(d.y1)) / 2);
                        const perimeter = r * deltaAngle;

                        if (d.data.name == 'root') {
                            return d.data.name.length * CHAR_SPACE < perimeter;
                        } else return d.data.desc.length * CHAR_SPACE < perimeter;

                    };

                    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                    var b = {
                        w: $("#sequence").width() / 5,
                        h: 50,
                        s: 3,
                        t: 10
                    };

                    // Mapping of step names to colors.
                    var colors = {
                        "To Do": "#4FC0E8",
                        "In Progress": "#FECD57",
                        "Done": "#9ED36A",
                    };

                    var colorsText = {
                        "To Do": "darkblue",
                        "In Progress": "brown",
                        "Done": "darkgreen",
                    };

                    // Total size of all segments; we set this later, after loading the data.
                    var totalSize = 0;

                    var vis = d3.select("#chart").append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("x", width / 2)
                        .append("g")
                        .attr("id", "container")
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                    var partition = d3.partition()
                        .size([2 * Math.PI, radius * radius]);

                    var arc = d3.arc()
                        .startAngle(function(d) {
                            return d.x0;
                        })
                        .endAngle(function(d) {
                            return d.x1;
                        })
                        .innerRadius(function(d) {
                            return Math.sqrt(d.y0);
                        })
                        .outerRadius(function(d) {
                            return Math.sqrt(d.y1);
                        });

                    var json = buildHierarchy(data);
                    createVisualization(json);

                    // Main function to draw and set up the visualization, once we have the data.
                    function createVisualization(json) {

                        // Basic setup of page elements.
                        initializeBreadcrumbTrail();
                        drawLegend();
                        d3.select("#togglelegend").on("click", toggleLegend);

                        // Bounding circle underneath the sunburst, to make it easier to detect
                        // when the mouse leaves the parent g.
                        vis.append("circle")
                            .attr("r", radius)
                            .style("opacity", 0);

                        // Turn the data into a d3 hierarchy and calculate the sums.
                        var root = d3.hierarchy(json)
                            .sum(function(d) {
                                return d.size;
                            });

                        // For efficiency, filter nodes to keep only those large enough to see.
                        var nodes = partition(root).descendants()
                            .filter(function(d) {
                                //return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
                                return (d.x1 - d.x0 > 0); // return everything
                            });

                        //add the arc paths
                        var path = vis.data([json]).selectAll("path")
                            .data(nodes)
                            .enter().append("path")
                            .attr("id", function(d, i) {
                                return "arc_" + i;
                            })
                            .attr("class", "arcs")
                            .attr("display", function(d) {
                                return d.depth ? null : "none";
                            })
                            .attr("d", arc)
                            .attr("fill-rule", "evenodd")
                            .style("fill", function(d) {
                                if (d.data.name == "THEME-??" ||
                                    d.data.name == "FEATURE-??" ||
                                    d.data.name == "EPIC-??") {
                                    return "grey"
                                } else return colors[d.data.status];
                            })
                            .style("opacity", 1)
                            .on("mouseover", mouseover)
                            //                    .on("click", d => {
                            //                        //known entity, open in new window
                            //                        if (d.data.name != "THEME-??" &&
                            //                            d.data.name != "FEATURE-??" &&
                            //                            d.data.name != "EPIC-??") {
                            //                            window.open('https://jira.service.anz/browse/' + d.data.name, '_blank');
                            //                        }
                            //                        //unknown entity
                            //                        else {
                            //                            var children = d.children.map(e => e.data.name).filter(f => f != "FEATURE-??" && f != "EPIC-??");
                            //                            //children unknown, loop until children are found
                            //                            if (children.length == 0) {
                            //                                children = d.children[0].children.map(g => g.data.name).filter(h => h != "FEATURE-??" && h != "EPIC-??");
                            //                                if (children.length == 0) {
                            //                                    children = d.children[0].children[0].children.map(g => g.data.name).filter(h => h != "FEATURE-??" && h != "EPIC-??");
                            //                                }
                            //                            }
                            //                            //children now known, open in new window
                            //                            window.open('https://jira.service.anz/issues/?jql=key%20in%20(' + children.join(',') + ')', '_blank');
                            //                        }
                            //                    })
                        ;

                        path.each((d, i) => {
                            //A regular expression that captures all in between the start of a string
                            //(denoted by ^) and the first capital letter L
                            var firstArcSection = /(^.+?)L/;
                            //The [1] gives back the expression between the () (thus not the L as well)
                            //which is exactly the arc statement
                            var newArc = firstArcSection.exec(d3.select("#arc_" + i).attr("d"));

                            //if newArc is not null
                            if (newArc) {
                                // Replace all the comma's so that IE can handle it -_-
                                // The g after the / is a modifier that "find all matches rather than
                                // stopping after the first match"
                                newArc = newArc[1].replace(/,/g, " ");

                                //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2)
                                //flip the end and start position
                                if (d.x0 > 90 * Math.PI / 180 && d.x1 < 270 * Math.PI / 180) {
                                    //Everything between the capital M and first capital A
                                    var startLoc = /M(.*?)A/;
                                    //Everything between the capital A and 0 0 1
                                    var middleLoc = /A(.*?)0 0 1/;
                                    //Everything between the 0 0 1 and the end of the string (denoted by $)
                                    var endLoc = /0 0 1 (.*?)$/;
                                    //Flip the direction of the arc by switching the start and end point
                                    //and using a 0 (instead of 1) sweep flag
                                    if (endLoc.exec(newArc) != null) {
                                        var newStart = endLoc.exec(newArc)[1];
                                        var newEnd = startLoc.exec(newArc)[1];
                                        var middleSec = middleLoc.exec(newArc)[1];

                                        //Build up the new arc notation, set the sweep-flag to 0
                                        newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;

                                        //tag as flipped
                                        d.flipped = true;
                                    }

                                } else d.flipped = false;

                                //Create a new invisible arc that the text can flow along
                                vis.append("path")
                                    .attr("class", "hiddenDonutArcs")
                                    .attr("id", "donutArc" + i)
                                    .attr("d", newArc)
                                    .style("fill", "none");
                            }


                        })

                        vis.selectAll(".arcText")
                            .data(nodes)
                            .enter().append("text")
                            .attr("class", "arcText")
                            .attr("dy", function(d) {
                                if (d.depth == 1) {
                                    if (d.x0 > 90 * Math.PI / 180 && d.x1 < 270 * Math.PI / 180) {
                                        return -25
                                    } else return 35
                                }
                                if (d.depth == 2) {
                                    if (d.x0 > 90 * Math.PI / 180 && d.x1 < 270 * Math.PI / 180) {
                                        return -20
                                    } else return 25
                                }
                                if (d.depth == 3) {
                                    if (d.x0 > 90 * Math.PI / 180 && d.x1 < 270 * Math.PI / 180) {
                                        return -15
                                    } else return 20
                                }
                                if (d.depth == 4) {
                                    if (d.x0 > 90 * Math.PI / 180 && d.x1 < 270 * Math.PI / 180) {
                                        return -10
                                    } else return 15
                                }
                            }) //Move the text down
                            .append("textPath")
                            .attr('startOffset', '50%')
                            .attr('text-anchor', 'middle')
                            .attr("xlink:href", function(d, i) {
                                return "#donutArc" + i;
                            })
                            .attr('display', d => (textFits(d) ? null : 'none'))
                            .style("font-size", "0.75em")
                            .style("fill", function(d) {
                                if (d.data.name == "THEME-??" ||
                                    d.data.name == "FEATURE-??" ||
                                    d.data.name == "EPIC-??") {
                                    //return "grey"
                                } else return colorsText[d.data.status];
                            })
                            .text(d => d.data.desc)
                            .attr("pointer-events", "none");

                        // Add the mouseleave handler to the bounding circle.
                        d3.select("#container").on("mouseleave", mouseleave);

                        // Get total size of the tree = value of root node from partition.
                        totalSize = path.datum().value;

                        //display key and desc in centre
                        d3.select("#container")
                            .append("text")
                            .attr('id', 'centreKey')
                            .attr('text-anchor', 'middle')
                            .attr('y', '-50px')
                            .style("fill", "white")
                            .style("font-size", "0.75em")
                            .style("visibility", "hidden");

                        d3.select("#container")
                            .append("text")
                            .attr('id', 'centreDesc')
                            .attr('text-anchor', 'middle')
                            .style("fill", "white")
                            .style("font-size", "0.75em")
                            .style("visibility", "hidden");

                        //create group for centre stats
                        d3.select("#container").append("g")
                            .attr('id', 'centre')
                            .attr('transform', 'translate(0,75)');

                        //display To Do count/% in centre
                        d3.select("#centre")
                            .append("text")
                            .attr('id', 'centretoDoText')
                            .attr('text-anchor', 'middle')
                            .attr('x', '-50px')
                            .attr('y', '-25px')
                            .attr('dy', '-1em')
                            .text('To Do')
                            .style("fill", colors["To Do"])
                            .style("font-size", "0.75em")
                            .style("visibility", "hidden");

                        d3.select("#centre")
                            .append("text")
                            .attr('id', 'centretoDo')
                            .attr('text-anchor', 'middle')
                            .attr('x', '-50px')
                            .attr('y', '-25px')
                            .style("fill", "white")
                            .style("font-size", "0.75em")
                            .style("visibility", "hidden");

                        d3.select("#centre")
                            .append("text")
                            .attr('id', 'centretoDoPercentage')
                            .attr('text-anchor', 'middle')
                            .attr('x', '-50px')
                            .attr('y', '-25px')
                            .attr('dy', '1em')
                            .style("fill", "white")
                            .style("font-size", "0.75em")
                            .style("visibility", "hidden");

                        //display In Progress count/% in centre
                        d3.select("#centre")
                            .append("text")
                            .attr('id', 'centreInProgressText')
                            .attr('text-anchor', 'middle')
                            .attr('y', '-25px')
                            .attr('dy', '-1em')
                            .text('In Progress')
                            .style("fill", colors["In Progress"])
                            .style("font-size", "0.75em")
                            .style("visibility", "hidden");

                        d3.select("#centre")
                            .append("text")
                            .attr('id', 'centreInProgress')
                            .attr('text-anchor', 'middle')
                            .attr('y', '-25px')
                            .style("fill", "white")
                            .style("font-size", "0.75em")
                            .style("visibility", "hidden");

                        d3.select("#centre")
                            .append("text")
                            .attr('id', 'centreInProgressPercentage')
                            .attr('text-anchor', 'middle')
                            .attr('y', '-25px')
                            .attr('dy', '1em')
                            .style("fill", "white")
                            .style("font-size", "0.75em")
                            .style("visibility", "hidden");

                        //display Done count/% in centre
                        d3.select("#centre")
                            .append("text")
                            .attr('id', 'centreDoneText')
                            .attr('text-anchor', 'middle')
                            .attr('x', '50px')
                            .attr('y', '-25px')
                            .attr('dy', '-1em')
                            .text('Done')
                            .style("fill", colors["Done"])
                            .style("font-size", "0.75em")
                            .style("visibility", "hidden");

                        d3.select("#centre")
                            .append("text")
                            .attr('id', 'centreDone')
                            .attr('text-anchor', 'middle')
                            .attr('x', '50px')
                            .attr('y', '-25px')
                            .style("fill", "white")
                            .style("font-size", "0.75em")
                            .style("visibility", "hidden");

                        d3.select("#centre")
                            .append("text")
                            .attr('id', 'centreDonePercentage')
                            .attr('text-anchor', 'middle')
                            .attr('x', '50px')
                            .attr('y', '-25px')
                            .attr('dy', '1em')
                            .style("fill", "white")
                            .style("font-size", "0.75em")
                            .style("visibility", "hidden");

                    };

                    // Fade all but the current sequence, and show it in the breadcrumb trail.
                    function mouseover(d) {

                        var percentage = (100 * d.value / totalSize).toPrecision(3);
                        var percentageString = percentage + "%";
                        if (percentage < 0.1) {
                            percentageString = "< 0.1%";
                        }

                        d3.select("#percentage")
                            .text(percentageString);

                        d3.select("#explanation")
                            .style("visibility", "");

                        var sequenceArray = d.ancestors().reverse();
                        sequenceArray.shift(); // remove root node from the array
                        updateBreadcrumbs(sequenceArray, percentageString);

                        // Fade all the segments.
                        d3.selectAll("path")
                            .style("opacity", 0.3);

                        // Then highlight only those that are an ancestor of the current segment.
                        vis.selectAll("path")
                            .filter(function(node) {
                                return (sequenceArray.indexOf(node) >= 0);
                            })
                            .style("opacity", 1);

                        d3.select('#centreKey')
                            .text(d.data.name)
                            .style("visibility", "");

                        var centreDesc = function() {
                            if (d.data.desc.length > 25) {
                                return d.data.desc.substring(0, 25) + '...';
                            } else return d.data.desc;
                        }
                        d3.select('#centreDesc')
                            .text(centreDesc)
                            .style("visibility", "");

                        d3.select('#centretoDoText')
                            .style("visibility", "");

                        d3.select('#centretoDo')
                            .text(d.data.toDo)
                            .style("visibility", "");

                        d3.select('#centretoDoPercentage')
                            .text(d3.format(",.0%")((d.data.toDo) / (d.data.toDo + d.data.inProgress + d.data.done)))
                            .style("visibility", "");

                        d3.select('#centreInProgressText')
                            .style("visibility", "");

                        d3.select('#centreInProgress')
                            .text(d.data.inProgress)
                            .style("visibility", "");

                        d3.select('#centreInProgressPercentage')
                            .text(d3.format(",.0%")((d.data.inProgress) / (d.data.toDo + d.data.inProgress + d.data.done)))
                            .style("visibility", "");

                        d3.select('#centreDoneText')
                            .style("visibility", "");

                        d3.select('#centreDone')
                            .text(d.data.done)
                            .style("visibility", "");

                        d3.select('#centreDonePercentage')
                            .text(d3.format(",.0%")((d.data.done) / (d.data.toDo + d.data.inProgress + d.data.done)))
                            .style("visibility", "");
                    }

                    // Restore everything to full opacity when moving off the visualization.
                    function mouseleave(d) {

                        // Hide the breadcrumb trail
                        d3.select("#trail")
                            .style("visibility", "hidden");

                        // Deactivate all segments during transition.
                        d3.selectAll("path").on("mouseover", null);

                        // Transition each segment to full opacity and then reactivate it.
                        d3.selectAll("path")
                            .transition()
                            .style("opacity", 1)
                            .on("end", function() {
                                d3.select(this).on("mouseover", mouseover);
                            });

                        d3.select("#explanation")
                            .style("visibility", "hidden");

                        d3.select('#centreKey')
                            .style("visibility", "hidden");

                        d3.select('#centreDesc')
                            .style("visibility", "hidden");

                        d3.select('#centretoDoText')
                            .style("visibility", "hidden");

                        d3.select('#centretoDo')
                            .style("visibility", "hidden");

                        d3.select('#centretoDoPercentage')
                            .style("visibility", "hidden");

                        d3.select('#centreInProgressText')
                            .style("visibility", "hidden");

                        d3.select('#centreInProgress')
                            .style("visibility", "hidden");

                        d3.select('#centreInProgressPercentage')
                            .style("visibility", "hidden");

                        d3.select('#centreDoneText')
                            .style("visibility", "hidden");

                        d3.select('#centreDone')
                            .style("visibility", "hidden");

                        d3.select('#centreDonePercentage')
                            .style("visibility", "hidden");
                    }

                    function initializeBreadcrumbTrail() {
                        // Add the svg area.
                        var trail = d3.select("#sequence").append("svg")
                            .attr("width", width)
                            .attr("height", 50)
                            .attr("id", "trail");
                        // Add the size value at the end, for the percentage.
                        trail.append("text")
                            .attr("id", "endsize")
                            .style("fill", "#000");
                        // Add the size value at the end, for the percentage.
                        trail.append("text")
                            .attr("id", "endlabel")
                            .style("fill", "#000");
                    }

                    // Generate a string that describes the points of a breadcrumb polygon.
                    function breadcrumbPoints(d, i) {
                        var points = [];
                        points.push("0,0");
                        points.push(b.w + ",0");
                        points.push(b.w + b.t + "," + (b.h / 2));
                        points.push(b.w + "," + b.h);
                        points.push("0," + b.h);
                        if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                            points.push(b.t + "," + (b.h / 2));
                        }
                        return points.join(" ");
                    }

                    // Update the breadcrumb trail to show the current sequence and percentage.
                    function updateBreadcrumbs(nodeArray, percentageString) {

                        // Data join; key function combines name and depth (= position in sequence).
                        var trail = d3.select("#trail")
                            .selectAll("g")
                            .data(nodeArray, function(d) {
                                return d.data.name + d.depth;
                            });

                        // Remove exiting nodes.
                        trail.exit().remove();

                        // Add breadcrumb and label for entering nodes.
                        var entering = trail.enter().append("g");

                        entering.append("polygon")
                            .attr("points", breadcrumbPoints)
                            .style("fill", function(d) {
                                if (d.data.name == "THEME-??" ||
                                    d.data.name == "FEATURE-??" ||
                                    d.data.name == "EPIC-??") {
                                    return "grey"
                                } else return colors[d.data.status];
                            });

                        entering.append("text")
                            .attr("x", (b.w + b.t) / 2)
                            .attr("y", b.h / 2)
                            .attr("dy", "1.15em")
                            .attr("text-anchor", "middle")
                            .style("fill", "#2E353D")
                            .text(function(d) {
                                if (d.data.desc.length < 25) {
                                    return d.data.desc
                                } else return (d.data.desc.substring(0, 25) + '...')
                            });

                        entering.append("text")
                            .attr("x", (b.w + b.t) / 2)
                            .attr("y", b.h / 2)
                            .attr("dy", "-0.5em")
                            .attr("text-anchor", "middle")
                            .style("fill", "#2E353D")
                            .text(function(d) {
                                return d.data.name
                            });

                        // Merge enter and update selections; set position for all nodes.
                        entering.merge(trail).attr("transform", function(d, i) {
                            return "translate(" + i * (b.w + b.s) + ", 0)";
                        });

                        // Now move and update the percentage at the end.
                        d3.select("#trail").select("#endsize")
                            .attr("x", (nodeArray.length + 0.1) * (b.w + b.s))
                            .attr("y", b.h / 2)
                            .attr("dy", "-0.5em")
                            .attr("text-anchor", "left")
                            .style("fill", "white")
                            .text("% of Backlog");

                        // Now move and update the percentage at the end.
                        d3.select("#trail").select("#endlabel")
                            .attr("x", (nodeArray.length + 0.1) * (b.w + b.s))
                            .attr("y", b.h / 2)
                            .attr("dy", "1.15em")
                            .attr("text-anchor", "left")
                            .style("fill", "white")
                            .text(percentageString);

                        // Make the breadcrumb trail visible, if it's hidden.
                        d3.select("#trail")
                            .style("visibility", "");

                    }

                    function drawLegend() {

                        // Dimensions of legend item: width, height, spacing, radius of rounded rect.
                        var li = {
                            w: 75,
                            h: 30,
                            s: 3,
                            r: 3
                        };

                        var legend = d3.select("#legend").append("svg")
                            .attr("width", li.w)
                            .attr("height", d3.keys(colors).length * (li.h + li.s))
                            .attr("transform", "translate(" + (d3.select('#legend').node().getBoundingClientRect().width - (li.w * 1.5)) + ",0)");;

                        var g = legend.selectAll("g")
                            .data(d3.entries(colors))
                            .enter().append("g")
                            .attr("transform", function(d, i) {
                                return "translate(0," + i * (li.h + li.s) + ")";
                            });

                        g.append("rect")
                            .attr("rx", li.r)
                            .attr("ry", li.r)
                            .attr("width", li.w)
                            .attr("height", li.h)
                            .style("fill", function(d) {
                                return d.value;
                            });

                        g.append("text")
                            .attr("x", li.w / 2)
                            .attr("y", li.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .style("fill", "#2E353D")
                            .text(function(d) {
                                return d.key;
                            });
                    }

                    function toggleLegend() {
                        var legend = d3.select("#legend");
                        if (legend.style("visibility") == "hidden") {
                            legend.style("visibility", "");
                        } else {
                            legend.style("visibility", "hidden");
                        }
                    }

                    function buildHierarchy(csv) {
                        var root = {
                            "name": "root",
                            "children": []
                        };
                        for (var i = 0; i < csv.length; i++) {
                            var summarySequence = csv[i][0],
                                size = +csv[i][1],
                                statusSequence = csv[i][2],
                                keySequence = csv[i][3],
                                toDoSequence = csv[i][4],
                                inProgressSequence = csv[i][5],
                                doneSequence = csv[i][6];


                            if (isNaN(size)) { // e.g. if this is a header row
                                continue;
                            }
                            var summaryParts = summarySequence.split("\\\\\\"),
                                statusParts = statusSequence.split("\\\\\\"),
                                keyParts = keySequence.split("\\\\\\"),
                                toDoParts = toDoSequence.split("\\\\\\"),
                                inProgressParts = inProgressSequence.split("\\\\\\"),
                                doneParts = doneSequence.split("\\\\\\"),
                                currentNode = root;
                            for (var j = 0; j < summaryParts.length; j++) {
                                var children = currentNode["children"],
                                    nodeKey = keyParts[j],
                                    nodeStatus = statusParts[j],
                                    nodeDesc = summaryParts[j],
                                    nodeToDo = toDoParts[j],
                                    nodeInProgress = inProgressParts[j],
                                    nodeDone = doneParts[j],
                                    childNode;
                                if (j + 1 < summaryParts.length) {
                                    // Not yet at the end of the summarySequence; move down the tree.
                                    var foundChild = false;
                                    for (var k = 0; k < children.length; k++) {
                                        if (children[k]["name"] == nodeKey) {
                                            childNode = children[k];
                                            childNode.children.sort(function(a, b) {
                                                var statusMap = {
                                                    'To Do': 1,
                                                    'In Progress': 2,
                                                    'Done': 3
                                                }
                                                var statusA = +statusMap[a.status];
                                                var statusB = +statusMap[b.status];
                                                return d3.descending(statusA, statusB);
                                            });
                                            foundChild = true;
                                            break;
                                        }
                                    }
                                    // If we don't already have a child node for this branch, create it.
                                    if (!foundChild) {
                                        childNode = {
                                            "name": nodeKey,
                                            "status": nodeStatus,
                                            "desc": nodeDesc,
                                            "toDo": +nodeToDo,
                                            "inProgress": +nodeInProgress,
                                            "done": +nodeDone,
                                            "children": []
                                        };
                                        children.push(childNode);
                                    }
                                    currentNode = childNode;
                                } else {
                                    // Reached the end of the summarySequence; create a leaf node.
                                    childNode = {
                                        "name": nodeKey,
                                        "status": nodeStatus,
                                        "desc": nodeDesc,
                                        "toDo": +nodeToDo,
                                        "inProgress": +nodeInProgress,
                                        "done": +nodeDone,
                                        "size": size
                                    };
                                    children.push(childNode);
                                }
                            }
                        }
                        //sort root when complete
                        var statusMap = {
                                'To Do': 1,
                                'In Progress': 2,
                                'Done': 3
                            },
                            statusA, statusB;
                        //theme level
                        for (var themeIndex = root.children.length - 1; themeIndex >= 0; themeIndex--) {
                            //feature level
                            for (var featureIndex = root.children[themeIndex].children.length - 1; featureIndex >= 0; featureIndex--) {
                                //epic level
                                for (var epicIndex = root.children[themeIndex].children[featureIndex].children.length - 1; epicIndex >= 0; epicIndex--) {
                                    //sort stories in epic
                                    root.children[themeIndex].children[featureIndex].children[epicIndex].children.sort(function(a, b) {
                                        statusA = +statusMap[a.status];
                                        statusB = +statusMap[b.status];
                                        if (statusA != statusB) return d3.ascending(statusA, statusB)
                                        else return d3.ascending(a.size, b.size);
                                    });
                                }
                                //sort epics in feature
                                root.children[themeIndex].children[featureIndex].children.sort(function(a, b) {
                                    statusA = +statusMap[a.status];
                                    statusB = +statusMap[b.status];
                                    if (statusA != statusB) return d3.ascending(statusA, statusB)
                                    else return d3.ascending(a.size, b.size);
                                });
                            }
                            //sort features in theme
                            root.children[themeIndex].children.sort(function(a, b) {
                                statusA = +statusMap[a.status];
                                statusB = +statusMap[b.status];
                                if (statusA != statusB) return d3.ascending(statusA, statusB)
                                else return d3.ascending(a.size, b.size);
                            });
                        }

                        return root;
                    };
                });
        }