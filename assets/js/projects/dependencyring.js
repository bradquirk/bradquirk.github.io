// Get the data
d3.csv("/assets/csv/projects/dependencyring.csv")
    .then(function(data) {

            var formatTime = d3.timeFormat("%B %d, %Y %I:%M %p"),
                width = $("#chart").width(),
                height = $(window).innerHeight() * 0.6;

            var arcs = d3.arc()
                .innerRadius(90)
                .outerRadius(100)
                .startAngle(function(d) {
                    return findStartAngle(d.children);
                })
                .endAngle(function(d) {
                    return findEndAngle(d.children);
                });

            //****** END SETUP DIVS ******//

            // //****** PREPARE DATA ******//

            //format knimeDataTable data
            var links = [];

            data.forEach(d => {
                links.push({
                    source: d['Key'],
                    sourceProj: d['Project Key'],
                    target: d['Link To'],
                    targetProj: d['Link Project Key'],
                    count: 1
                });
            });


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
                    'group': d.values[0]['key'],
                    'total': d.values[0]['value']['total']
                });

            });

            var sizeScale = d3.scaleLinear()
                .domain([0, 500])
                .range([500, 4000]);

            var size = sizeScale(nodes.length);
            var radius = size / 2;
            var line = d3.radialLine()
                .curve(d3.curveBundle.beta(0.85))
                .radius(d => d.y)
                .angle(d => d.x);
            var tree = d3.cluster().size([2 * Math.PI, radius - 100])

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
                        'group': d.values[0]['key'],
                        'total': d.values[0]['value']['total']
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

            const jsontable = {
                "nodes": nodes,
                "links": links
            };
            console.log(jsontable)
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
            }

            for (const {
                    source: sourceId,
                    target: targetId
                }
                of links) {
                const source = nodeById.get(sourceId);
                source.targetIds.push(targetId);
            }

            var data = {
                name: "miserables",
                children: [...groupById.values()]
            };

            const root = tree(d3.hierarchy(data));

            const map = new Map(root.leaves().map(d => [d.data.id, d]));

            const dataTable = d3.merge(root.leaves().map(d => d.data.targetIds.map(i => d.path(map.get(i)))));

            var arcData = d3.nest()
                .key(d => d.data.group)
                .rollup(d => {

                    return {
                        'x0': d[0]['x'],
                        'x1': d[d.length - 1]['x']
                    }
                })
                .entries(root.leaves());

            const colour = d3.scaleSequential()
                .interpolator(d3.interpolateRainbow)
                .domain([0, arcData.length]);

            var arcs = d3.arc()
                .startAngle(function(d) {
                    return d.value.x0;
                })
                .endAngle(function(d) {
                    return d.value.x1;
                })
                .innerRadius(radius - 150)
                .outerRadius(radius - 100);

            const svg = d3.select("#chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .style("font", "10px sans-serif");

            //add zoom capabilities 
            var zoom_handler = d3.zoom()
                .on("zoom", zoomed);

            zoom_handler(svg);

            var container = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ") scale(0.2)");

            var link = container.append("g").selectAll(".link"),
                node = container.append("g").selectAll(".node"),
                arc = container.append("g").selectAll(".arc");

            var link = link
                .attr("fill", "none")
                .attr("stroke-opacity", 0.5)
                .attr("stroke-width", "3px")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
                .data(dataTable)
                .enter().append("path")
                .each(function(d) {
                    d.source = d[0], d.target = d[d.length - 1];
                })
                .attr("class", "link")
                .style("mix-blend-mode", "screen")
                .attr("stroke", d => {
                    //return color(d[0]['data']['total']);
                    return 'white'
                })
                .attr("class", "link")
                .attr("d", line);

            var node = node
                .data(root.leaves())
                .enter().append("text")
                .attr("class", "node")
                .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)${d.x >= Math.PI ? `
        rotate(180)` : ""}
      `)
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI ? 3 : -3)
        .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
        .text(d => d.data.id)
        .on("mouseover", mouse_over)
        .on("mouseout", mouse_out);

    var arc = arc
        .data(arcData)
        .enter().append("path")
        .attr("class", "arc")
        .attr("d", arcs)
        .style("fill", (d, i) => colour(i));

    //****** END PREPARE DATA ******//

    //****** CREATE CHART ******//

    //Zoom functions 
    function zoomed() {
        container.attr("transform", d3.event.transform + " translate(" + width / 2 + "," + height / 2 + ") scale(0.2)")
    }

    function mouse_over(d) {
        node
            .each(function (n) {
                n.target = n.source = false;
            });

        link
            .classed("link--target", function (l) {

                if (l.target === d) return l.source.source = true;
            })
            .classed("link--source", function (l) {
                if (l.source === d) return l.target.target = true;
            })
            .filter(function (l) {
                return l.target === d || l.source === d;
            })
//            .each(function () {
//                this.parentNode.appendChild(this);
//            });

        node
            .classed("node--target", function (n) {
                return n.target;
            })
            .classed("node--source", function (n) {
                return n.source;
            });
    }

    function mouse_out(d) {
        link
            .classed("link--target", false)
            .classed("link--source", false);

        node
            .classed("node--target", false)
            .classed("node--source", false);
    }
})