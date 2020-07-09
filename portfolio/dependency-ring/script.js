d3.csv("data.csv").then(function(t) { d3.timeFormat("%B %d, %Y %I:%M %p"); var e = $("#chart").width(),
        n = .6 * $(window).innerHeight(),
        r = d3.arc().innerRadius(90).outerRadius(100).startAngle(function(t) { return findStartAngle(t.children) }).endAngle(function(t) { return findEndAngle(t.children) }),
        a = [];
    t.forEach(t => { a.push({ source: t.Key, sourceProj: t["Project Key"], target: t["Link To"], targetProj: t["Link Project Key"], count: 1 }) }), a = a.filter(t => JSON.stringify(t.target) !== JSON.stringify(t.source)); var o = [];
    d3.nest().key(function(t) { return t.target }).key(t => t.targetProj).rollup(function(t) { return { total: d3.sum(t, function(t) { return t.count }) } }).entries(a).forEach(function(t) { o.push({ id: t.key, group: t.values[0].key, total: t.values[0].value.total }) }); var s = d3.scaleLinear().domain([0, 500]).range([500, 4e3])(o.length) / 2,
        u = d3.radialLine().curve(d3.curveBundle.beta(.85)).radius(t => t.y).angle(t => t.x),
        l = d3.cluster().size([2 * Math.PI, s - 100]),
        c = d3.nest().key(function(t) { return t.source }).key(function(t) { return t.sourceProj }).rollup(function(t) { return { total: d3.sum(t, function(t) { return t.count }) } }).entries(a),
        d = 0;
    c.forEach(t => {-1 == o.findIndex(e => e.id == t.key) ? o.push({ id: t.key, group: t.values[0].key, total: t.values[0].value.total }) : (d = o.findIndex(e => e.id == t.key), o[d].total += t.values[0].value.total) }); const i = { nodes: o, links: a };
    console.log(i); const g = new Map,
        f = new Map(o.map(t => [t.id, t])); for (const t of o) { let e = g.get(t.group);
        e || g.set(t.group, e = { name: t.group, children: [] }), e.children.push(t), t.targetIds = [] } for (const { source: t, target: e }
        of a) f.get(t).targetIds.push(e);
    t = { name: "miserables", children: [...g.values()] }; const p = l(d3.hierarchy(t)),
        h = new Map(p.leaves().map(t => [t.data.id, t])),
        m = d3.merge(p.leaves().map(t => t.data.targetIds.map(e => t.path(h.get(e))))); var v = d3.nest().key(t => t.data.group).rollup(t => ({ x0: t[0].x, x1: t[t.length - 1].x })).entries(p.leaves()); const k = d3.scaleSequential().interpolator(d3.interpolateRainbow).domain([0, v.length]);
    r = d3.arc().startAngle(function(t) { return t.value.x0 }).endAngle(function(t) { return t.value.x1 }).innerRadius(s - 150).outerRadius(s - 100); const y = d3.select("#chart").append("svg").attr("width", e).attr("height", n).style("font", "10px sans-serif");
    d3.zoom().on("zoom", function zoomed() { x.attr("transform", d3.event.transform + " translate(" + e / 2 + "," + n / 2 + ") scale(0.2)") })(y); var x = y.append("g").attr("transform", "translate(" + e / 2 + "," + n / 2 + ") scale(0.2)"),
        I = x.append("g").selectAll(".link"),
        P = x.append("g").selectAll(".node"),
        w = x.append("g").selectAll(".arc");
    I = I.attr("fill", "none").attr("stroke-opacity", .5).attr("stroke-width", "3px").attr("transform", "translate(" + e / 2 + "," + n / 2 + ")").data(m).enter().append("path").each(function(t) { t.source = t[0], t.target = t[t.length - 1] }).attr("class", "link").style("mix-blend-mode", "screen").attr("stroke", t => "white").attr("class", "link").attr("d", u), P = P.data(p.leaves()).enter().append("text").attr("class", "node").attr("transform", t => `\n        rotate(${180*t.x/Math.PI-90})\n        translate(${t.y},0)${t.x>=Math.PI?"\n        rotate(180)":""}\n      `).attr("dy", "0.31em").attr("x", t => t.x < Math.PI ? 3 : -3).attr("text-anchor", t => t.x < Math.PI ? "start" : "end").text(t => t.data.id).on("mouseover", function mouse_over(t) { P.each(function(t) { t.target = t.source = !1 }), I.classed("link--target", function(e) { if (e.target === t) return e.source.source = !0 }).classed("link--source", function(e) { if (e.source === t) return e.target.target = !0 }).filter(function(e) { return e.target === t || e.source === t }), P.classed("node--target", function(t) { return t.target }).classed("node--source", function(t) { return t.source }) }).on("mouseout", function mouse_out(t) { I.classed("link--target", !1).classed("link--source", !1), P.classed("node--target", !1).classed("node--source", !1) }), w = w.data(v).enter().append("path").attr("class", "arc").attr("d", r).style("fill", (t, e) => k(e)) });