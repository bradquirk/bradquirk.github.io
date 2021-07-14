        //****** PREP DATA ******//
        var dataset = {
            "nodes": [
                /*0*/
                {
                    "name": "Customer Requests",
                    "order": 0,
                    "colorOrder": 0,
                    "commentary": "We are inundated with customer requests, which is fantastic, but we never have the capacity to address them. Unfortunately the vast majority are thrown out before we have a chance to evaluate them."
                },
                /*1*/
                {
                    "name": "Executive Requests",
                    "order": 1,
                    "colorOrder": 1,
                    "commentary": "Our senior leadership team collectively have decades of industry experience and knowledge, as such their ideas usually take priority and are evaluated accordingly."
                },
                /*2*/
                {
                    "name": "Annual SteerCo Planning",
                    "order": 2,
                    "colorOrder": 2,
                    "commentary": "Our annual business strategy sessions are very labour-intensive, with months of preparation required from key stakeholders to ensure the agenda is followed. If we don't get this perfect every time this can have a major impact on everything downstream."
                },
                /*3*/
                {
                    "name": "Expedited Requests",
                    "order": 3,
                    "colorOrder": 3,
                    "commentary": "We have reserved capacity for high-priority requests from our senior leadership team when the time arises. This can be due to regulatory changes, significant market shifts or other 'pet projects'."
                },
                /*4*/
                {
                    "name": "BAU Helpdesk Requests",
                    "order": 5,
                    "colorOrder": 5,
                    "commentary": "We pride ourselves on our customer service, but the tools we have in place to triage issues are very primative. More often than not we have to request additional information from our customers which can lead to friction."
                },
                /*5*/
                {
                    "name": "Quarterly Product Increment (PI) Planning",
                    "order": 4,
                    "colorOrder": 4,
                    "commentary": "Similar to our SteerCo planning, our quarterly tribe PI planning has a lot of overhead attached to the event. We are still finding our feet with regards to getting good outcomes but ideally we want to shift to continuous planning."
                },
                /*6*/
                {
                    "name": "External Vendor Build",
                    "order": 6,
                    "colorOrder": 9,
                    "commentary": "One of our key features was hastily built using a whitelabel product from a third party vendor, and as such they are contracted to employ quality checks on any changes made to this space. We don't use the same tools so we have little insight as to their day-to-day progress."
                },
                /*7*/
                {
                    "name": "Component Squad #1 Build",
                    "order": 7,
                    "colorOrder": 6,
                    "commentary": "This squad is responsible for maintaining the CMS features on our platform, of which there are several. Our CMS was built using a whitelabel product from a third party vendor and as such this team is unable to prepare their releases without constant delays."
                },
                /*8*/
                {
                    "name": "Component Squad #2 Build",
                    "order": 8,
                    "colorOrder": 7,
                    "commentary": "This squad is arguably the most mature with their agile ways of working. They have a clear runway to deploy new features and are fantastic at breaking down their work. We wish to emulate their practices elsewhere."
                },
                /*9*/
                {
                    "name": "Component Squad #3 Build",
                    "order": 9,
                    "colorOrder": 8,
                    "commentary": "When this team first started they were the highest performing, so we gave them additional responsibilities. Since then the team has lost some original members and as such they have slipped to the back of the pack. They rarely deliver on time due to constant rework on their features."
                },
                /*10*/
                {
                    "name": "Integration & Staging",
                    "order": 10,
                    "colorOrder": 10,
                    "commentary": "Unfortunately our biggest bottleneck is our release process, which is on a monthly basis. Some of our teams would be capable of deploying new features faster if they had their own runway but we are held back by legacy architecture principles."
                },
                /*11*/
                {
                    "name": "Feature Release",
                    "order": 11,
                    "colorOrder": 11,
                    "commentary": "Once our features have been released we have no methods in place to measure their success outside of tracking monthly revenue. We feel like this is a huge missed opportunity to close the feedback loop and learn more about our customers."
                }
            ],

            //value == WIP
            "links": [
                //Customer Requests => Annual SteerCo Planning
                {
                    "source": 0,
                    "target": 2,
                    "value": 6,
                    "leadTime": 1000000,
                    "size": 13,
                    "throughput": 0.05,
                    "defectRate": 0.05,
                    "discardRate": 0.8,
                    "leadtimeText": "500 bus. days",
                    "wipText": "300 Requests",
                    "throughputText": "20 Initiatives / Year",
                    "workItemInput": "Requests",
                    "workItemOutput": "Initiatives"
                },

                //Executive Requests => Annual SteerCo Planning
                {
                    "source": 1,
                    "target": 2,
                    "value": 3,
                    "leadTime": 1000000,
                    "size": 13,
                    "throughput": 0.02,
                    "defectRate": 0.1,
                    "discardRate": 0.2,
                    "leadtimeText": "150 bus. days",
                    "wipText": "100 Requests",
                    "throughputText": "5 Initiatives / Quarter",
                    "workItemInput": "Requests",
                    "workItemOutput": "Initiatives"
                },
                //Executive Requests => Expedited Requests
                {
                    "source": 1,
                    "target": 3,
                    "value": 2,
                    "leadTime": 0.5,
                    "size": 13,
                    "throughput": 0.01,
                    "defectRate": 0.05,
                    "discardRate": 0.01,
                    "leadtimeText": "20 bus. days",
                    "wipText": "2 Requests",
                    "throughputText": "1 Initiative / Quarter",
                    "workItemInput": "Requests",
                    "workItemOutput": "Initiatives"
                },
                //Annual SteerCo Planning => Quarterly Product Increment (PI) Planning
                {
                    "source": 2,
                    "target": 5,
                    "value": 9,
                    "leadTime": 1000000,
                    "size": 8,
                    "throughput": 0.03,
                    "defectRate": 0.1,
                    "discardRate": 0.1,
                    "leadtimeText": "60 bus. days",
                    "wipText": "6 Initiatives",
                    "throughputText": "3 Features / Quarter",
                    "workItemInput": "Initiatives",
                    "workItemOutput": "Features"
                },
                //Quarterly Product Increment (PI) Planning => Component Squad #1 Build
                {
                    "source": 5,
                    "target": 7,
                    "value": 3,
                    "leadTime": 1000,
                    "size": 5,
                    "throughput": 0.01,
                    "defectRate": 0.1,
                    "discardRate": 0.1,
                    "leadtimeText": "5 bus. days",
                    "wipText": "5 Features",
                    "throughputText": "20 Epics / Quarter",
                    "workItemInput": "Features",
                    "workItemOutput": "Epics"
                },
                //Component Squad #1 Build => External Vendor Build
                {
                    "source": 7,
                    "target": 6,
                    "value": 3,
                    "leadTime": 1000,
                    "size": 3,
                    "throughput": 0.03,
                    "defectRate": 0.2,
                    "discardRate": 0.2,
                    "leadtimeText": "20 bus. days",
                    "wipText": "2 Epics",
                    "throughputText": "25 User Stories / Month",
                    "workItemInput": "Epics",
                    "workItemOutput": "User Stories"
                },
                //Quarterly Product Increment (PI) Planning => Component Squad #2 Build
                {
                    "source": 5,
                    "target": 8,
                    "value": 3,
                    "leadTime": 1000,
                    "size": 5,
                    "throughput": 0.01,
                    "defectRate": 0.2,
                    "discardRate": 0.2,
                    "leadtimeText": "7 bus. days",
                    "wipText": "3 Features",
                    "throughputText": "0.5 Epics / Day",
                    "workItemInput": "Features",
                    "workItemOutput": "Epics"
                },
                //Quarterly Product Increment (PI) Planning => Component Squad #3 Build
                {
                    "source": 5,
                    "target": 9,
                    "value": 3,
                    "leadTime": 1000,
                    "size": 5,
                    "throughput": 0.01,
                    "defectRate": 0.05,
                    "discardRate": 0.2,
                    "leadtimeText": "5 bus. days",
                    "wipText": "4 Features",
                    "throughputText": "4 Epics / Day",
                    "workItemInput": "Features",
                    "workItemOutput": "Epics"
                },
                //BAU Helpdesk Requests => Component Squad #3 Build
                {
                    "source": 4,
                    "target": 9,
                    "value": 2,
                    "leadTime": 1000,
                    "size": 3,
                    "throughput": 0.03,
                    "defectRate": 0.5,
                    "discardRate": 0.6,
                    "leadtimeText": "700 bus. days",
                    "wipText": "300 Requests",
                    "throughputText": "8 User Stories / Month",
                    "workItemInput": "Requests",
                    "workItemOutput": "User Stories"
                },
                //Expedited Requests => Component Squad #3 Build
                {
                    "source": 3,
                    "target": 9,
                    "value": 2,
                    "leadTime": 0.5,
                    "size": 8,
                    "throughput": 0.01,
                    "defectRate": 0.05,
                    "discardRate": 0.01,
                    "leadtimeText": "10 bus. days",
                    "wipText": "4 Initiatives",
                    "throughputText": "15 Epics / Month",
                    "workItemInput": "Initiatives",
                    "workItemOutput": "Epics"
                },
                //External Vendor Build => Integration / Staging
                {
                    "source": 6,
                    "target": 10,
                    "value": 3,
                    "leadTime": 10000,
                    "size": 3,
                    "throughput": 0.005,
                    "defectRate": 0.4,
                    "discardRate": 0.5,
                    "leadtimeText": "30 bus. days",
                    "wipText": "60 User Stories",
                    "throughputText": "15 User Stories / Month",
                    "workItemInput": "User Stories",
                    "workItemOutput": "Features"
                },
                //Component Squad #2 Build => Integration / Staging
                {
                    "source": 8,
                    "target": 10,
                    "value": 3,
                    "leadTime": 1000,
                    "size": 3,
                    "throughput": 0.03,
                    "defectRate": 0.05,
                    "discardRate": 0.2,
                    "leadtimeText": "5 bus. days",
                    "wipText": "2 Epics",
                    "throughputText": "40 User Stories / Month",
                    "workItemInput": "Epics",
                    "workItemOutput": "User Stories"
                },
                //Component Squad #3 Build => Integration / Staging
                {
                    "source": 9,
                    "target": 10,
                    "value": 7,
                    "leadTime": 1000000,
                    "size": 3,
                    "throughput": 0.1,
                    "defectRate": 0.7,
                    "discardRate": 0.2,
                    "leadtimeText": "30 bus. days",
                    "wipText": "20 Epics",
                    "throughputText": "15 User Stories / Month",
                    "workItemInput": "Epics",
                    "workItemOutput": "User Stories"
                },
                //Integration / Staging => Feature Release
                {
                    "source": 10,
                    "target": 11,
                    "value": 13,
                    "leadTime": 10000,
                    "size": 13,
                    "throughput": 0.003,
                    "defectRate": 0.3,
                    "discardRate": 0.1,
                    "leadtimeText": "20 bus. days",
                    "wipText": "80 User Stories",
                    "throughputText": "1 Releases / Month",
                    "workItemInput": "User Stories",
                    "workItemOutput": "Releases"
                }
            ]
        };

        //****** END PREP DATA ******//

        //****** CREATE DIVS ******//

        // set the dimensions and margins of the graph
        const formatNumber = d3.format(',.0f');
        const format = d => `${formatNumber(d)} Days`;
        const color = d3.scaleSequential().interpolator(d3.interpolateCool).domain([0, dataset.nodes.length - 1]);
        //const color = d3.scaleSequential().interpolator(piecewise(d3.interpolateHsl, ["#43B7B8", "#DE791E", "#63FD88"])).domain([0, dataset.nodes.length - 1]);
        var widthFactor, heightFactor;

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ||
            (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform))) {
            widthFactor = 5,
                heightFactor = 1.2;
        } else {
            widthFactor = 2,
                heightFactor = 0.8;
        }
        const margin = {
                top: 100,
                right: 30,
                bottom: 20,
                left: 30
            },
            width = ($('#chart').innerWidth() * widthFactor) - margin.left - margin.right - parseFloat($('.container').css('padding-left')) - parseFloat($('.container').css('padding-right')),
            height = ($(window).innerHeight() * heightFactor) - margin.top - margin.bottom;

        const canvas = d3.select('#chart')
            .append('canvas')
            .style("position", "relative")
            .style("top", margin.top + 'px')
            .style("left", margin.left + 'px')
            .attr('width', width)
            .attr('height', height)
            .style("pointer-events", "none")

        const svg = d3.select("#chart")
            .append("svg")
            .style("position", "absolute")
            .attr("width", width)
            .attr("height", height)
            .style('left', 0)
            .style('top', 0);

        const sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(80)
            .nodeAlign(d3.sankeyCenter)
            .nodeSort((a, b) => {
                return a.order - b.order;
            })
            .iterations(1000)
            .size([width - margin.left - margin.right, height - margin.top - margin.bottom]);

        var graph = sankey(dataset);

        const link = svg.append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .selectAll('path')
            .data(dataset.links)
            .enter().append('path')
            .attr('class', 'link')
            .attr('d', d3.sankeyLinkHorizontal())
            .style('stroke-width', d => Math.max(1, d.width))
            .on("mouseover", function() {
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function(d, i) {
                //determine defect/discard text colours
                var defectColour, discardColour;

                defectColour = d.defectRate > 0.4 ? "red" : "white";
                discardColour = d.discardRate > 0.2 ? "red" : "white";

                var m = d3.mouse(root.node());
                scr.x = window.scrollX;
                scr.y = window.scrollY;
                m[0] += svgpos.x;
                m[1] += svgpos.y;
                tooltip.style("right", "");
                tooltip.style("left", "");
                tooltip.style("bottom", "");
                tooltip.style("top", "");
                tooltip.html("<h5>From <span style='color:" + d.source.color + ";'>" + d.source.name + "</span> to <br><span style='color:" + d.target.color + ";'>" + d.target.name + "</h5><hr>" +
                    "From <span style='color:" + d.source.color + ";'>" + d.workItemInput + "</span> to <span style='color:" + d.target.color + ";'>" + d.workItemOutput + "</span><hr>" +
                    "WIP: " + d.wipText + "<br>" +
                    "Lead Time: " + d.leadtimeText + "<br>" +
                    "Throughput: " + d.throughputText + "<br>" +
                    "Defect Rate: " + "<span style='color:" + defectColour + ";'>" + d3.format(".0%")(d.defectRate) + "</span><br>" +
                    "Discard Rate: " + "<span style='color:" + discardColour + ";'>" + d3.format(".0%")(d.discardRate) + "</span><br>");
                if (m[0] > scr.x + scr.w / 2) {
                    tooltip.style("right", (body.w - m[0] + dist.x + $("#tooltip").width()) + margin.right + "px");
                } else {
                    tooltip.style("left", (m[0] + dist.x - $("#tooltip").width() + 100) + margin.left - chart.left + "px");
                }

                if (m[1] > scr.y + scr.h / 2) {
                    tooltip.style("bottom", (body.h - m[1] + dist.y) + "px");
                } else {
                    tooltip.style("top", (m[1] + dist.y  - $("#tooltip").height()) + "px");
                }
                tooltip.style("visibility", "visible");
            })
            .on("mouseout", function() {
                return tooltip.style("visibility", "hidden");
            });

        const node = svg.append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .selectAll('.node')
            .data(dataset.nodes)
            .enter().append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x0},${d.y0})`)
            .call(d3.drag()
                .subject(d => d)
                .on('start', function() {
                    this.parentNode.appendChild(this);
                })
                .on('drag', dragmove))
            .on("mouseover", function() {
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function(d, i) {
                //determine defect/discard text colours
                var inputColour, outputColour;

                inputColour = d.targetLinks.length > 2 ? "red" : "white";
                outputColour = d.sourceLinks.length > 2 ? "red" : "white";

                var m = d3.mouse(root.node());
                scr.x = window.scrollX;
                scr.y = window.scrollY;
                m[0] += svgpos.x;
                m[1] += svgpos.y;
                tooltip.style("right", "");
                tooltip.style("left", "");
                tooltip.style("bottom", "");
                tooltip.style("top", "");
                tooltip.html("<h5><span style='color:" + d.color + ";'>" + d.name + "</span></h5><hr>" +
                    "Stream Inputs: <span style='color:" + inputColour + ";'>" + d.targetLinks.length + "</span><br>" +
                    "Stream Outputs: <span style='color:" + outputColour + ";'>" + d.sourceLinks.length + "</span><hr>" +
                    "<i>" + d.commentary + "</i>");
                    if (m[0] > scr.x + scr.w / 2) {
                        tooltip.style("right", (body.w - m[0] + dist.x + $("#tooltip").width()) + margin.right + "px");
                    } else {
                        tooltip.style("left", (m[0] + dist.x - $("#tooltip").width() + 100) + margin.left - chart.left + "px");
                    }
    
                    if (m[1] > scr.y + scr.h / 2) {
                        tooltip.style("bottom", (body.h - m[1] + dist.y) + "px");
                    } else {
                        tooltip.style("top", (m[1] + dist.y  - $("#tooltip").height()) + "px");
                    }
                tooltip.style("visibility", "visible");
            })
            .on("mouseout", function() {
                return tooltip.style("visibility", "hidden");
            });

        link.attr('d', d3.sankeyLinkHorizontal());
        sankey.update(graph);

        node.append('rect')
            .attr('height', d => d.y1 - d.y0)
            .attr('width', d => d.x1 - d.x0)
            .style('fill', (d, i) => {
                d.color = color(d.colorOrder)
                return d.color;
            })
            .style('stroke', 'none')
            .append('text')
            .text(d => `${d.name}\n${format(d.value)}`);

        node.append('text')
            .attr('x', 0)
            //.attr('dx', sankey.nodeWidth() / 2)
            .attr('dy', '-.35em')
            .attr('text-anchor', 'middle')
            .attr('transform', null)
            .text(d => d.name)
            .style('fill', d => color(d.colorOrder))
            .style('text-background', (d, i) => {
                //d.color = color(d.name.replace(/ .*/, ''));
                d.color = color(d.colorOrder);
                return d.color;
            })
            .text(d => d.name)
            .call(wrap, 10);

        // create a tooltip
        var tooltip = d3.select("#chart")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden");

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
        var chart = $("#chart").position();
        //the range here might be what determines the number of particles generated
        //            const frequencyScale = d3.scaleLinear()
        //                .domain(d3.extent(dataset.links, d => d.value))
        //                .range([1, 10]);
        const particleSize = d3.scaleLinear()
            .domain(d3.extent(dataset.links, d => d.size))
            .range([5, 20]);


        dataset.links.forEach((link) => {
            //link.freq = link.throughput;
            link.particleSize = link.size;
            link.particleColor = d3.scaleLinear().domain([0, 1]).range([link.source.color, link.target.color]);
            link.defectAlpha = d3.scaleLinear().domain([0, 1]).range([1, 0]);
        });

        const t = d3.timer(tick, 1000);
        let particles = [];

        function tick(elapsed, time) {
            particles = particles.filter(d => d.current < d.path.getTotalLength());
            d3.selectAll('path.link')
                .each(
                    function(d) {
                        for (let x = 0; x < 2; x += 1) {
                            const offset = (Math.random() - 0.5) * (d.width - (d.size * 2));
                            //const offset = 1;
                            const defectToggle = (Math.random() <= d.defectRate ? 1 : 0);
                            const discardToggle = (Math.random() <= d.discardRate ? 1 : 0);
                            
                            if (Math.random() < d.throughput) {
                                particles.push({
                                    link: d,
                                    time: elapsed,
                                    offset,
                                    path: this,
                                    defect: defectToggle,
                                    discard: discardToggle,
                                    speed: (1 / d.leadTime) + (Math.random())
                                });
                            }
                        }
                    });
            particleEdgeCanvasPath(elapsed);
        }

        function particleEdgeCanvasPath(elapsed) {
            const context = d3.select('canvas')
                .node()
                .getContext('2d');
            context.clearRect(0, 0, width, height);
            context.fillStyle = 'gray';
            context.lineWidth = '1px';
            for (const x in particles) {
                if ({}.hasOwnProperty.call(particles, x)) {
                    const currentTime = elapsed - particles[x].time;
                    // var currentPercent = currentTime / 1000 * particles[x].path.getTotalLength();
                    //this changes the particle speed, but not the rate at which particles are replenished
                    particles[x].current = currentTime * 0.15 * particles[x].speed;
                    var currentPos = particles[x].path.getPointAtLength(particles[x].current);
                    context.beginPath();
                    //defect check
                    if (particles[x].defect == 1) {
                        //particle is a defect, flat red
                        context.fillStyle = 'red';
                        context.globalAlpha = 1;
                        //reverse it
                        currentPos = particles[x].path.getPointAtLength(particles[x].path.getTotalLength() - particles[x].current);
                    } else {
                        //particle is not a defect, change the particle fill as it travels
                        context.fillStyle = particles[x].link.particleColor(particles[x].current / particles[x].path.getTotalLength());
                        if (particles[x].discard == 1) {
                            //particle is discarded, fade out
                            //this check is to fix the weird flicker bug when particle reaches getTotalLength()
                            if (particles[x].current > (particles[x].path.getTotalLength() * 0.74)) {
                                context.globalAlpha = 0;
                            } else {
                                context.globalAlpha = particles[x].link.defectAlpha(particles[x].current / (particles[x].path.getTotalLength() * 0.75));
                            }
                        } else context.globalAlpha = 1;
                    }
                    context.arc(currentPos.x + particles[x].link.particleSize, currentPos.y + particles[x].offset, particles[x].link.particleSize, 0, 2 * Math.PI);
                    context.fill()
                }
            }
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

        function wrap(text, width) {
            text.each(function() {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    wordsLength = words.length,
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    x = text.attr("x"),
                    y = text.attr("y"),
                    dy = 0, //parseFloat(text.attr("dy")),
                    tspan = text.text(null)
                    .append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", dy + "em");
                while (word = words.pop()) {
                    lineNumber++;
                    line.push(word);
                    tspan.text(line.join(" "));
                    //not done, take next word
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan")
                            .attr("class", lineNumber)
                            .attr("x", 0)
                            .attr("y", d => {
                                if (lineNumber == 1) {
                                    return ((-wordsLength * 1.2) - 0.35) + "em";
                                } else return y;
                            })
                            .attr("dx", sankey.nodeWidth() / 2)
                            .attr("dy", "1.2em")
                            .text(word);
                    }
                }
            });
        }

        //****** END CREATE CHART ******//

        function getNodePos(el) {
            var body = d3.select('body').node();

            for (var lx = 0, ly = 0; el != null && el != body; lx += (el.offsetLeft || el.clientLeft), ly += (el.offsetTop || el.clientTop), el = (el.offsetParent || el.parentNode))
            ;
            return {
                x: lx,
                y: ly
            };
        }