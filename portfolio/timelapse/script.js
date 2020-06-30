const formatNumber = d3.format(",.0f"),
    format = t => `${formatNumber(t)} Days`;
var widthFactor, heightFactor, linkTable = [],
    nodeTable = [],
    links = [],
    nodes = [],
    dependencies = [],
    parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S"),
    formatDate = d3.timeFormat("%Y/%m/%d"),
    parseTime = d3.timeParse("%d/%m/%Y"),
    cleanDate = d3.timeFormat("%e %b '%y"),
    emptyDate = formatDate(parseDate(0));
/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) || /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform) ? (widthFactor = 5, heightFactor = 1.2) : (widthFactor = 1, heightFactor = .8);
const margin = { top: 100, right: 30, bottom: 20, left: 30 },
    width = $("#chart").innerWidth() * widthFactor - margin.left - margin.right - parseFloat($(".container").css("padding-left")) - parseFloat($(".container").css("padding-right")),
    height = $(window).innerHeight() * heightFactor - margin.top - margin.bottom,
    nodeWidth = 100,
    nodeHeight = 40,
    svg = d3.select("#chart").append("svg").style("position", "relative").attr("width", width).attr("height", height);
d3.csv("data.csv", function(t, e) { if (t) throw t; for (entry in linkTable = d3.nest().key(t => formatDate(parseTime(t.date))).sortKeys(d3.ascending).key(t => t.action).object(e), dateTable = Object.keys(linkTable), linkTable) linkTable[entry].added && linkTable[entry].added.forEach(t => { nodeTable.push({ id: t.target, added: entry }) }); var n = d3.scaleSequential().interpolator(d3.interpolateRainbow).domain([0, 4]),
        r = d3.forceSimulation(nodes).force("charge", d3.forceManyBody().strength(t => (t.id, -5e3))).force("collision", d3.forceCollide().radius(function(t) { return 100 })).force("link", d3.forceLink(links).distance(t => (t.source.id, 200))).force("x", d3.forceX(t => (type = t.id.substr(0, t.id.indexOf("-")), "root" == type ? width / 2 : null))).force("y", d3.forceY(t => (type = t.id.substr(0, t.id.indexOf("-")), "root" == type ? height / 2 : null))).alphaTarget(1).on("tick", function ticked() { d.attr("x", function(t) { return t.x }).attr("y", function(t) { return t.y }), l.attr("x", function(t) { return t.x }).attr("y", function(t) { return t.y }), i.attr("x1", function(t) { return t.source.x }).attr("y1", function(t) { return t.source.y }).attr("x2", function(t) { return t.target.x }).attr("y2", function(t) { return t.target.y }), a.attr("x1", function(t) { return t.source.x }).attr("y1", function(t) { return t.source.y }).attr("x2", function(t) { return t.target.x }).attr("y2", function(t) { return t.target.y }) }),
        o = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
        i = o.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link"),
        a = o.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".dependency"),
        d = o.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node"),
        l = o.append("g").attr("font-color", "#fff").attr("text-anchor", "middle").attr("pointer-events", "none").selectAll(".label"),
        s = d3.select("#chart").append("div").attr("id", "tooltip").style("position", "absolute").style("visibility", "hidden"),
        c = d3.select("svg"),
        f = { x: window.scrollX, y: window.scrollY, w: window.innerWidth, h: window.innerHeight },
        h = d3.select("#chart"),
        u = { w: h.node().offsetWidth, h: h.node().offsetHeight },
        g = (document.width, document.height, function getNodePos(t) { for (var e = d3.select("body").node(), n = 0, r = 0; null != t && t != e; n += t.offsetLeft || t.clientLeft, r += t.offsetTop || t.clientTop, t = t.offsetParent || t.parentNode); return { x: n, y: r } }(c.node())),
        p = { x: 10, y: 10 },
        y = d3.select("#header").node().getBoundingClientRect(),
        m = d3.select("#navbar").node().getBoundingClientRect(),
        b = $("#chart").position(),
        x = d3.drag().on("start", function drag_start(t) { d3.event.active || r.alphaTarget(.3).restart(), t.fx = t.x, t.fy = t.y }).on("drag", function drag_drag(t) { t.fx = d3.event.x, t.fy = d3.event.y }).on("end", function drag_end(t) { d3.event.active || r.alphaTarget(0), t.fx = null, t.fy = null });
    x(d), d3.zoom().on("zoom", function zoom_actions() { o.attr("transform", d3.event.transform) })(svg), restart(); var w = 0,
        v = d3.interval(function() { tempTable = nodeTable.filter(t => t.added == dateTable[w]), tempTable && (tempTable.forEach(t => { nodes.push(t) }), restart()), tempTable = linkTable[dateTable[w]].linked, tempTable && (tempTable.forEach(t => { "dependency" != t.type ? links.push({ source: nodeTable.find(e => e.id == t.source).index.toString(), target: nodeTable.find(e => e.id == t.target).index.toString(), type: t.type }) : dependencies.push({ source: nodeTable.find(e => e.id == t.source).index.toString(), target: nodeTable.find(e => e.id == t.target).index.toString(), type: t.type }) }), restart()), console.log(nodes), console.log(links), console.log(dependencies), d3.select("#info").style("color", "white").html(dateTable[w]), console.log(dateTable[w]), ++w == dateTable.length && v.stop() }, 1e3, d3.now());

    function restart() {
        (d = d.data(nodes, function(t) { return t.id })).exit().remove(), (l = l.data(nodes, function(t) { return t.id })).exit().remove(), d = d.enter().append("rect").attr("fill", function(t, e) { return "grey" }).attr("width", nodeWidth).attr("height", nodeHeight).attr("rx", "2px").attr("ry", "2px").attr("transform", "translate(-" + nodeWidth / 2 + ",-" + nodeHeight / 2 + ")").merge(d).on("mouseover", function() { return s.style("visibility", "visible") }).on("mousemove", function(t, e) { var n = d3.mouse(c.node());
            f.x = window.scrollX, f.y = window.scrollY, n[0] += g.x, n[1] += g.y, s.style("right", ""), s.style("left", ""), s.style("bottom", ""), s.style("top", ""), s.html(t.id + "<br>Completion %:"), n[0] > f.x + f.w / 2 ? s.style("right", u.w - n[0] + p.x + margin.right + "px") : s.style("left", n[0] + p.x + margin.left - b.left + "px"), n[1] > f.y + f.h / 2 ? s.style("bottom", u.h - n[1] + p.y + y.height + m.height + "px") : s.style("top", n[1] + p.y - y.height - m.height + "px"), s.style("visibility", "visible") }).on("mouseout", function() { return s.style("visibility", "hidden") }).call(x), l = l.enter().append("text").attr("dx", 12).attr("dy", ".35em").attr("transform", "translate(-" + (nodeWidth / 4 - 7.5) + ",0)").text(function(t) { return t.id }).merge(l), (i = i.data(links, function(t) { return t.source.id + "-" + t.target.id })).exit().remove(), i = i.enter().append("line").attr("stroke", function(t, e) { return type = nodes[t.source].id.substr(0, nodes[t.source].id.indexOf("-")), 0 == t.source ? n(0) : "THEME" == type ? n(1) : "FEATURE" == type ? n(2) : "EPIC" == type ? n(3) : void 0 }).merge(i), (a = a.data(dependencies, function(t) { return t.source.id + "-" + t.target.id })).exit().remove(), a = a.enter().append("line").attr("stroke", "red").attr("x1", width / 2).attr("x2", width / 2 + 100).attr("y1", height / 2).attr("y2", height / 2 + height).merge(a), r.nodes(nodes), r.force("link").links(links), r.alpha(1).restart() } });