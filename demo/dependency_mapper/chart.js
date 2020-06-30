/* App frontend script */

// Dimensions of sunburst.
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
}
var width;
var height = 820;
var rootSVG, rootRingSVG, scr, body_sel, body, svgpos, svgRingpos, dist, chart, header, subHeader, firstVizButton, sectionDepTypes, sectionOptions, sectionChart;
var delayTimer;
var serverURL;
var issuelinks = [];
var arcs = d3.arc()
    .startAngle(function(d) {
        return d.value.x0;
    })
    .endAngle(function(d) {
        return d.value.x1;
    })
var colourSchemeHeatmap
var colourSchemeRing
var colourSchemeSankey
var totalIssues
var buttonWidth = $(".createViz").outerWidth()
var dataTable
var canvasLine
var customFields
var sankeyProjects

function loadChart() {

    //hide tab buttons until finished
    d3.selectAll(".tablinks").transition().style("opacity", 0).style("pointer-events", "none")

    //if >5000 issues, hide loading buttons
    d3.selectAll(".loading-buttons").transition().style("opacity", 0)
    var canvas = d3.select('#chart').select('canvas').node()
    context = canvas.getContext("2d");
    context.translate(width / 2, height / 2);
    var loadingText = d3.selectAll(".loading-text")

    loadingText.text("Initialising Dependency Extracts")

    d3.json("data.json")

    /*
    CREATE DEPENDENCY RING
    */
    .then(data => {

                if (data.length == 0) throw 'No dependencies identified within the ' + totalIssues + ' initial issue/s returned by JQL query. Please review JQL Query and Dependency Types'

                var width = d3.select('#chart').node().getBoundingClientRect().width;
                var height = d3.select('#chart').node().getBoundingClientRect().height;

                //****** PREPARE DATA ******//

                //rename data
                var links = data;

                //filter self-referencing node links
                links = links.filter(d => {
                    return JSON.stringify(d.target) !== JSON.stringify(d.source);
                });

                var nodes = [];

                //create base node table using the 'target' as key
                var nodesDataTable = d3.nest()
                    .key(function(d) {
                        return d.target;
                    })
                    .key(d => d.targetProj)
                    .rollup(function(d) {
                        return {
                            "total": d3.sum(d, function(d) {
                                return d.count;
                            }),
                        };
                    })
                    .entries(links);

                nodesDataTable.forEach(function(d) {

                    //push object to nodes array
                    nodes.push({
                        'id': d.key,
                        'summary': links.find(e => e.target == d.key).targetName,
                        'group': d.values[0]['key'],
                        'total': d.values[0]['value']['total'],
                        'projectName': links.find(e => e.targetProj == d.values[0]['key']).targetProjectName
                    });

                });


                //create same node table but with 'source' to add missing nodes to nodes
                var sourceNodesDataTable = d3.nest()
                    .key(function(d) {
                        return d.source;
                    })
                    .key(function(d) {
                        return d.sourceProj;
                    })
                    .rollup(function(d) {
                        return {
                            "total": d3.sum(d, function(d) {
                                return d.count;
                            }),
                        };
                    })
                    .entries(links);

                //loop through sourceNodesDataTable and append to nodes if value is missing
                var indexValue = 0;
                sourceNodesDataTable.forEach(d => {

                    //node does not exist, push sourceNodesData
                    if (nodes.findIndex(data => {
                            return data.id == d.key
                        }) == -1) {
                        nodes.push({
                            'id': d.key,
                            'summary': links.find(e => e.source == d.key).sourceName,
                            'group': d.values[0]['key'],
                            'total': d.values[0]['value']['total'],
                            'projectName': links.find(e => e.sourceProj == d.values[0]['key']).sourceProjectName
                        })
                    }
                    //node does exist, append sourceNodesData
                    else {
                        indexValue = nodes.findIndex(data => {
                            return data.id == d.key
                        });
                        nodes[indexValue].total += d.values[0]['value']['total'];
                    }

                })

                //sort nodes based on issue key
                nodes = nodes.sort((a, b) => {
                    var projectA = a.id.substring(0, a.id.indexOf('-')),
                        projectB = b.id.substring(0, b.id.indexOf('-')),
                        numberA = +a.id.substring(a.id.indexOf('-') + 1, a.id.length),
                        numberB = +b.id.substring(b.id.indexOf('-') + 1, b.id.length);
                    //first compare projects, then keys
                    if (projectA < projectB) return -1;
                    if (projectA > projectB) return 1;
                    if (numberA < numberB) return -1;
                    if (numberA > numberB) return 1;
                    return 0;
                });

                const jsontable = {
                    "nodes": nodes,
                    "links": links
                };

                const groupById = new Map;
                const nodeById = new Map(nodes.map(node => [node.id, node]));
                for (const node of nodes) {
                    let group = groupById.get(node.group);
                    if (!group) groupById.set(node.group, group = {
                        name: node.group,
                        children: []
                    });
                    group.children.push(node);
                    node.targetIds = [];
                    node.sourceIds = [];
                }

                for (const {
                        source: sourceId,
                        target: targetId
                    }
                    of links) {
                    const source = nodeById.get(sourceId);
                    source.targetIds.push(targetId);
                    const target = nodeById.get(targetId);
                    target.sourceIds.push(sourceId);
                }

                var rootData = {
                    name: "root",
                    children: [...groupById.values()]
                };

                var radius = (width + margin.left + margin.right) / 2;

                canvasLine = d3.radialLine()
                    .curve(d3.curveBundle.beta(0.85))
                    .radius(d => d.y)
                    .angle(d => d.x)
                    .context(context);

                var tree = d3.cluster().size([2 * Math.PI, radius - 102])

                const root = tree(d3.hierarchy(rootData));

                const map = new Map(root.leaves().map(d => [d.data.id, d]));

                dataTable = d3.merge(root.leaves().map(d => d.data.targetIds.map(i => d.path(map.get(i)))));

                var arcData = d3.nest()
                    .key(d => d.data.group)
                    .rollup(d => {
                        return {
                            'x0': d[0]['x'],
                            'x1': d[d.length - 1]['x'],
                            'y0': arcs.innerRadius()(d),
                            'y1': arcs.outerRadius()(d),
                            'projectName': d[0]['data']['projectName']
                        }
                    })
                    .entries(root.leaves());

                arcs
                    .innerRadius((radius - 100) * 0.90)
                    .outerRadius(radius - 100);

                colourSchemeRing = d3.scaleSequential()
                    .interpolator(d3.interpolateRainbow)
                    .domain([0, arcData.length].reverse());

                const svg = d3.select("#chart").select("svg");

                fontValue = Math.min(1, Math.PI * Math.pow(jsontable.nodes.length, -0.5))

                //add zoom capabilities 
                var zoom_handler = d3.zoom()
                    .on("zoom", zoomed);

                zoom_handler(svg);

                var container = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
                    // create a tooltipDemo
                var tooltipDemo = d3.select("#chart")
                    .append("div")
                    .attr("class", "tooltipDemo")
                    .style("position", "absolute")
                    .style("visibility", "hidden");
                var node = container.append("g").attr("id", "nodeContainer").selectAll(".node"),
                    arc = container.append("g").attr("id", "arcContainer").selectAll(".arc");

                dataTable.forEach(d => {
                    d.source = d[0];
                    d.target = d[d.length - 1];
                    context.globalAlpha = 0.2;
                    context.beginPath();
                    canvasLine(d);
                    context.lineWidth = 1;
                    if ($("#checkDarkmode").is(':checked')) {
                        //context.globalCompositeOperation = "screen"
                        context.strokeStyle = "#FFFFFF";
                    } else {
                        //context.globalCompositeOperation = "darken"
                        context.strokeStyle = "#2E2E2E";
                    }

                    context.stroke();
                })

                var node = node
                    .data(root.leaves())
                    .enter().append("text")
                    .attr("class", "node")
                    .attr("id", d => d.data.id)
                    .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90})translate(${d.y},0)${d.x >= Math.PI ? `rotate(180)` : ""}`)
                .attr("dy", "0.31em")
                .attr("x", d => d.x < Math.PI ? 3 : -3)
                .attr("font-size", fontValue + "em")
                .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
                .text(d => d.data.id)
                .on("mouseover", d => {
                    tooltipDemo.style("visibility", "visible")
                })
                .on("mousemove", function (d, i) {
                    var m = d3.mouse(rootRingSVG.node())
                    scr.x = window.scrollX
                    scr.y = window.scrollY
                    m[0] += svgRingpos.x
                    m[1] += svgRingpos.y
                    sourceLength = d.data.sourceIds ? d.data.sourceIds.length : 0
                    targetLength = d.data.targetIds ? d.data.targetIds.length : 0
                    tooltipDemo.style("right", "")
                    tooltipDemo.style("left", "")
                    tooltipDemo.style("bottom", "")
                    tooltipDemo.style("top", "")
                    tooltipDemo.html("<h4 style='color:#FFFFFF'>ID: " + d.data.id + "<br>" +
                        "Summary: " + d.data.summary + "<hr>" +
                        "<table><tbody>" +
                        "<tr><td>Received Dependencies: </td><td><span style='color:#4CD964'>" + sourceLength + "</span></td></tr>" +
                        "<tr><td>Raised Dependencies: </td><td><span style='color:#FF2D55'>" + targetLength + "</span></td></tr>" +
                        "</tbody></table><hr>")

                    if (m[0] > scr.x + scr.w / 2) {
                        tooltipDemo.style("right", (body.w - m[0] + dist.x) - chart.left + parseInt($('#appContainer').css(("marginLeft").replace('px', ''))) + "px");
                    } else {
                        tooltipDemo.style("left", (m[0] + dist.x) - chart.left + parseInt($('#appContainer').css(("marginLeft").replace('px', ''))) + "px");
                    }
                    tooltipDemo.style("top", (m[1] - dist.y - header.height - tooltipDemo.node().getBoundingClientRect().height) - parseInt($('#appContainer').css(("marginTop").replace('px', ''))) + "px");
                    tooltipDemo.style("visibility", "visible")

                })
                .on("mouseleave", function (d, i) {
                    tooltipDemo.style("visibility", "hidden")
                })

            var arcPaths = arc
                .data(arcData)
                .enter().append("path")
                .attr("id", function (d, i) {
                    return "arc_" + i;
                })
                .attr("class", "arcs")
                .attr("d", arcs)
                .style("fill", (d, i) => colourSchemeRing(i))
                .attr("cursor", "pointer")
                .on("mouseover", d => {
                    tooltipDemo.style("visibility", "visible")
                })
                .on("mousemove", function (d, i) {
                    var m = d3.mouse(rootRingSVG.node())
                    scr.x = window.scrollX
                    scr.y = window.scrollY
                    m[0] += svgRingpos.x
                    m[1] += svgRingpos.y
                    sourceLength = dataTable.filter(e => d.key == e.target.data.group && d.key != e.source.data.group).length
                    targetLength = dataTable.filter(e => d.key == e.source.data.group && d.key != e.target.data.group).length
                    internalLength = dataTable.filter(e => d.key == e.source.data.group && d.key == e.target.data.group).length
                    tooltipDemo.style("right", "")
                    tooltipDemo.style("left", "")
                    tooltipDemo.style("bottom", "")
                    tooltipDemo.style("top", "")
                    if ($("#checkInternal").is(':checked')) {
                        tooltipDemo.html("<h4 style='color:#FFFFFF'>ID: " + d.key + "<br>" +
                            "Name: " + d.value.projectName + "<hr>" +
                            "<table><tbody>" +
                            "<tr><td>Received Dependencies: </td><td><span style='color:#4CD964'>" + sourceLength + "</span></td></tr>" +
                            "<tr><td>Raised Dependencies: </td><td><span style='color:#FF2D55'>" + targetLength + "</span></td></tr>" +
                            "<tr><td>Internal Dependencies: </td><td><span style='color:#34AADC'>" + internalLength + "</span></td></tr>" +
                            "</tbody></table><hr>")
                    } else {
                        tooltipDemo.html("<h4 style='color:#FFFFFF'>ID: " + d.key + "<br>" +
                            "Name: " + d.value.projectName + "<hr>" +
                            "<table><tbody>" +
                            "<tr><td>Received Dependencies: </td><td><span style='color:#4CD964'>" + sourceLength + "</span></td></tr>" +
                            "<tr><td>Raised Dependencies: </td><td><span style='color:#FF2D55'>" + targetLength + "</span></td></tr>" +
                            "</tbody></table>")
                    }

                    if (m[0] > scr.x + scr.w / 2) {
                        tooltipDemo.style("right", (body.w - m[0] + dist.x) - chart.left + parseInt($('#appContainer').css(("marginLeft").replace('px', ''))) + "px");
                    } else {
                        tooltipDemo.style("left", (m[0] + dist.x) - chart.left + parseInt($('#appContainer').css(("marginLeft").replace('px', ''))) + "px");
                    }
                    tooltipDemo.style("top", (m[1] - dist.y - header.height - tooltipDemo.node().getBoundingClientRect().height) - parseInt($('#appContainer').css(("marginTop").replace('px', ''))) + "px");
                    tooltipDemo.style("visibility", "visible")

                })
                .on("mouseleave", function (d, i) {
                    tooltipDemo.style("visibility", "hidden")
                })

            arcPaths.each((d, i) => {

                //A regular expression that captures all in between the start of a string
                //(denoted by ^) and the first capital letter L
                var firstArcSection = /(^.+?)L/;
                //The [1] gives back the expression between the () (thus not the L as well)
                //which is exactly the arc statement
                var newArc = firstArcSection.exec(d3.select("#arc_" + i).attr("d"));

                //if newArc is not null
                if (newArc) {

                    newArc = getArcPath(newArc, d, i);

                    //Create a new invisible arc that the text can flow along
                    container.append("path")
                        .attr("class", "hiddenDonutArcs")
                        .attr("id", "donutArc" + i)
                        .attr("d", newArc)
                        .style("fill", "none");
                }
            })

            //add dummy path
            container.append("path").attr("id", "dummyPath").attr("d", "M 0 0 L 10000 0")
            //add dummy text so we can get textHeight
            container.append("text").attr("id", "dummyText").append("textPath").attr("xlink:href", "#dummyPath").text("ABC")
            textHeight = d3.select("#dummyText").node().getBBox().height
            d3.select("#dummyPath").remove()
            d3.select("#dummyText").remove()

            //add arc text
            container.selectAll(".arcText")
                .data(arcData)
                .enter().append("text")
                .attr("class", "arcText")
                .attr("id", (d, i) => "text" + i)
                .attr("dy", function (d) {
                    if (arcs.centroid(d)[1] > 0) {
                        return -((((radius - 100) - ((radius - 100) * 0.90)) / 2) - (textHeight * 0.35))
                    } else return (((radius - 100) - ((radius - 100) * 0.90)) / 2) + (textHeight * 0.35)
                }) //Move the text down
                .append("textPath")
                .attr('startOffset', '50%')
                .attr('text-anchor', 'middle')
                .attr("xlink:href", function (d, i) {
                    return "#donutArc" + i;
                })
                .style("fill", (d, i) => {
                    return d3.hsl(colourSchemeRing(i)).l < 0.64 ? "#FFFFFF" : "#333333"
                })
                .style("pointer-events", "none")
                .text(d => textFits(d))

            //****** END PREPARE DATA ******//

            //Zoom functions 
            function zoomed() {
                container.attr("transform", d3.event.transform + "translate(" + width / 2 + "," + height / 2 + ")")
                context.save();
                context.translate(-width / 2, -height / 2);
                context.clearRect(0, 0, width, height);
                context.translate(d3.event.transform.x, d3.event.transform.y);
                context.scale(d3.event.transform.k, d3.event.transform.k);
                context.translate(width / 2, height / 2);
                dataTable.forEach(d => {
                    context.beginPath();
                    canvasLine(d);
                    context.lineWidth = 1;
                    if ($("#checkDarkmode").is(':checked')) {
                        //context.globalCompositeOperation = "screen"
                        context.strokeStyle = "#FFFFFF";
                    } else {
                        //context.globalCompositeOperation = "darken"
                        context.strokeStyle = "#2E2E2E";
                    }
                    context.stroke();
                })
                context.restore();
            }

            return jsontable

        })

        /*
        CREATE HEATMAP
        */
        .then(data => {

            //****** PREPARE DATA ******//

            heatmapArray = []
            xProjectKeys = Array.from(new Set(data.nodes.map(d => d.group))).sort()
            yProjectKeys = Array.from(new Set(data.nodes.map(d => d.group))).sort().reverse()

            var heatmapGroups = d3.nest()
                .key(d => d.sourceProj)
                .key(d => d.targetProj)
                .rollup(d => d.length)
                .entries(data.links)


            //create shell heatmap array
            for (let x = 0; x < xProjectKeys.length; x++) {
                for (let y = 0; y < yProjectKeys.length; y++) {
                    heatmapArray.push({
                        source: xProjectKeys[x],
                        sourceName: data.nodes.find(d => d.group == xProjectKeys[x]).projectName,
                        target: yProjectKeys[y],
                        targetName: data.nodes.find(d => d.group == yProjectKeys[x]).projectName,
                        value: 0
                    })
                }
            }

            //fill heatmap array values
            heatmapGroups.forEach(d => {
                //source
                source = d.key
                for (let e = 0; e < d.values.length; e++) {
                    //target
                    target = d['values'][e]['key']
                    //value
                    value = d['values'][e]['value']

                    heatmapArray.find(d => d.source == source && d.target == target).value = value

                }
            })

            max = d3.max(heatmapArray, d => d.value)

            //**** END PREPARE DATA ****//

            //****** CREATE CHART ******//

            const tableSVG = d3.select("#tableChart").select("svg");

            // Build X scale
            var x = d3.scaleBand()
                .range([0, Math.min(width, height) - margin.left - margin.right])
                .domain(xProjectKeys)
                .padding(0.01);

            // Build Y scale
            var y = d3.scaleBand()
                .range([Math.min(width, height) - margin.top - margin.bottom, 0])
                .domain(yProjectKeys)
                .padding(0.01);

            // Build color scale
            colourSchemeHeatmap = d3.scaleLinear()
                .range(["#FFFFFF", "#FF2D55"])
                .domain([0, max])

            //cells

            var roundedEdgeScale = d3.scaleLinear()
                .domain([0, 50])
                .range([10, 1])

            tableSVG.selectAll()
                .data(heatmapArray)
                .enter()
                .append("rect")
                .attr("id", "heatmapRect")
                .attr("x", function (d) {
                    return x(d.source)
                })
                .attr("y", function (d) {
                    return y(d.target)
                })
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .attr("cursor", "pointer")
                .attr("rx", Math.max(roundedEdgeScale(xProjectKeys.length).toFixed(0), 1))
                .attr("ry", Math.max(roundedEdgeScale(xProjectKeys.length).toFixed(0), 1))
                .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
                .style("fill", d => d.source == d.target && !$("#checkInternal").is(':checked') ? "#CCCCCC" : colourSchemeHeatmap(d.value))
                .style("opacity", d => d.source == d.target && !$("#checkInternal").is(':checked') ? 0 : d.value == 0 ? 0.2 : 1)
                .on("mouseover", d => {
                    return $("#checkInternal").is(':checked') || (d.source != d.target && !$("#checkInternal").is(':checked')) ? tooltipDemo.style("visibility", "visible") : null
                })
                .on("mousemove", function (d, i) {
                    var m = d3.mouse(rootSVG.node())
                    scr.x = window.scrollX
                    scr.y = window.scrollY
                    m[0] += svgpos.x
                    m[1] += svgpos.y
                    tooltipDemo.style("right", "")
                    tooltipDemo.style("left", "")
                    tooltipDemo.style("bottom", "")
                    tooltipDemo.style("top", "")
                    if (d.value > 0) {
                        tooltipDemo.html("<h4 style='color:white'>" + d.source + " has <span style='color:" + colourSchemeHeatmap(d.value) + ";'>" + d.value + "</span> dependencies logged against " + d.target + "<hr>" +
                            "<table><tbody>" +
                            "<tr><td>" + d.source + ": " + "</td><td>" + data.links.find(e => d.source == e.sourceProj).sourceProjectName + "</td></tr>" +
                            "<tr><td>" + d.target + ": " + "</td><td>" + data.links.find(e => d.target == e.targetProj).targetProjectName + "</td></tr>" +
                            "</tbody></table><hr>")
                    } else {
                        tooltipDemo.html("<h4 style='color:white'>" + d.source + " has no dependencies logged against " + d.target + "</h4>")
                    }

                    if (m[0] > scr.x + scr.w / 2) {
                        tooltipDemo.style("right", (body.w - m[0] + dist.x) - chart.left + parseInt($('#appContainer').css(("marginLeft").replace('px', ''))) + "px");
                    } else {
                        tooltipDemo.style("left", (m[0] + dist.x) - chart.left + parseInt($('#appContainer').css(("marginLeft").replace('px', ''))) + "px");
                    }
                    tooltipDemo.style("top", (m[1] - dist.y - header.height - tooltipDemo.node().getBoundingClientRect().height) - parseInt($('#appContainer').css(("marginTop").replace('px', ''))) + "px");
                    $("#checkInternal").is(':checked') || (d.source != d.target && !$("#checkInternal").is(':checked')) ? tooltipDemo.style("visibility", "visible") : null

                })
                .on("mouseout", function () {
                    tooltipDemo.style("visibility", "hidden")
                })

            //heatmap text
            tableSVG.selectAll()
                .data(heatmapArray)
                .enter()
                .append("text")
                .attr("id", "heatmapText")
                .attr("x", function (d) {
                    return x(d.source) + x.bandwidth() / 2
                })
                .attr("y", function (d) {
                    return y(d.target) + y.bandwidth() / 2
                })
                .attr("dy", "0.35em")
                .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
                .attr("text-anchor", "middle")
                .style("pointer-events", "none")
                .style("fill", (d, i) => {
                    return d3.hsl(colourSchemeHeatmap(d.value)).l < 0.64 ? "#FFFFFF" : "#2E2E2E"
                })
                .text(d => d.value > 0 ? d.value : null)
                .each(function (d, i) {
                    var thisWidth = this.getComputedTextLength()
                    thisWidth < x.bandwidth() ? null : this.remove()
                })

            //add axes
            tableSVG.append("g")
                .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
                .call(d3.axisTop(x).tickSizeOuter(0))
                .attr("class", "axis")
                .selectAll("text")
                .attr("x", 10)
                .attr("dy", "0.35em")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "start")

            tableSVG.append("g")
                .attr("transform", "translate(" + (margin.left) + "," + (width - margin.bottom) + ")")
                .call(d3.axisBottom(x).tickSizeOuter(0))
                .attr("class", "axis")
                .selectAll("text")
                .attr("x", 10)
                .attr("dy", "0.35em")
                .attr("transform", "rotate(45)")
                .style("text-anchor", "start")

            tableSVG.append("g")
                .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
                .call(d3.axisLeft(y).tickSizeOuter(0))
                .attr("class", "axis")

            tableSVG.append("g")
                .attr("transform", "translate(" + (width - margin.right) + "," + (margin.top) + ")")
                .call(d3.axisRight(y).tickSizeOuter(0))
                .attr("class", "axis")

            // create a tooltipDemo
            var tooltipDemo = d3.select("#tableChart")
                .append("div")
                .attr("class", "tooltipDemo")
                .style("position", "absolute")
                .style("visibility", "hidden");

            // calculate most of the coordinates for tooltipDemoping just once:
            rootSVG = d3.select("#tableChart").select("svg");
            rootRingSVG = d3.select("#chart").select("svg");
            rootSankeySVG = d3.select("#sankeyChart").select("svg");
            scr = {
                x: window.scrollX,
                y: window.scrollY,
                w: window.innerWidth,
                h: window.innerHeight
            };
            // it's jolly rotten but <body> width/height can be smaller than the SVG it's carrying inside! :-((
            body_sel = d3.select('body');
            // this is browser-dependent, but screw that for now!
            body = {
                w: body_sel.node().offsetWidth,
                h: body_sel.node().offsetHeight
            };
            svgpos = getNodePos(rootSVG.node());
            svgRingpos = getNodePos(rootRingSVG.node());
            svgSankeypos = getNodePos(rootSankeySVG.node());
            dist = {
                x: 20,
                y: -10
            };
            chart = $("#tableChart").position();
            header = d3.select(".banner").node().getBoundingClientRect();
            width = d3.select('#chart').node().getBoundingClientRect().width;

            //**** END CREATE CHART ****//
            return [data, heatmapArray]
        })

        /*
        CREATE SANKEY
        */
        .then(data => {
            ringData = data[0]
            heatmapData = data[1]
            console.log(width)
            sankeyProjects = (heatmapData.map(d => d.source))
                .concat(heatmapData.map(d => d.target))
                .unique()

            var sankeyNodes = removeDuplicates(heatmapData.map(function (d) {
                return {
                    name: d.source + 'source',
                    project: d.source
                }
            }).concat(heatmapData.map(function (d) {
                return {
                    name: d.target + 'target',
                    project: d.target
                }
            })))
            sankeyNodes.forEach(d => {
                d.projectName = ringData.nodes.find(e => e.group == d.project).projectName
            })

            var sankeyLinks = heatmapData.map(function (d) {
                return {
                    source: sankeyNodes.findIndex(e => e.name == d.source + "source"),
                    sourceName: d.sourceName,
                    target: sankeyNodes.findIndex(e => e.name == d.target + "target"),
                    targetName: d.targetName,
                    value: d.value
                }
            })

            var sankeyData = {
                nodes: sankeyNodes,
                links: sankeyLinks
            }

            colourSchemeSankey = d3.scaleSequential()
                .interpolator(d3.interpolateRainbow)
                .domain([0, sankeyProjects.length].reverse());

            const svg = d3.select("#sankeyContainer")

            const sankey = d3.sankey()
                .nodeWidth(50)
                // .nodePadding(80)
                .nodeAlign(d3.sankeyCenter)
                .nodeSort((a, b) => {
                    //if the node is a source node, do normal sort. otherwise for target nodes do a reverse sort
                    if (a.sourceLinks.length > 0) {
                        return a.index - b.index
                    } else return b.index - a.index

                })
                .iterations(1000)
                .size([width - margin.left - margin.right, height - margin.top - margin.bottom]);

            var graph = sankey(sankeyData);

            const link = svg.append('g')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .selectAll('path')
                .data(sankeyData.links)
                .enter().append('path')
                .attr('class', 'sankeyLink')
                .attr('d', d3.sankeyLinkHorizontal())
                .style('stroke-width', d => d.width)
                .on("mouseover", function () {
                    return tooltipDemo.style("visibility", "visible");
                })
                .on("mousemove", function (d, i) {

                    var m = d3.mouse(rootSankeySVG.node());
                    scr.x = window.scrollX;
                    scr.y = window.scrollY;
                    m[0] += svgSankeypos.x;
                    m[1] += svgSankeypos.y;
                    tooltipDemo.style("right", "");
                    tooltipDemo.style("left", "");
                    tooltipDemo.style("bottom", "");
                    tooltipDemo.style("top", "");
                    tooltipDemo.html("<h4 style='color:white'>" + d.source.project + " has " + d.value + " dependencies logged against " + d.target.project + "<hr>" +
                        "<table><tbody>" +
                        "<tr><td>" + d.source.project + ": " + "</td><td>" + d.source.projectName + "</td></tr>" +
                        "<tr><td>" + d.target.project + ": " + "</td><td>" + d.target.projectName + "</td></tr>" +
                        "</tbody></table>")
                    if (m[0] > scr.x + scr.w / 2) {
                        tooltipDemo.style("right", (body.w - m[0] + dist.x) - chart.left + parseInt($('#appContainer').css(("marginLeft").replace('px', ''))) + "px");
                    } else {
                        tooltipDemo.style("left", (m[0] + dist.x) - chart.left + parseInt($('#appContainer').css(("marginLeft").replace('px', ''))) + "px");
                    }
                    tooltipDemo.style("top", (m[1] - dist.y - header.height - tooltipDemo.node().getBoundingClientRect().height) - parseInt($('#appContainer').css(("marginTop").replace('px', ''))) + "px");
                    $("#checkInternal").is(':checked') || (d.source != d.target && !$("#checkInternal").is(':checked')) ? tooltipDemo.style("visibility", "visible") : null
                })
                .on("mouseout", function () {
                    return tooltipDemo.style("visibility", "hidden");
                });

            const node = svg.append('g')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .selectAll('.sankeyNode')
                .data(sankeyData.nodes)
                .enter().append('g')
                .attr('class', 'sankeyNode')
                .attr('transform', d => `translate(${d.x0},${d.y0})`)
                .call(d3.drag()
                    .subject(d => d)
                    .on('start', function () {
                        this.parentNode.appendChild(this);
                    })
                    .on('drag', dragmove))
                .on("mouseover", function () {
                    return tooltipDemo.style("visibility", "visible");
                })
                .on("mousemove", function (d, i) {
                    var m = d3.mouse(rootSankeySVG.node())
                    scr.x = window.scrollX
                    scr.y = window.scrollY
                    m[0] += svgSankeypos.x
                    m[1] += svgSankeypos.y
                    tooltipDemo.style("right", "")
                    tooltipDemo.style("left", "")
                    tooltipDemo.style("bottom", "")
                    tooltipDemo.style("top", "")
                    tooltipDemoString = ""
                    tooltipDemoArray = []

                    //construct tooltipDemo
                    if (d.sourceLinks.length > 0) {
                        tooltipDemoArray = d.sourceLinks.sort((a, b) => b.value - a.value)

                        tooltipDemoString = "<h4 style='color:white'>" + d.projectName + " has raised " + d.value + " total dependencies <hr>" +
                            "Top " + Math.min(tooltipDemoArray.length, 3) + " Dependencies:</h4>" +
                            "<table><tbody>"

                        for (i = 0; i < Math.min(tooltipDemoArray.length, 3); i++) {
                            tooltipDemoString += "<tr><td>#" + (i + 1) + " " + tooltipDemoArray[i].target.projectName + ": " + "</td><td>" + tooltipDemoArray[i].value + "</td></tr>"
                        }

                        tooltipDemoString += "</tbody></table>"

                        tooltipDemo.html(tooltipDemoString)
                    } else {
                        tooltipDemoArray = d.targetLinks.sort((a, b) => b.value - a.value)

                        tooltipDemoString = "<h4 style='color:white'>" + d.projectName + " has had " + d.value + " total dependencies raised against them<hr>" +
                            "Top " + Math.min(tooltipDemoArray.length, 3) + " Dependencies:</h4>" +
                            "<table><tbody>"

                        for (i = 0; i < Math.min(tooltipDemoArray.length, 3); i++) {
                            tooltipDemoString += "<tr><td>#" + (i + 1) + " " + tooltipDemoArray[i].source.projectName + ": " + "</td><td>" + tooltipDemoArray[i].value + "</td></tr>"
                        }

                        tooltipDemoString += "</tbody></table>"

                        tooltipDemo.html(tooltipDemoString)
                    }

                    if (m[0] > scr.x + scr.w / 2) {
                        tooltipDemo.style("right", (body.w - m[0] + dist.x) - chart.left + parseInt($('#appContainer').css(("marginLeft").replace('px', ''))) + "px");
                    } else {
                        tooltipDemo.style("left", (m[0] + dist.x) - chart.left + parseInt($('#appContainer').css(("marginLeft").replace('px', ''))) + "px");
                    }
                    tooltipDemo.style("top", (m[1] - dist.y - header.height - tooltipDemo.node().getBoundingClientRect().height) - parseInt($('#appContainer').css(("marginTop").replace('px', ''))) + "px");
                    $("#checkInternal").is(':checked') || (d.source != d.target && !$("#checkInternal").is(':checked')) ? tooltipDemo.style("visibility", "visible") : null

                    //set sankeyLink hover color/opacity
                    d3.selectAll(".sankeyLink")
                        .transition()
                        .style("stroke", e => {
                            if ((d.sourceLinks.length > 0 && d.project == e.source.project) || (d.targetLinks.length > 0 && d.project == e.target.project)) {
                                return colourSchemeSankey(sankeyProjects.indexOf(d.project))
                            } else if ($("#checkDarkmode").is(':checked')) {
                                return "#FFFFFF"
                            } else return "#2E2E2E"
                        })
                        .style("stroke-opacity", e => {
                            if ((d.sourceLinks.length > 0 && d.project == e.source.project) || (d.targetLinks.length > 0 && d.project == e.target.project)) {
                                return 0.8
                            } else return 0.2
                        })
                })
                .on("mouseout", function () {
                    tooltipDemo.style("visibility", "hidden");

                    //set sankeyLink hover color/opacity
                    d3.selectAll(".sankeyLink").transition().style("stroke-opacity", 0.2)

                    adjustDarkMode()
                });

            link.attr('d', d3.sankeyLinkHorizontal());
            sankey.update(graph);

            node.append('rect')
                .attr('class', 'sankeyNodeRect')
                .attr('height', d => d.y1 - d.y0)
                .attr('width', d => d.x1 - d.x0)
                .style('fill', d => colourSchemeSankey(sankeyProjects.indexOf(d.project)))
                .style('stroke', 'none')
                .append('text')
            //.text(d => `${d.name}\n${format(d.value)}`);

            node.append('text')
                .attr('class', 'sankeyNodeText')
                .attr('x', 0)
                .attr('y', d => (d.y1 - d.y0) / 2)
                .attr('dx', sankey.nodeWidth() / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('transform', null)
                .attr('pointer-events', 'none')
                .style("fill", (d, i) => {
                    return d3.hsl(colourSchemeSankey(sankeyProjects.indexOf(d.project))).l < 0.64 ? "#FFFFFF" : "#2E2E2E"
                })
                .text(d => d.project)

            //show the text if it fits
            d3.selectAll('.sankeyNodeText')
                .attr('display', function (d) {
                    if (d3.select(this).node().getBBox().height > (d.y1 - d.y0)) return "none"
                    else return null
                })

            // create a tooltipDemo
            var tooltipDemo = d3.select("#sankeyChart")
                .append("div")
                .attr("class", "tooltipDemo")
                .style("position", "absolute")
                .style("visibility", "hidden");

            // calculate most of the coordinates for tooltipDemoping just once:
            rootSVG = d3.select("#tableChart").select("svg");
            rootRingSVG = d3.select("#chart").select("svg");
            rootSankeySVG = d3.select("#sankeyChart").select("svg");
            scr = {
                x: window.scrollX,
                y: window.scrollY,
                w: window.innerWidth,
                h: window.innerHeight
            };
            // it's jolly rotten but <body> width/height can be smaller than the SVG it's carrying inside! :-((
            body_sel = d3.select('body');
            // this is browser-dependent, but screw that for now!
            body = {
                w: body_sel.node().offsetWidth,
                h: body_sel.node().offsetHeight
            };
            svgpos = getNodePos(rootSVG.node());
            svgRingpos = getNodePos(rootRingSVG.node());
            svgSankeypos = getNodePos(rootSankeySVG.node());
            dist = {
                x: 20,
                y: -10
            };
            chart = $("#tableChart").position();
            header = d3.select(".banner").node().getBoundingClientRect();
            width = d3.select('#chart').node().getBoundingClientRect().width;

            function dragmove(d) {
                var rectY = d3.select(this).select("rect").attr("y"),
                    rectX = d3.select(this).select("rect").attr("x");

                d.x0 = d.x0 + d3.event.dx;
                d.x1 = d.x1 + d3.event.dx;
                d.y0 = d.y0 + d3.event.dy;
                d.y1 = d.y1 + d3.event.dy;

                var yTranslate = d.y0 - rectY,
                    xTranslate = d.x0 - rectX;

                d3.select(this).attr("transform",
                    "translate(" + xTranslate + "," + yTranslate + ")");
                link.attr('d', d3.sankeyLinkHorizontal());
                sankey.update(graph);

            }

            //add headings
            svg.append('g')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .append('text')
                .attr('class', 'uppercaseHeading')
                .attr('text-anchor', 'middle')
                .attr('y', -12)
                .attr('dx', sankey.nodeWidth() / 2)
                .attr('dy', '-1.35em')
                .text('Team')

            svg.append('g')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .append('text')
                .attr('class', 'uppercaseHeading')
                .attr('text-anchor', 'middle')
                .attr('y', -10)
                .attr('dx', sankey.nodeWidth() / 2)
                .attr('dy', '-0.35em')
                .text('Raised')

            svg.append('g')
                .attr("transform", "translate(" + (width - margin.right) + "," + margin.top + ")")
                .append('text')
                .attr('class', 'uppercaseHeading')
                .attr('text-anchor', 'middle')
                .attr('y', -12)
                .attr('dx', -sankey.nodeWidth() / 2)
                .attr('dy', '-1.35em')
                .text('Team')

            svg.append('g')
                .attr("transform", "translate(" + (width - margin.right) + "," + margin.top + ")")
                .append('text')
                .attr('class', 'uppercaseHeading')
                .attr('text-anchor', 'middle')
                .attr('y', -10)
                .attr('dx', -sankey.nodeWidth() / 2)
                .attr('dy', '-0.35em')
                .text('Received')

            //**** END CREATE CHART ****//
            return [ringData, heatmapData, sankeyProjects]
        })

        /*
        CREATE FORCE LAYOUT
        */
        .then(data => {
            forceTable = data[0]
            forceProjects = data[2]
            colourToNode = {};
            var nextCol = 1;
            forceObjects = {}
            forceProjects.forEach(d => {
                forceObjects[d] = null
                colour = genColour()
                colourToNode[colour] = d
                forceProjects[d] = colour
            })
            forceTable.nodes.forEach(d => {
                d.groupId = forceProjects.indexOf(d.group)
                d.hiddenCol = genColour()
                colourToNode[d.hiddenCol] = d
            })

            // create a tooltipDemo
            var tooltipDemo = d3.select("#forceChart")
                .append("div")
                .attr("id","tooltipForce")
                .attr("class", "tooltipDemo")
                .style("position", "absolute")
                .style("visibility", "hidden");

            var radius = d3.scaleLinear()
                .domain([1, d3.max(forceTable.nodes, d => d.total)])
                .range([5, 15])

            var forceFontSize = d3.scaleLinear()
                .domain([1, 100000])
                .range([14, 36])

            //initialise force space
            d3.select("#forceChart").append("canvas")
                .attr("width", width)
                .attr("height", height)
                .attr("id", "forceContainer");

            d3.select("#forceChart").append("canvas")
                .attr("width", width)
                .attr("height", height)
                .attr("id", "forceContainerHidden")
                .style("display", "none")

            var forceContext = d3.select("#forceContainer").node().getContext('2d')
            var forceContextHidden = d3.select("#forceContainerHidden").node().getContext('2d')

            polygonPath = d3.line()
                .x(function (d) {
                    return d[0];
                })
                .y(function (d) {
                    return d[1];
                })
                .curve(d3.curveCatmullRomClosed)
                .context(forceContext)

            polygonPathHidden = d3.line()
                .x(function (d) {
                    return d[0];
                })
                .y(function (d) {
                    return d[1];
                })
                .curve(d3.curveCatmullRomClosed)
                .context(forceContextHidden)

            var simulation = d3.forceSimulation()
                // .force('link', d3.forceLink().id(function (d) {
                //     return d.id;
                // }))
                .force('charge', d3.forceManyBody())
            // .force('center', d3.forceCenter(width / 2, height / 2))
            //.force("collide", d3.forceCollide().strength(.1).radius(32).iterations(1))

            var transform = d3.zoomIdentity;

            var groupingForce = forceInABox()
                .strength(0.075) // Strength to foci
                .template("treemap") // Either treemap or force
                .groupBy("groupId") // Node attribute to group
                .links(forceTable.links) // The graph links. Must be called after setting the grouping attribute
                .enableGrouping(true)
                .nodeSize(10) // Used to compute the size of the template nodes, think of it as the radius the node uses, including its padding
                .forceCharge(-25) // Separation between nodes on the force template
                .size([width, height]); // Size of the chart

            simulation
                .nodes(forceTable.nodes)
                .force("group", groupingForce)
                .force(
                    "link", d3.forceLink()
                    .id(function (d) {
                        return d.id
                    })
                    .distance(50)
                    .strength(groupingForce.getLinkStrength)
                );

            simulation.nodes(forceTable.nodes)
                .on("tick", simulationUpdate);

            simulation.force("link")
                .links(forceTable.links);

            d3.select("#forceContainer")
                .call(d3.drag().subject(dragsubject).on("start", dragstarted).on("drag", dragged).on("end", dragended))
                .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))
                .on("mousemove", function () {
                    var m = d3.mouse(this);
                    console.log(m)
                    var col = forceContextHidden.getImageData(m[0], m[1], 1, 1).data;

                    //Our map uses these rgb strings as keys to nodes.
                    var colString = "rgb(" + col[0] + "," + col[1] + "," + col[2] + ")";
                    var obj = colourToNode[colString];
                    canvasZoomValue = d3.zoomTransform(d3.select("#forceContainer").node())

                    //node
                    if (typeof obj === 'object') {
                        
                        tooltipDemo.style("visibility", "visible")
                        tooltipDemo.style("right", "")
                        tooltipDemo.style("left", "")
                        tooltipDemo.style("bottom", "")
                        tooltipDemo.style("top", "")

                        sourceLength = obj.sourceIds ? obj.sourceIds.length : 0
                        targetLength = obj.targetIds ? obj.targetIds.length : 0
                        tooltipDemo.html("<h4 style='color:#FFFFFF'>ID: " + obj.id + "<br>" +
                            "Summary: " + obj.summary + "<hr>" +
                            "<table><tbody>" +
                            "<tr><td>Received Dependencies: </td><td><span style='color:#4CD964'>" + sourceLength + "</span></td></tr>" +
                            "<tr><td>Raised Dependencies: </td><td><span style='color:#FF2D55'>" + targetLength + "</span></td></tr>" +
                            "</tbody></table><hr>")

                        if (m[0] > width / 2) {
                            tooltipDemo.style("left", m[0] + document.getElementById("forceContainer").getBoundingClientRect().left - document.getElementById('tooltipForce').offsetWidth + 'px')
                        } else {
                            tooltipDemo.style("left", m[0] + document.getElementById("forceContainer").getBoundingClientRect().left + 20 + 'px')
                        }
                        if (m[1] > height / 2) {
                            console.log("bottom")
                            tooltipDemo.style("top", m[1] + document.getElementById("forceContainer").getBoundingClientRect().top - document.getElementById('tooltipForce').offsetHeight + 250 + 'px')
                        } else {
                            console.log("top")
                            tooltipDemo.style("top", m[1] + document.getElementById("forceContainer").getBoundingClientRect().top - 50 + 'px')
                        }
                        simulation.stop()
                        simulationUpdate(obj)
                    }
                    //group
                    else if (typeof obj === 'string') {
                        tooltipDemo.style("visibility", "visible")
                        tooltipDemo.style("right", "")
                        tooltipDemo.style("left", "")
                        tooltipDemo.style("bottom", "")
                        tooltipDemo.style("top", "")

                        projectName = forceTable.nodes.find(e => obj == e.group).projectName
                        sourceLength = forceTable.links.filter(e => obj == e.target.group && obj != e.source.group).length
                        targetLength = forceTable.links.filter(e => obj == e.source.group && obj != e.target.group).length
                        internalLength = forceTable.links.filter(e => obj == e.source.group && obj == e.target.group).length
                        if ($("#checkInternal").is(':checked')) {
                            tooltipDemo.html("<h4 style='color:#FFFFFF'>ID: " + obj + "<br>" +
                                "Name: " + projectName + "<hr>" +
                                "<table><tbody>" +
                                "<tr><td>Received Dependencies: </td><td><span style='color:#4CD964'>" + sourceLength + "</span></td></tr>" +
                                "<tr><td>Raised Dependencies: </td><td><span style='color:#FF2D55'>" + targetLength + "</span></td></tr>" +
                                "<tr><td>Internal Dependencies: </td><td><span style='color:#34AADC'>" + internalLength + "</span></td></tr>" +
                                "</tbody></table><hr>")
                        } else {
                            tooltipDemo.html("<h4 style='color:#FFFFFF'>ID: " + obj + "<br>" +
                                "Name: " + projectName + "<hr>" +
                                "<table><tbody>" +
                                "<tr><td>Received Dependencies: </td><td><span style='color:#4CD964'>" + sourceLength + "</span></td></tr>" +
                                "<tr><td>Raised Dependencies: </td><td><span style='color:#FF2D55'>" + targetLength + "</span></td></tr>" +
                                "</tbody></table><hr>")
                        }

                        if (m[0] > width / 2) {
                            tooltipDemo.style("left", m[0] + document.getElementById("forceContainer").getBoundingClientRect().left - document.getElementById('tooltipForce').offsetWidth + 'px')
                        } else {
                            tooltipDemo.style("left", m[0] + document.getElementById("forceContainer").getBoundingClientRect().left + 20 + 'px')
                        }
                        if (m[1] > height / 2) {
                            console.log("bottom")
                            tooltipDemo.style("top", m[1] + document.getElementById("forceContainer").getBoundingClientRect().top - document.getElementById('tooltipForce').offsetHeight + 250 + 'px')
                        } else {
                            console.log("top")
                            tooltipDemo.style("top", m[1] + document.getElementById("forceContainer").getBoundingClientRect().top - 50 + 'px')
                        }
                        simulation.stop()
                        simulationUpdate(obj)
                    } else {
                        tooltipDemo.style("visibility", "hidden")
                        simulation.restart()
                        simulationUpdate()

                    }
                })
                .on("mouseout", function () {
                    tooltipDemo.style("visibility", "hidden")
                    simulation.restart()
                    simulationUpdate()
                })
            // .on("mousemove", function (d, i) {
            //     var m = d3.mouse(rootRingSVG.node())
            //     scr.x = window.scrollX
            //     scr.y = window.scrollY
            //     m[0] += svgRingpos.x
            //     m[1] += svgRingpos.y
            //     sourceLength = d.data.sourceIds ? d.data.sourceIds.length : 0
            //     targetLength = d.data.targetIds ? d.data.targetIds.length : 0
            //     tooltipDemo.style("right", "")
            //     tooltipDemo.style("left", "")
            //     tooltipDemo.style("bottom", "")
            //     tooltipDemo.style("top", "")
            //     tooltipDemo.html("<h4 style='color:#FFFFFF'>ID: " + d.data.id + "<br>" +
            //         "Summary: " + d.data.summary + "<hr>" +
            //         "<table><tbody>" +
            //         "<tr><td>Received Dependencies: </td><td><span style='color:#4CD964'>" + sourceLength + "</span></td></tr>" +
            //         "<tr><td>Raised Dependencies: </td><td><span style='color:#FF2D55'>" + targetLength + "</span></td></tr>" +
            //         "</tbody></table><hr>")

            //     if (m[0] > scr.x + scr.w / 2) {
            //         tooltipDemo.style("right", (body.w - m[0] + dist.x) - chart.left + parseInt($('#appContainer').css(("marginLeft").replace('px', ''))) + "px");
            //     } else {
            //         tooltipDemo.style("left", (m[0] + dist.x) - chart.left + parseInt($('#appContainer').css(("marginLeft").replace('px', ''))) + "px");
            //     }
            //     tooltipDemo.style("top", (m[1] - dist.y - header.height - tooltipDemo.node().getBoundingClientRect().height) - parseInt($('#appContainer').css(("marginTop").replace('px', ''))) + "px");
            //     tooltipDemo.style("visibility", "visible")

            // })

            // count members of each group. Groups with less
            // than 3 member will not be considered (creating
            // a convex hull need 3 points at least)
            groupIds = d3.set(forceTable.nodes.map(function (n) {
                    return +n.groupId;
                }))
                .values()
                .map(function (groupId) {
                    return {
                        groupId: groupId,
                        count: forceTable.nodes.filter(function (n) {
                            return +n.groupId == groupId;
                        }).length
                    };
                })
                .filter(function (group) {
                    return group.count > 2;
                })
                .map(function (group) {
                    return group.groupId;
                });

            function zoomed() {
                transform = d3.event.transform;
                simulationUpdate();
            }

            function dragsubject() {
                var i,
                    x = transform.invertX(d3.event.x),
                    y = transform.invertY(d3.event.y),
                    dx,
                    dy;
                //check if node
                for (i = forceTable.nodes.length - 1; i >= 0; --i) {
                    node = forceTable.nodes[i];
                    dx = x - node.x;
                    dy = y - node.y;

                    if (dx * dx + dy * dy < radius(forceTable.nodes[i].total) * radius(forceTable.nodes[i].total)) {

                        node.x = transform.applyX(node.x);
                        node.y = transform.applyY(node.y);

                        return node;
                    }
                }

                //check if group
                for (i = 0; i < groupIds.length; i++) {
                    group = groupIds[i]
                    if (d3.polygonContains(forceObjects[forceProjects[group]], [x, y])) {
                        return forceTable.nodes.filter(d => d.groupId == group)
                    }
                }
            }

            function dragstarted() {
                tooltipDemo.style("visibility", "hidden")
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                else if (Array.isArray(d3.event.subject)) {
                    // d3.event.subject.forEach(d => {
                    //     d.x = transform.invertX(d3.event.x)
                    //     d.y = transform.invertY(d3.event.y)
                    // })
                } else {
                    d3.event.subject.fx = transform.invertX(d3.event.x);
                    d3.event.subject.fy = transform.invertY(d3.event.y);
                }

            }

            function dragged() {
                if (Array.isArray(d3.event.subject)) {
                    d3.event.subject.forEach(d => {
                        d.x += d3.event.dx
                        d.y += d3.event.dy;
                    })
                } else {
                    d3.event.subject.fx = transform.invertX(d3.event.x);
                    d3.event.subject.fy = transform.invertY(d3.event.y);
                }

            }

            function dragended() {
                if (!d3.event.active) simulation.alphaTarget(0);
                d3.event.subject.fx = null;
                d3.event.subject.fy = null;
            }

            function simulationUpdate(obj) {
                forceContext.save();

                forceContext.clearRect(0, 0, width, height);
                forceContext.translate(transform.x, transform.y);
                forceContext.scale(transform.k, transform.k);
                forceContext.strokeWidth = 5

                forceContext.textAlign = "center";
                forceContext.textBaseline = 'middle';

                forceContextHidden.save();

                forceContextHidden.clearRect(0, 0, width, height);
                forceContextHidden.translate(transform.x, transform.y);
                forceContextHidden.scale(transform.k, transform.k);

                //draw the group polygons
                groupIds.forEach(function (groupId, i) {
                    //generate group polygon
                    polygon = polygonGenerator(groupId)
                    forceObjects[forceProjects[groupId]] = polygon

                    //add group text
                    centroid = d3.polygonCentroid(polygon)
                    forceContext.save()
                    forceContext.translate(centroid[0], centroid[1])

                    //add polygon area
                    forceContext.scale(1.1, 1.1)
                    forceContext.beginPath()
                    polygonPath(
                        polygon.map(function (point) {
                            return [point[0] - centroid[0], point[1] - centroid[1]];
                        }))

                    forceContext.closePath()
                    //group
                    if (typeof obj === 'string') {
                        if ((heatmapArray.filter(d => d.source == obj && d.target == forceProjects[groupId])[0].value > 0 || heatmapArray.filter(d => d.source == forceProjects[groupId] && d.target == obj)[0].value > 0)) {
                            //add text
                            if ($("#checkDarkmode").is(':checked')) {
                                forceContext.fillStyle = "#FFFFFF";
                            } else {
                                forceContext.fillStyle = "#2E2E2E";
                            }
                            forceContext.font = forceFontSize(d3.polygonArea(polygon)) + "px Roboto"
                            forceContext.fillText(forceProjects[groupId], 0, 0)

                            forceContext.globalAlpha = 1
                            forceContext.strokeStyle = colourSchemeSankey(groupId)
                            forceContext.stroke()
                            forceContext.globalAlpha = 0.2
                            forceContext.fillStyle = colourSchemeSankey(groupId)
                            forceContext.fill()
                        } else {
                            forceContext.globalAlpha = 0.05
                            forceContext.strokeStyle = "#333333"
                            forceContext.stroke()
                            forceContext.globalAlpha = 0.05
                            forceContext.fillStyle = "#333333"
                            forceContext.fill()
                        }
                        //node
                    } else if (typeof obj === 'object') {
                        if ((forceTable.links.filter(d => d.source.id == obj.id && d.target.group == forceProjects[groupId]).length > 0) || (forceTable.links.filter(d => d.source.group == forceProjects[groupId] && d.target.id == obj.id).length > 0)) {
                            //add text
                            if ($("#checkDarkmode").is(':checked')) {
                                forceContext.fillStyle = "#FFFFFF";
                            } else {
                                forceContext.fillStyle = "#2E2E2E";
                            }
                            forceContext.font = forceFontSize(d3.polygonArea(polygon)) + "px Roboto"
                            forceContext.fillText(forceProjects[groupId], 0, 0)

                            forceContext.globalAlpha = 1
                            forceContext.strokeStyle = colourSchemeSankey(groupId)
                            forceContext.stroke()
                            forceContext.globalAlpha = 0.2
                            forceContext.fillStyle = colourSchemeSankey(groupId)
                            forceContext.fill()
                        } else {
                            forceContext.globalAlpha = 0.05
                            forceContext.strokeStyle = "#333333"
                            forceContext.stroke()
                            forceContext.globalAlpha = 0.05
                            forceContext.fillStyle = "#333333"
                            forceContext.fill()
                        }
                        //neither
                    } else {
                        //add text
                        if ($("#checkDarkmode").is(':checked')) {
                            forceContext.fillStyle = "#FFFFFF";
                        } else {
                            forceContext.fillStyle = "#2E2E2E";
                        }
                        forceContext.font = forceFontSize(d3.polygonArea(polygon)) + "px Roboto"
                        forceContext.fillText(forceProjects[groupId], 0, 0)

                        forceContext.globalAlpha = 1
                        forceContext.strokeStyle = colourSchemeSankey(groupId)
                        forceContext.stroke()
                        forceContext.globalAlpha = 0.2
                        forceContext.fillStyle = colourSchemeSankey(groupId)
                        forceContext.fill()
                    }

                    forceContext.restore()

                    //draw hidden polygon
                    forceContextHidden.save()
                    forceContextHidden.translate(centroid[0], centroid[1])
                    forceContextHidden.scale(1.1, 1.1)
                    forceContextHidden.beginPath()
                    polygonPathHidden(
                        polygon.map(function (point) {
                            return [point[0] - centroid[0], point[1] - centroid[1]];
                        }))
                    forceContextHidden.closePath()
                    forceContextHidden.strokeStyle = forceProjects[forceProjects[groupId]]
                    forceContextHidden.fillStyle = forceProjects[forceProjects[groupId]]
                    forceContextHidden.globalAlpha = 1
                    forceContextHidden.stroke()
                    forceContextHidden.fill()
                    forceContextHidden.restore()
                });

                // Draw the links
                forceTable.links.forEach(function (d) {
                    //group
                    if (typeof obj === 'string') {
                        forceContext.globalAlpha = 0.8
                        if (d.sourceProj == obj && d.targetProj == obj) forceContext.strokeStyle = "#34AADC"
                        else if (d.sourceProj == obj) forceContext.strokeStyle = "#FF2D55"
                        else if (d.targetProj == obj) forceContext.strokeStyle = "#4CD964"
                        else {
                            forceContext.globalAlpha = 0
                            forceContext.strokeStyle = null
                        }

                        //node
                    } else if (typeof obj === 'object') {
                        forceContext.globalAlpha = 0.8
                        if (d.source.id == obj.id) {
                            forceContext.strokeStyle = "#FF2D55"
                        } else if (d.target.id == obj.id) {
                            forceContext.strokeStyle = "#4CD964"
                        } else if ($("#checkDarkmode").is(':checked')) {
                            forceContext.globalAlpha = 0
                            forceContext.strokeStyle = "#FFFFFF";
                        } else {
                            forceContext.globalAlpha = 0
                            forceContext.strokeStyle = null
                        }

                        //neither
                    } else {
                        forceContext.globalAlpha = 0.1
                        if ($("#checkDarkmode").is(':checked')) {
                            forceContext.strokeStyle = "#FFFFFF";
                        } else {
                            forceContext.strokeStyle = "#2E2E2E";
                        }
                    }


                    forceContext.beginPath();
                    forceContext.moveTo(d.source.x, d.source.y);
                    forceContext.lineTo(d.target.x, d.target.y);
                    forceContext.stroke();
                });

                // Draw the nodes
                if ($("#checkDarkmode").is(':checked')) {
                    forceContext.strokeStyle = "#FFFFFF";
                } else {
                    forceContext.strokeStyle = "#2E2E2E";
                }

                forceTable.nodes.forEach(function (d, i) {

                    forceContext.beginPath();
                    forceContext.arc(d.x, d.y, radius(d.total), 0, 2 * Math.PI, true);
                    //group
                    if (typeof obj === 'string') {
                        if (d.group == obj || (forceTable.links.filter(e => e.sourceProj == obj && e.target.id == d.id).length > 0) || (forceTable.links.filter(e => e.source.id == d.id && e.targetProj == obj).length > 0)) {
                            //if ((heatmapArray.filter(e => e.source == obj && e.target == d.group)[0].value > 0 || heatmapArray.filter(e => e.source == d.group && e.target == obj)[0].value > 0)) {
                            forceContext.globalAlpha = 1
                            forceContext.fillStyle = colourSchemeSankey(forceProjects.indexOf(d.group))
                        } else {
                            forceContext.globalAlpha = 0.05
                            forceContext.fillStyle = "#333333"
                        }
                        //node
                    } else if (typeof obj === 'object') {
                        if (d.id == obj.id || d.sourceIds.indexOf(obj.id) >= 0 || d.targetIds.indexOf(obj.id) >= 0) {
                            forceContext.globalAlpha = 1
                            forceContext.fillStyle = colourSchemeSankey(forceProjects.indexOf(d.group))
                        } else {
                            forceContext.globalAlpha = 0.05
                            forceContext.fillStyle = "#333333"
                        }
                        //neither
                    } else {
                        forceContext.globalAlpha = 1
                        forceContext.fillStyle = colourSchemeSankey(forceProjects.indexOf(d.group))
                    }

                    forceContext.fill();
                    forceContext.stroke();

                    //hidden node
                    forceContext.globalAlpha = 1
                    forceContextHidden.beginPath();
                    forceContextHidden.arc(d.x, d.y, radius(d.total), 0, 2 * Math.PI, true);
                    forceContextHidden.fillStyle = d.hiddenCol
                    forceContextHidden.fill();
                    forceContextHidden.stroke();
                });

                forceContext.restore();
                forceContextHidden.restore();
            }

            // select nodes of the group, retrieve its positions
            // and return the convex hull of the specified points
            // (3 points as minimum, otherwise returns null)
            var polygonGenerator = function (groupId) {
                var node_coords = forceTable.nodes
                    .filter(function (d) {
                        return d.groupId == groupId;
                    })
                    .map(function (d) {
                        return [d.x, d.y];
                    });
                return d3.polygonHull(node_coords);
            }

            function genColour() {
                var ret = [];
                if (nextCol < 16777215) {
                    ret.push(nextCol & 0xff); //R
                    ret.push((nextCol & 0xff00) >> 8); //G
                    ret.push((nextCol & 0xff0000) >> 16); //B

                    nextCol += 10;
                }
                var col = "rgb(" + ret.join(',') + ")";
                return col;
            }

            return data
        })

        //csv button
        .then(csvData => {
            ringData = csvData[0].links
            heatmapData = csvData[1]

            function convertToCSV(objArray) {
                var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
                var str = '';

                for (var i = 0; i < array.length; i++) {
                    var line = '';
                    for (var index in array[i]) {
                        if (line != '') line += ','

                        line += array[i][index];
                    }

                    str += line + '\r\n';
                }

                return str;
            }

            function exportCSVFile(headers, items, fileTitle) {
                if (headers) {
                    items.unshift(headers);
                }

                // Convert Object to JSON
                var jsonObject = JSON.stringify(items);

                var csv = convertToCSV(jsonObject);

                var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

                var blob = new Blob([csv], {
                    type: 'text/csv;charset=utf-8;'
                });
                if (navigator.msSaveBlob) { // IE 10+
                    navigator.msSaveBlob(blob, exportedFilenmae);
                } else {
                    var link = document.createElement("a");
                    if (link.download !== undefined) { // feature detection
                        // Browsers that support HTML5 download attribute
                        var url = URL.createObjectURL(blob);
                        link.setAttribute("href", url);
                        link.setAttribute("download", exportedFilenmae);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                }
            }

            var headersRing = {
                source: 'Source Issue Key',
                type: 'Dependency Type',
                target: 'Target Issue Key',
                sourceProj: 'Source Project Key',
                sourceProjectName: 'Source Project Name',
                sourceStatus: 'Source Issue Status',
                sourceStatusCategory: 'Source Issue Status Category',
                sourceEpicLink: 'Source Epic Key',
                sourceEpicName: 'Source Epic Name',
                targetProj: 'Target Project Key',
                targetProjectName: 'Target Project Name',
                targetStatus: 'Target Issue Status',
                targetStatusCategory: 'Target Issue Status Category',
                targetEpicLink: 'Target Epic Key',
                targetEpicName: 'Target Epic Name'
            }

            var csvDataRingFormatted = [];

            // format the data
            ringData.forEach(d => {
                csvDataRingFormatted.push({
                    source: d.source ? d.source.id.replace(/,/g, '') : null,
                    type: d.type ? d.type.replace(/,/g, '') : null, // remove commas to avoid errors,
                    target: d.target ? d.target.id.replace(/,/g, '') : null,
                    sourceProj: d.sourceProj ? d.sourceProj.replace(/,/g, '') : null,
                    sourceProjectName: d.sourceProjectName ? d.sourceProjectName.replace(/,/g, '') : null,
                    sourceStatus: d.sourceStatus ? d.sourceStatus.replace(/,/g, '') : null,
                    sourceStatusCategory: d.sourceStatusCategory ? d.sourceStatusCategory.replace(/,/g, '') : null,
                    sourceEpicLink: d.sourceEpicLink ? d.sourceEpicLink.replace(/,/g, '') : null,
                    sourceEpicName: d.sourceEpicName ? d.sourceEpicName.replace(/,/g, '') : null,
                    targetProj: d.targetProj ? d.targetProj.replace(/,/g, '') : null,
                    targetProjectName: d.targetProjectName ? d.targetProjectName.replace(/,/g, '') : null,
                    targetStatus: d.targetStatus ? d.targetStatus.replace(/,/g, '') : null,
                    targetStatusCategory: d.targetStatusCategory ? d.targetStatusCategory.replace(/,/g, '') : null,
                    targetEpicLink: d.targetEpicLink ? d.targetEpicLink.replace(/,/g, '') : null,
                    targetEpicName: d.targetEpicName ? d.targetEpicName.replace(/,/g, '') : null
                });
            });

            var headersHeatmap = {
                source: 'Source Project Key',
                sourceName: 'Source Project Name',
                target: 'Target Project Key',
                targetName: 'Target Project Name',
                value: 'Total Dependencies'
            }

            var csvDataHeatmapFormatted = [];
            // format the data
            heatmapData.forEach(d => {
                csvDataHeatmapFormatted.push({
                    source: d.source ? d.source.replace(/,/g, '') : null,
                    sourceName: d.source ? d.sourceName.replace(/,/g, '') : null,
                    target: d.target ? d.target.replace(/,/g, '') : null,
                    targetName: d.target ? d.targetName.replace(/,/g, '') : null,
                    value: d.value ? d.value : 0
                });
            });

            csvDataHeatmapFormatted = csvDataHeatmapFormatted.filter(d => d.value > 0).sort((a, b) => b.value - a.value)

            //add csv save button
            d3.select("#saveToCSVRing")
                .append("input")
                .attr("id", "saveToCSVButton")
                .attr("type", "submit")
                .attr("class", "submit")
                .style("float", "right")
                .property("value", "Save to CSV")
                .on('click', function () {
                    if ($('button.active').text() == "Individual Dependencies") {
                        exportCSVFile(headersRing, csvDataRingFormatted, 'dependency-ring-data')
                    } else if ($('button.active').text() == "Team Dynamics") {
                        exportCSVFile(headersHeatmap, csvDataHeatmapFormatted, 'dependency-sankey-data')
                    } else {
                        exportCSVFile(headersHeatmap, csvDataHeatmapFormatted, 'dependency-heatmap-data')
                    }

                    d3.event.stopPropagation() //removing this causes the csv to auto-download
                })

            // call the exportCSVFile() function to process the JSON and trigger the download
        })

        //all done!
        .then(() => {
            adjustDarkMode()
            stopLoading()

            //set all createViz buttons to be clickable
            d3.selectAll(".createViz").attr("class", "submit createViz")
                .attr("value", "Create Visualisation")
                .on("mouseover", function () {
                    d3.select(this).style("opacity", 1)
                })
                .on("mousemove", function () {
                    d3.select(this).style("opacity", 1)
                })
                .on("mouseout", function () {
                    d3.select(this).style("opacity", 1)
                })

            //set chart sections to enable minimise
            $("#sectionChart > a")
                .removeClass("loading")

            //show tab buttons
            d3.selectAll(".tablinks").transition().style("opacity", 1).style("pointer-events", "auto")
        })

        //error
        .catch(d => {
            console.log(d);
            text = d.err ? JSON.parse(d.err).errorMessages[0] : d
            if ($("#checkDarkmode").is(':checked')) {
                loadingText
                    .text(text)
                    .attr("white-space", "pre-wrap")
                    .transition()
                    .style("color", "#FFCC00")

                //on animation end
                d3.selectAll('.object')
                    .transition()
                    .style("background-color", "#FFCC00")
            } else {
                loadingText
                    .text(text)
                    .attr("white-space", "pre-wrap")
                    .transition()
                    .style("color", "#333333")

                //on animation end
                d3.selectAll('.object')
                    .transition()
                    .style("background-color", "#333333")
            }


            //set all createViz buttons to be clickable
            d3.selectAll(".createViz").attr("class", "submit createViz")
                .attr("value", "Create Visualisation")
                .on("mouseover", function () {
                    d3.select(this).style("opacity", 1)
                })
                .on("mousemove", function () {
                    d3.select(this).style("opacity", 1)
                })
                .on("mouseout", function () {
                    d3.select(this).style("opacity", 1)
                })

        }); //fail
}

/////////////////////////////////
/////// HELPER FUNCTIONS ////////
/////////////////////////////////

function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

function getNodePos(el) {
    var body = d3.select('body').node();

    for (var lx = 0, ly = 0; el != null && el != body; lx += (el.offsetLeft || el.clientLeft), ly += (el.offsetTop || el.clientTop), el = (el.offsetParent || el.parentNode))
    ;
    return {
        x: lx,
        y: ly
    };
}

Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
}

function startLoading() {
    //remove old svgs/canvas
    d3.selectAll("#loading-container").transition().style('opacity', 1);
    d3.select("#chart").transition().style('opacity', 0);
    d3.select("#tableChart").transition().style('opacity', 0);
    d3.selectAll('.object').style('animation-play-state', 'running');
    d3.selectAll("#saveToCSVButton").remove();
    d3.selectAll(".iframeButton").remove()
    d3.selectAll(".tooltipDemo").remove();
    d3.select("#chart").select("svg").remove();
    d3.select("#chart").select("canvas").remove();
    d3.select("#tableChart").select("svg").remove();
    d3.select("#sankeyChart").select("svg").remove();

    //add svgs/canvas
    d3.select('#chart').append('canvas')
        .attr("id", "parentCanvas")
        .attr('width', width)
        .attr('height', height)
        .style("position", "relative")

    d3.select("#chart").append("svg")
        .attr("id", "parentSVG")
        .attr("width", width)
        .attr("height", height)
        .style("position", "absolute")
        .style("top", $("#parentCanvas").position().top)
        .style("left", $("#parentCanvas").position().left);

    d3.select("#tableChart").append("svg")
        .attr("id", "parentSVG")
        .attr("width", Math.min(width, height))
        .attr("height", Math.min(width, height));

    //initialise sankey space
    d3.select("#sankeyChart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("id", "sankeyContainer");

    loadChart()

}

function stopLoading() {
    d3.selectAll("#loading-container").transition().style('opacity', 0);
    d3.selectAll("#loading-container").style('pointer-events', "none")
    d3.selectAll(".loading-buttons").transition().style("opacity", 0)
    d3.select("#chart").transition().style('opacity', 1);
    d3.select("#tableChart").transition().style('opacity', 1);
    d3.selectAll('.object').style('animation-play-state', 'paused');
}

document.addEventListener('keyup', function (event) {
    if (event.defaultPrevented) {
        return;
    }

    var key = event.key || event.keyCode;

    if (key === 'Enter' || key === 13) {
        startLoading();
    }
});

function selectFilter() {
    $("#selectFilter option:selected").text() != "" ? d3.select("#jqlInput").node().value = 'filter = "' + $("#selectFilter option:selected").text() + '"' : null
    testJQL()
}

function removeDuplicates(arr) {
    return Object.keys(arr.reduce((acc, val) => {
        acc[JSON.stringify(val)] = 1;

        return acc;
    }, {})).map((val, key, array) => JSON.parse(array[key]))
}

function getArcPath(newArc, d, i) {
    // Replace all the comma's so that IE can handle it -_-
    // The g after the / is a modifier that "find all matches rather than
    // stopping after the first match"
    newArc = newArc[1].replace(/,/g, " ");

    //if the centroid of the text lies in the bottom half of the circle
    //flip the end and start position
    if (arcs.centroid(d)[1] > 0) {

        //0 0 1 scenario
        if (newArc.includes("0 0 1")) {

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
                var middleSec = middleLoc.exec(newArc)[1];
                var newEnd = startLoc.exec(newArc)[1];

                //Build up the new arc notation, set the sweep-flag to 0
                newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
            }
        }
        //0 1 1 scenario
        else if (newArc.includes("0 1 1")) {

            //Everything between the capital M and first capital A
            var startLoc = /M(.*?)A/;
            //Everything between the capital A and 0 0 1
            var middleLoc = /A(.*?)0 1 1/;
            //Everything between the 0 0 1 and the end of the string (denoted by $)
            var endLoc = /0 1 1 (.*?)$/;

            //Flip the direction of the arc by switching the start and end point
            if (endLoc.exec(newArc) != null) {

                var newStart = endLoc.exec(newArc)[1];
                var middleSec = middleLoc.exec(newArc)[1];
                var newEnd = startLoc.exec(newArc)[1];

                //Build up the new arc notation, set the sweep-flag to 0
                newArc = "M" + newStart + "A" + middleSec + "0 1 0 " + newEnd;
            }
        }
    }

    return newArc
}

const textFits = d => {
    const CHAR_SPACE = 16;

    const deltaAngle = (d.value.x1) - (d.value.x0);
    //const r = Math.max(0, (Math.sqrt(d.value.y0) + Math.sqrt(d.value.y1)) / 2);
    const r = width / 2
    const perimeter = r * deltaAngle;

    //angle is too small, return null
    if (Math.floor(perimeter / CHAR_SPACE < 1)) return null

    //return text that will fit within angle
    newString = d.value.projectName.length * CHAR_SPACE < perimeter ? d.value.projectName : d.value.projectName.substring(0, Math.ceil(perimeter / CHAR_SPACE) - 1) + "..."

    return newString


};

// function checkboxSwitch() {

//     selectedValue = $("#selectGroupType").children("option:selected").val()

//     //rename data
//     var links = issuelinks;

//     //filter self-referencing node links
//     links = links.filter(d => {
//         return JSON.stringify(d.target) !== JSON.stringify(d.source);
//     });

//     var nodes = [];

//     //create base node table using the 'target' as key
//     var nodesDataTable = d3.nest()
//         .key(function (d) {
//             return d.target;
//         })
//         .key(d => d["target" + selectedValue])
//         .rollup(function (d) {
//             return {
//                 "total": d3.sum(d, function (d) {
//                     return d.count;
//                 }),
//             };
//         })
//         .entries(links);

//     nodesDataTable.forEach(function (d) {

//         //push object to nodes array
//         nodes.push({
//             'id': d.key,
//             'group': d.values[0]['key'],
//             'total': d.values[0]['value']['total']
//         });

//     });

//     var size = nodes.length * 500
//     var radius = size / 2;
//     var line = d3.radialLine()
//         .curve(d3.curveBundle.beta(0.85))
//         .radius(d => d.y)
//         .angle(d => d.x);
//     var tree = d3.cluster().size([2 * Math.PI, radius - 100])

//     arcs
//         .innerRadius((radius - 100) * 0.955)
//         .outerRadius(radius - 100);

//     //create same node table but with 'source' to add missing nodes to nodes
//     var sourceNodesDataTable = d3.nest()
//         .key(function (d) {
//             return d.source;
//         })
//         .key(function (d) {
//             return d["source" + selectedValue];
//         })
//         .rollup(function (d) {
//             return {
//                 "total": d3.sum(d, function (d) {
//                     return d.count;
//                 }),
//             };
//         })
//         .entries(links);

//     //loop through sourceNodesDataTable and append to nodes if value is missing
//     var indexValue = 0;
//     sourceNodesDataTable.forEach(d => {

//         //node does not exist, push sourceNodesData
//         if (nodes.findIndex(data => {
//                 return data.id == d.key
//             }) == -1) {
//             nodes.push({
//                 'id': d.key,
//                 'group': d.values[0]['key'],
//                 'total': d.values[0]['value']['total']
//             })
//         }
//         //node does exist, append sourceNodesData
//         else {
//             indexValue = nodes.findIndex(data => {
//                 return data.id == d.key
//             });
//             nodes[indexValue].total += d.values[0]['value']['total'];
//         }

//     })

//     const jsontable = {
//         "nodes": nodes,
//         "links": links
//     };

//     const groupById = new Map;
//     const nodeById = new Map(nodes.map(node => [node.id, node]));
//     for (const node of nodes) {
//         let group = groupById.get(node.group);
//         if (!group) groupById.set(node.group, group = {
//             name: node.group,
//             children: []
//         });
//         group.children.push(node);
//         node.targetIds = [];
//     }

//     for (const {
//             source: sourceId,
//             target: targetId
//         } of links) {
//         const source = nodeById.get(sourceId);
//         source.targetIds.push(targetId);
//     }

//     var data = {
//         name: "miserables",
//         children: [...groupById.values()]
//     };

//     const root = tree(d3.hierarchy(data));

//     const map = new Map(root.leaves().map(d => [d.data.id, d]));

//     const dataTable = d3.merge(root.leaves().map(d => d.data.targetIds.map(i => d.path(map.get(i)))));

//     var arcData = d3.nest()
//         .key(d => d.data.group)
//         .rollup(d => {

//             return {
//                 'x0': d[0]['x'],
//                 'x1': d[d.length - 1]['x'],
//                 'y0': arcs.innerRadius()(d),
//                 'y1': arcs.outerRadius()(d)
//             }
//         })
//         .entries(root.leaves());

//     colourSchemeRing = d3.scaleSequential()
//         .interpolator(d3[$("#selectRingColour").children("option:selected").val()])
//         .domain([0, arcData.length]);

//     root.leaves().forEach(d => {
//         d3.select("#" + d.data.id)
//             .datum(d)
//             .transition()
//             .duration(750)
//             .attr("transform", e => `
//                         rotate(${d.x * 180 / Math.PI - 90})
//                         translate(${e.y},0)
//                         ${e.x >= Math.PI ? `
//                         rotate(180)` : ""}
//                         `)
//             .attr("dy", "0.31em")
//             .attr("x", e => e.x < Math.PI ? 3 : -3)
//             .attr("text-anchor", e => e.x < Math.PI ? "start" : "end");
//     })

//     //update links
//     d3.select("#linkContainer").selectAll(".link").data(dataTable)
//         .transition()
//         .duration(750)
//         //.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
//         .each(function (d) {
//             d.source = d[0], d.target = d[d.length - 1];
//         })
//         .attr("d", line);

//     //update the arcs with the new data
//     var newPath = d3.select("#arcContainer").selectAll(".arcs").data(arcData)

//     //remove old arcs
//     newPath.exit().remove()

//     //add new arcs
//     newPath
//         .enter().append("path")
//         .attr("id", function (d, i) {
//             return "arc_" + i;
//         })
//         .attr("class", "arcs")
//         .attr("d", arcs)
//         .style("fill", (d, i) => colourSchemeRing(i));

//     newPath
//         .transition()
//         .duration(750)
//         .attrTween("d", arcTweenData)
//         .on('start', (d, i) => {
//             d3.select("#text" + i)
//                 .transition()
//                 .style("opacity", 0);
//         })
//         .on('end', (d, i) => {

//             //A regular expression that captures all in between the start of a string
//             //(denoted by ^) and the first capital letter L
//             var firstArcSection = /(^.+?)L/;
//             //The [1] gives back the expression between the () (thus not the L as well)
//             //which is exactly the arc statement
//             var newArc = firstArcSection.exec(d3.select("#arc_" + i).attr("d"));

//             //if newArc is not null
//             if (newArc) {

//                 var donutArc = getArcPath(newArc, d, i);

//                 //Create a new invisible arc that the text can flow along
//                 d3.select("#donutArc" + i)
//                     .attr("d", donutArc)
//                     .style("fill", "none");

//                 d3.select("#text" + i)
//                     .datum(d)
//                     .attr("dy", e => {
//                         offset = ((d.value.y1 - d.value.y0) / 1000)
//                         textHeight = d3.select("text").node().getBBox().height * 0.5

//                         if (arcs.centroid(d)[1] > 0) {
//                             return -(offset + textHeight)
//                         } else return offset + (textHeight * 2)

//                     }) //Move the text down
//                     .transition()
//                     .style("opacity", 1)
//                     .select("textPath")
//                     .text(e => e.key)
//                     .attr('display', e => (textFits(e) ? null : 'none'))
//             }
//         })

// }

// When switching data: interpolate the arcs in data space.
function arcTweenData(a, i) {
    // (a.x0s ? a.x0s : 0) -- grab the prev saved x0 or set to 0 (for 1st time through)
    // avoids the stash() and allows the sunburst to grow into being

    var oi = d3.interpolate({
        x0: (a.x0s ? a.x0s : 0),
        x1: (a.x1s ? a.x1s : 0)
    }, a);
    a.x0s = a.value.x0;
    a.x1s = a.value.x1;

    function tween(t) {
        var b = oi(t);
        return arcs(b);
    }

    return tween
}

function adjustDarkMode() {

    //adjust links
    if (dataTable) {
        //get the zoom values for svg
        svgZoomValue = d3.zoomTransform(d3.select("#parentSVG").node())

        context.save();
        context.translate(-width / 2, -height / 2);
        context.clearRect(0, 0, width, height);
        context.translate(svgZoomValue.x, svgZoomValue.y);
        context.scale(svgZoomValue.k, svgZoomValue.k);
        context.translate(width / 2, height / 2);
        dataTable.forEach(d => {
            d.source = d[0];
            d.target = d[d.length - 1];
            context.globalAlpha = 0.2;
            context.beginPath();
            canvasLine(d);
            context.lineWidth = 1;
            if ($("#checkDarkmode").is(':checked')) {
                //context.globalCompositeOperation = "screen"
                context.strokeStyle = "#FFFFFF";
            } else {
                //context.globalCompositeOperation = "darken"
                context.strokeStyle = "#2E2E2E";
            }

            context.stroke();
        })
        context.restore();
    }

    if ($("#checkDarkmode").is(':checked')) {
        //dark mode

        //body
        d3.select("body")
            .style("background-color", "#2E2E2E")
            .style("color", "#FFFFFF")

        d3.selectAll(".set>a")
            .style("border-bottom", "2px solid #424242CC")

        d3.selectAll(".sectionDepTypesHeading")
            .style("background-color", "#5E5E5E")

        d3.selectAll(".tags")
            .style("background-color", "#5E5E5E")

        d3.selectAll(".optionsGroup")
            .style("background-color", "#5E5E5E")

        d3.selectAll(".tab")
            .style("background-color", "#5E5E5E")

        d3.selectAll(".tabLinks")
            .style("background-color", "#424242CC")

        $(".tab").children()
            .css('background-color', '#3D3D3D')
            .css('color', '#FFFFFF')
            .hover(function () {
                $(this).css('background-color', '#444444')
            }, function () {
                // change to any color that was previously used.
                if ($(this).hasClass('active')) {
                    $(this).css('background-color', '#5E5E5E')
                } else $(this).css('background-color', '#3D3D3D')

            })

        $(".tab").children('.active')
            .css('background-color', '#5E5E5E')
            .css('color', '#FFFFFF')


        //header
        $("#heading").removeClass()
        $("#checkColourblind").is(':checked') ? $("#heading").addClass("darkHeadingColourBlind") : $("#heading").addClass("darkHeading")

        d3.select("#subHeading")
            .selectAll("a")
            .style("color", "#FFFFFF")

        d3.selectAll(".axis").selectAll("line")
            .style("stroke", "#FFFFFF")

        d3.selectAll(".node")
            .style("fill", "#FFFFFF")

        d3.selectAll(".uppercaseHeading")
            .style("fill", "#FFFFFF")

        d3.selectAll(".loading-text")
            .style("color", "#DFEC51")

        d3.selectAll(".cancel")
            .style("background-color", "#5E5E5E")
            .style("color", "#DFEC51")
            .style("border", "2px solid #DFEC51")

        d3.selectAll(".continue")
            .style("background-color", "#DFEC51")
            .style("color", "#2E2E2E")

        d3.selectAll('.object-one')
            .transition()
            .style("background-color", "#56A32A")

        d3.selectAll('.object-two')
            .transition()
            .style("background-color", "#DFEC51")

        d3.selectAll(".node")
            .style("fill", "#FFFFFF")
            .on("mouseover", d => {

                //get the zoom values for svg
                svgZoomValue = d3.zoomTransform(d3.select("#parentSVG").node())

                d3.selectAll(".node")
                    .each(function (n) {
                        n.target = n.source = false;
                    });

                context.save();
                context.translate(-width / 2, -height / 2);
                context.clearRect(0, 0, width, height);
                context.translate(svgZoomValue.x, svgZoomValue.y);
                context.scale(svgZoomValue.k, svgZoomValue.k);
                context.translate(width / 2, height / 2);

                dataTable.forEach(e => {
                    e.source = e[0];
                    e.target = e[e.length - 1];
                    context.beginPath();
                    canvasLine(e);
                    context.lineWidth = 1;
                    if (e.target === d) {
                        e.source.source = true
                        context.globalAlpha = 1;
                        context.strokeStyle = "#4CD964"
                    } else if (e.source === d) {
                        e.target.target = true
                        context.globalAlpha = 1;
                        context.strokeStyle = "#FF2D55"
                    } else {
                        context.globalAlpha = 0.05;
                        context.strokeStyle = "#FFFFFF"
                    }
                    context.stroke();
                })
                context.restore();

                d3.selectAll(".node")
                    .style("font-weight", e => e.target || e.source ? 700 : 400)
                    .style("fill", e => {
                        if (e.target) return "#FF2D55"
                        else if (e.source) return "#4CD964"
                        else return "#FFFFFF"
                    })
            })
            .on("mouseout", d => {
                //get the zoom values for svg
                svgZoomValue = d3.zoomTransform(d3.select("#parentSVG").node())

                context.save();
                context.translate(-width / 2, -height / 2);
                context.clearRect(0, 0, width, height);
                context.translate(svgZoomValue.x, svgZoomValue.y);
                context.scale(svgZoomValue.k, svgZoomValue.k);
                context.translate(width / 2, height / 2);

                dataTable.forEach(e => {
                    e.source = e[0];
                    e.target = e[e.length - 1];
                    context.globalAlpha = 0.2;
                    context.beginPath();
                    canvasLine(e);
                    context.lineWidth = 1;
                    //context.globalCompositeOperation = "screen"
                    context.strokeStyle = "#FFFFFF";
                    context.stroke();
                })
                context.restore();

                d3.selectAll(".node")
                    .style("fill", "#FFFFFF")
                    .style("font-weight", 400)
            })

        d3.selectAll(".arcs")
            .on("mouseover", d => {
                //get the zoom values for svg
                svgZoomValue = d3.zoomTransform(d3.select("#parentSVG").node())

                d3.selectAll(".node")
                    .each(function (n) {
                        n.target = n.source = n.internal = false;
                    });

                context.save();
                context.translate(-width / 2, -height / 2);
                context.clearRect(0, 0, width, height);
                context.translate(svgZoomValue.x, svgZoomValue.y);
                context.scale(svgZoomValue.k, svgZoomValue.k);
                context.translate(width / 2, height / 2);

                dataTable.forEach(e => {
                    e.source = e[0];
                    e.target = e[e.length - 1];
                    context.beginPath();
                    canvasLine(e);
                    context.lineWidth = 1;
                    if (e.target.data.group === d.key && e.source.data.group === d.key) {
                        e.source.internal = true
                        e.target.internal = true
                        context.globalAlpha = 0.5;
                        context.strokeStyle = "#34AADC"
                    } else if (e.target.data.group === d.key) {
                        e.source.source = true
                        context.globalAlpha = 0.5;
                        context.strokeStyle = "#4CD964"
                    } else if (e.source.data.group === d.key) {
                        e.target.target = true
                        context.globalAlpha = 0.5;
                        context.strokeStyle = "#FF2D55"
                    } else {
                        context.globalAlpha = 0.05;
                        context.strokeStyle = "#FFFFFF"
                    }
                    context.stroke();
                })
                context.restore();

                d3.selectAll(".node")
                    .style("font-weight", e => e.target || e.source ? 700 : 400)
                    .style("fill", e => {
                        if (e.internal) return "#34AADC"
                        else if (e.source) return "#4CD964"
                        else if (e.target) return "#FF2D55"
                        else return "#FFFFFF"
                    })
            })
            .on("mouseout", d => {
                //get the zoom values for svg
                svgZoomValue = d3.zoomTransform(d3.select("#parentSVG").node())

                context.save();
                context.translate(-width / 2, -height / 2);
                context.clearRect(0, 0, width, height);
                context.translate(svgZoomValue.x, svgZoomValue.y);
                context.scale(svgZoomValue.k, svgZoomValue.k);
                context.translate(width / 2, height / 2);

                dataTable.forEach(e => {
                    e.source = e[0];
                    e.target = e[e.length - 1];
                    context.globalAlpha = 0.2;
                    context.beginPath();
                    canvasLine(e);
                    context.lineWidth = 1;
                    //context.globalCompositeOperation = "screen"
                    context.strokeStyle = "#FFFFFF";
                    context.stroke();
                })
                context.restore();

                d3.selectAll(".node")
                    .style("fill", "#FFFFFF")
                    .style("font-weight", 400)
            })

        //sankey
        d3.selectAll(".sankeyLink")
            .style("stroke", "#FFFFFF")


    } else {
        //light mode

        //body
        d3.select("body")
            .style("background-color", "#FFFFFF")
            .style("color", "#2E2E2E")

        d3.selectAll(".set>a")
            .style("border-bottom", "2px solid #DDDDDD")

        d3.selectAll(".sectionDepTypesHeading")
            .style("background-color", "#CCCCCC")

        d3.selectAll(".tags")
            .style("background-color", "#CCCCCC")

        d3.selectAll(".optionsGroup")
            .style("background-color", "#CCCCCC")

        d3.selectAll(".tab")
            .style("background-color", "#CCCCCC")

        d3.selectAll(".tabLinks")
            .style("background-color", "#CCCCCC")

        $(".tab").children()
            .css('background-color', '#DDDDDD')
            .css('color', '#2E2E2E')
            .hover(function () {
                $(this).css('background-color', '#EEEEEE')
            }, function () {
                // change to any color that was previously used.
                if ($(this).hasClass('active')) {
                    $(this).css('background-color', '#CCCCCC')
                } else $(this).css('background-color', '#DDDDDD')

            })

        $(".tab").children('.active')
            .css('background-color', '#CCCCCC')
            .css('color', '#2E2E2E')

        d3.selectAll(".loading-text")
            .style("color", "#56A32A")

        d3.selectAll(".cancel")
            .style("background-color", "#FFFFFF")
            .style("color", "#56A32A")
            .style("border", "2px solid #56A32A")

        d3.selectAll(".continue")
            .style("background-color", "#56A32A")
            .style("fill", "#FFFFFF")

        d3.selectAll('.object-one')
            .transition()
            .style("background-color", "#56A32A")

        d3.selectAll('.object-two')
            .transition()
            .style("background-color", "#9AC73D")

        //header
        $("#heading").removeClass()
        $("#checkColourblind").is(':checked') ? $("#heading").addClass("lightHeadingColourBlind") : $("#heading").addClass("lightHeading")

        d3.select("#subHeading")
            .selectAll("a")
            .style("color", "#2E2E2E")

        d3.selectAll(".axis").selectAll("line")
            .style("stroke", "#2E2E2E")

        d3.selectAll(".node")
            .style("fill", "#2E2E2E")

        d3.selectAll(".uppercaseHeading")
            .style("fill", "#2E2E2E")

        d3.selectAll(".node")
            .style("fill", "#2E2E2E")
            .on("mouseover", d => {
                //get the zoom values for svg
                svgZoomValue = d3.zoomTransform(d3.select("#parentSVG").node())

                d3.selectAll(".node")
                    .each(function (n) {
                        n.target = n.source = false;
                    });

                context.save();
                context.translate(-width / 2, -height / 2);
                context.clearRect(0, 0, width, height);
                context.translate(svgZoomValue.x, svgZoomValue.y);
                context.scale(svgZoomValue.k, svgZoomValue.k);
                context.translate(width / 2, height / 2);

                dataTable.forEach(e => {
                    e.source = e[0];
                    e.target = e[e.length - 1];
                    context.beginPath();
                    canvasLine(e);
                    context.lineWidth = 1;
                    if (e.target === d) {
                        e.source.source = true
                        context.globalAlpha = 1;
                        context.strokeStyle = "#4CD964"
                    } else if (e.source === d) {
                        e.target.target = true
                        context.globalAlpha = 1;
                        context.strokeStyle = "#FF2D55"
                    } else {
                        context.globalAlpha = 0.05;
                        context.strokeStyle = "#2E2E2E"
                    }
                    context.stroke();
                })
                context.restore();

                d3.selectAll(".node")
                    .style("font-weight", e => e.target || e.source ? 700 : 400)
                    .style("fill", e => {
                        if (e.target) return "#FF2D55"
                        else if (e.source) return "#4CD964"
                        else return "#2E2E2E"
                    })
            })
            .on("mouseout", d => {
                //get the zoom values for svg
                svgZoomValue = d3.zoomTransform(d3.select("#parentSVG").node())

                context.save();
                context.translate(-width / 2, -height / 2);
                context.clearRect(0, 0, width, height);
                context.translate(svgZoomValue.x, svgZoomValue.y);
                context.scale(svgZoomValue.k, svgZoomValue.k);
                context.translate(width / 2, height / 2);

                dataTable.forEach(e => {
                    e.source = e[0];
                    e.target = e[e.length - 1];
                    context.globalAlpha = 0.2;
                    context.beginPath();
                    canvasLine(e);
                    context.lineWidth = 1;
                    //context.globalCompositeOperation = "darken"
                    context.strokeStyle = "#2E2E2E";
                    context.stroke();
                })

                context.restore();

                d3.selectAll(".node")
                    .style("fill", "#2E2E2E")
                    .style("font-weight", 400)
            })

        d3.selectAll(".arcs")
            .on("mouseover", d => {
                //get the zoom values for svg
                svgZoomValue = d3.zoomTransform(d3.select("#parentSVG").node())

                d3.selectAll(".node")
                    .each(function (n) {
                        n.target = n.source = n.internal = false;
                    });

                context.save();
                context.translate(-width / 2, -height / 2);
                context.clearRect(0, 0, width, height);
                context.translate(svgZoomValue.x, svgZoomValue.y);
                context.scale(svgZoomValue.k, svgZoomValue.k);
                context.translate(width / 2, height / 2);

                dataTable.forEach(e => {
                    e.source = e[0];
                    e.target = e[e.length - 1];
                    context.beginPath();
                    canvasLine(e);
                    context.lineWidth = 1;
                    if (e.target.data.group === d.key && e.source.data.group === d.key) {
                        e.source.internal = true
                        e.target.internal = true
                        context.globalAlpha = 0.5;
                        context.strokeStyle = "#007AAF"
                    } else if (e.target.data.group === d.key) {
                        e.source.source = true
                        context.globalAlpha = 0.5;
                        context.strokeStyle = "#4CD964"
                    } else if (e.source.data.group === d.key) {
                        e.target.target = true
                        context.globalAlpha = 0.5;
                        context.strokeStyle = "#FF2D55"
                    } else {
                        context.globalAlpha = 0.05;
                        context.strokeStyle = "#2E2E2E"
                    }
                    context.stroke();
                })
                context.restore();

                d3.selectAll(".node")
                    .style("font-weight", e => e.target || e.source ? 700 : 400)
                    .style("fill", e => {
                        if (e.internal) return "#007AAF"
                        else if (e.source) return "#4CD964"
                        else if (e.target) return "#FF2D55"
                        else return "#2E2E2E"
                    })
            })
            .on("mouseout", d => {
                //get the zoom values for svg
                svgZoomValue = d3.zoomTransform(d3.select("#parentSVG").node())

                context.save();
                context.translate(-width / 2, -height / 2);
                context.clearRect(0, 0, width, height);
                context.translate(svgZoomValue.x, svgZoomValue.y);
                context.scale(svgZoomValue.k, svgZoomValue.k);
                context.translate(width / 2, height / 2);

                dataTable.forEach(e => {
                    e.source = e[0];
                    e.target = e[e.length - 1];
                    context.globalAlpha = 0.2;
                    context.beginPath();
                    canvasLine(e);
                    context.lineWidth = 1;
                    //context.globalCompositeOperation = "screen"
                    context.strokeStyle = "#2E2E2E";
                    context.stroke();
                })
                context.restore();

                d3.selectAll(".node")
                    .style("fill", "#2E2E2E")
                    .style("font-weight", 400)
            })

        //sankey
        d3.selectAll(".sankeyLink")
            .style("stroke", "#2E2E2E")
    }
}

function adjustHeatmapColour() {
    colourSchemeHeatmap.range(["#FFFFFF", $("#selectHeatmapColour").children("option:selected").val()])

    d3.selectAll("#heatmapRect")
        .transition()
        .style("fill", d => d.source == d.target && !$("#checkInternal").is(':checked') ? "#CCCCCC" : colourSchemeHeatmap(d.value))
}

function adjustRingColour() {
    colourSchemeRing.interpolator(d3[$("#selectRingColour").children("option:selected").val()])
    colourSchemeSankey.interpolator(d3[$("#selectRingColour").children("option:selected").val()])

    d3.selectAll(".arcs").each(function (d, i) {
        d3.select(this)
            .transition()
            .style("fill", colourSchemeRing(i))

        d3.select("#text" + i)
            .select("textPath")
            .transition()
            .style("fill", d3.hsl(colourSchemeRing(i)).l < 0.64 ? "#FFFFFF" : "#333333")
    })

    d3.selectAll(".sankeyNodeRect")
        .transition()
        .style('fill', d => colourSchemeSankey(sankeyProjects.indexOf(d.project)))

    d3.selectAll(".sankeyNodeText")
        .transition()
        .style("fill", (d, i) => {
            return d3.hsl(colourSchemeSankey(sankeyProjects.indexOf(d.project))).l < 0.64 ? "#FFFFFF" : "#2E2E2E"
        })
}

function selectAllDependencies() {
    $("#depList a")
        .removeClass('unselectedDependency')
        .addClass('selectedDependency')

    updateDependencyText()
}

function clearAllDependencies() {
    $("#depList a")
        .removeClass('selectedDependency')
        .addClass('unselectedDependency')

    updateDependencyText()
}

function addSubquery() {

    //add div container 
    d3.select("#subqueryContainer").append("div").attr("id", "tempSubqueryContainer")

    if (document.getElementById("subqueryContainer").childElementCount > 1) {
        //add AND text
        d3.select("#tempSubqueryContainer").append("div").attr("class", "subquery uppercaseHeading operator").append("p").text("AND")
    }

    //add tempNodeId
    d3.select("#tempSubqueryContainer").append("div").attr("class", "subqueryGrid subqueryDiv uppercaseHeading optionsGroup").attr("id", "tempsubqueryId").attr("width", "100%")

    //add Jira Field header
    d3.select("#tempsubqueryId").append("text").attr("class", "subqueryOne").text("Jira Field")

    //add Raised / Received header
    d3.select("#tempsubqueryId").append("text").attr("class", "subqueryTwo").text("Dependency Type")

    //add Is / Is Not header
    d3.select("#tempsubqueryId").append("text").attr("class", "subqueryThree").text("Is / Is Not")

    //add Operator header
    d3.select("#tempsubqueryId").append("text").attr("class", "subqueryFour").text("Operator")

    //add Value header
    d3.select("#tempsubqueryId").append("text").attr("class", "subqueryFive").text("Value")

    //add delete button
    d3.select("#tempsubqueryId").append("i").attr("class", "fa fa-times deleteDiv subquerySix").attr("onclick", "deleteDiv(this)");

    //add Jira Field Select
    d3.select("#tempsubqueryId").append("select").attr("class", "subqueryOne jiraField").attr("id", "subqueryJiraField")

    //add Raised / Received 
    d3.select("#tempsubqueryId").append("select").attr("class", "subqueryTwo").attr("id", "subqueryType")
        .selectAll("option")
        .data(['Received', 'Raised', 'Both'])
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d)

    //add Is / Is Not
    d3.select("#tempsubqueryId").append("select").attr("class", "subqueryThree").attr("id", "subqueryIsIsNot")
        .selectAll("option")
        .data(['Is', 'Is Not'])
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d)

    //add Is / Is Not
    d3.select("#tempsubqueryId").append("select").attr("class", "subqueryFour").attr("id", "subqueryOperator")
        .selectAll("option")
        .data(['Like', 'Exactly'])
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d)

    //add subqueryValue
    d3.select("#tempsubqueryId").append("input").attr("class", "subqueryFive").attr("id", "subqueryValue")

    // get the custom field ids for each join field
    searchFields = customFields.filter(field => field.searchable && field.name == "Project")
        .sort((a, b) => {
            let comparison = 0;
            if (a.name > b.name) {
                comparison = 1;
            } else if (a.name < b.name) {
                comparison = -1;
            }
            return comparison;
        })

    d3.select("#tempsubqueryId").select("#subqueryJiraField")
        .selectAll("option")
        .data(searchFields)
        .enter()
        .append("option")
        .text(d => d.name)
        .attr("value", d => d.id)


    //reset ids to allow delete function to work
    d3.select("#tempSubqueryContainer").attr("id", null)
    d3.select("#tempsubqueryId").attr("id", null)

    adjustDarkMode()

}

function deleteDiv(button) {

    var parent = button.parentNode;
    var grand_father = parent.parentNode;
    // $(this).parent().slideUp(200);
    //grand_father.removeChild(parent);
    grand_father.remove()

    if (document.getElementById("subqueryContainer").childElementCount == 1 || document.getElementById("subqueryContainer").firstChild.firstChild.classList.contains("operator")) {
        //remove AND text
        d3.select(".operator").remove()
    }


}

function cleanArray(data) {
    data.forEach(d => {
        if (d['project']) {
            d['project'] = d['project']['name']
        }
    })
    return data
}

function openTab(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";

    if ($("#parentCanvas").position()) {
        //RING ONLY
        //fix chart svg position
        d3.select("#chart").select("#parentSVG")
            .style("top", $("#parentCanvas").position().top)
            .style("left", $("#parentCanvas").position().left);
    }


    //SANKEY ONLY
    //show the text if it fits
    d3.selectAll('.sankeyNodeText')
        .attr('display', function (d) {
            if (d3.select(this).node().getBBox().height > (d.y1 - d.y0)) return "none"
            else return null
        })

    adjustDarkMode()
}

//onload
//$(function() { ... }); == $(document).ready(function() { ... });
$(function () {
    //initialise chart space
    d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("id", "container")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    //initialise table space
    d3.select("#tableChart").append("svg")
        .attr("width", Math.min(width, height))
        .attr("height", Math.min(width, height))
        .append("g")
        .attr("id", "tableContainer");

    //initialise sankey space
    d3.select("#sankeyChart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("id", "sankeyContainer");

    // Get the chart element with id="defaultOpen" and click on it
    document.getElementsByClassName("defaultOpen")[0].click();

    //hide tab buttons until finished
    d3.selectAll(".tablinks").style("opacity", 0).style("pointer-events", "none")

    // calculate most of the coordinates for tooltipDemoping just once:
    rootSVG = d3.select("#tableChart").select("svg");
    rootRingSVG = d3.select("#chart").select("svg");
    rootSankeySVG = d3.select("#sankeyChart").select("svg");
    rootForceSVG = d3.select("#forceContainer");
    scr = {
        x: window.scrollX,
        y: window.scrollY,
        w: window.innerWidth,
        h: window.innerHeight
    };
    // it's jolly rotten but <body> width/height can be smaller than the SVG it's carrying inside! :-((
    body_sel = d3.select('body');
    // this is browser-dependent, but screw that for now!
    body = {
        w: body_sel.node().offsetWidth,
        h: body_sel.node().offsetHeight
    };
    svgpos = getNodePos(rootSVG.node());
    svgRingpos = getNodePos(rootRingSVG.node());
    svgSankeypos = getNodePos(rootSankeySVG.node());
    dist = {
        x: 20,
        y: -10
    };
    chart = $("#tableChart").position();
    header = d3.select(".banner").node().getBoundingClientRect();
    width = d3.select('#chart').node().getBoundingClientRect().width;
    startLoading()
});