/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) || /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform) ? ($("#chart").append('<img src="../../img/portfolio/magic-wheel.png"/>'), $("#chart").append("<p>For the interactive version, please visit this site on desktop!</p>"), d3.select("#header").html("<h3 class='amber-text'>JIRA 'Magic Wheel'</h3><h6>version 1.1</h6>")) : d3.csv("data.csv").then(function(t) {
    var e, n;
    t.forEach(function(e, n) { t[n] = [e["Summary Sequence"], +e.Count, e["Status Sequence"], e["Key Sequence"], e["To Do Sequence"], e["In Progress Sequence"], e["Done Sequence"]], delete e.data }), e = $("#chart").innerWidth(), n = .6 * $(window).innerHeight();
    var i = Math.min(e, n) / 2;
    d3.scaleLinear().range([0, 2 * Math.PI]).clamp(!0), d3.scaleSqrt().range([.1 * i, i]);
    var r = { w: $("#sequence").width() / 5, h: 50, s: 3, t: 10 },
        a = { "To Do": "#4FC0E8", "In Progress": "#FECD57", Done: "#9ED36A" },
        s = { "To Do": "darkblue", "In Progress": "brown", Done: "darkgreen" },
        l = 0,
        d = d3.select("#chart").append("svg").attr("width", e).attr("height", n).attr("x", e / 2).append("g").attr("id", "container").attr("transform", "translate(" + e / 2 + "," + n / 2 + ")"),
        c = d3.partition().size([2 * Math.PI, i * i]),
        o = d3.arc().startAngle(function(t) { return t.x0 }).endAngle(function(t) { return t.x1 }).innerRadius(function(t) { return Math.sqrt(t.y0) }).outerRadius(function(t) { return Math.sqrt(t.y1) });

    function mouseover(t) {
        var e = (100 * t.value / l).toPrecision(3),
            n = e + "%";
        e < .1 && (n = "< 0.1%"), d3.select("#percentage").text(n), d3.select("#explanation").style("visibility", "");
        var i = t.ancestors().reverse();
        i.shift(),
            function updateBreadcrumbs(t, e) {
                var n = d3.select("#trail").selectAll("g").data(t, function(t) { return t.data.name + t.depth });
                n.exit().remove();
                var i = n.enter().append("g");
                i.append("polygon").attr("points", breadcrumbPoints).style("fill", function(t) { return "THEME-??" == t.data.name || "FEATURE-??" == t.data.name || "EPIC-??" == t.data.name ? "grey" : a[t.data.status] }), i.append("text").attr("x", (r.w + r.t) / 2).attr("y", r.h / 2).attr("dy", "1.15em").attr("text-anchor", "middle").style("fill", "#2E353D").text(function(t) { return t.data.desc.length < 25 ? t.data.desc : t.data.desc.substring(0, 25) + "..." }), i.append("text").attr("x", (r.w + r.t) / 2).attr("y", r.h / 2).attr("dy", "-0.5em").attr("text-anchor", "middle").style("fill", "#2E353D").text(function(t) { return t.data.name }), i.merge(n).attr("transform", function(t, e) { return "translate(" + e * (r.w + r.s) + ", 0)" }), d3.select("#trail").select("#endsize").attr("x", (t.length + .1) * (r.w + r.s)).attr("y", r.h / 2).attr("dy", "-0.5em").attr("text-anchor", "left").style("fill", "white").text("% of Backlog"), d3.select("#trail").select("#endlabel").attr("x", (t.length + .1) * (r.w + r.s)).attr("y", r.h / 2).attr("dy", "1.15em").attr("text-anchor", "left").style("fill", "white").text(e), d3.select("#trail").style("visibility", "")
            }(i, n), d3.selectAll("path").style("opacity", .3), d.selectAll("path").filter(function(t) { return i.indexOf(t) >= 0 }).style("opacity", 1), d3.select("#centreKey").text(t.data.name).style("visibility", ""), d3.select("#centreDesc").text(function() { return t.data.desc.length > 25 ? t.data.desc.substring(0, 25) + "..." : t.data.desc }).style("visibility", ""), d3.select("#centretoDoText").style("visibility", ""), d3.select("#centretoDo").text(t.data.toDo).style("visibility", ""), d3.select("#centretoDoPercentage").text(d3.format(",.0%")(t.data.toDo / (t.data.toDo + t.data.inProgress + t.data.done))).style("visibility", ""), d3.select("#centreInProgressText").style("visibility", ""), d3.select("#centreInProgress").text(t.data.inProgress).style("visibility", ""), d3.select("#centreInProgressPercentage").text(d3.format(",.0%")(t.data.inProgress / (t.data.toDo + t.data.inProgress + t.data.done))).style("visibility", ""), d3.select("#centreDoneText").style("visibility", ""), d3.select("#centreDone").text(t.data.done).style("visibility", ""), d3.select("#centreDonePercentage").text(d3.format(",.0%")(t.data.done / (t.data.toDo + t.data.inProgress + t.data.done))).style("visibility", "")
    }

    function mouseleave(t) { d3.select("#trail").style("visibility", "hidden"), d3.selectAll("path").on("mouseover", null), d3.selectAll("path").transition().style("opacity", 1).on("end", function() { d3.select(this).on("mouseover", mouseover) }), d3.select("#explanation").style("visibility", "hidden"), d3.select("#centreKey").style("visibility", "hidden"), d3.select("#centreDesc").style("visibility", "hidden"), d3.select("#centretoDoText").style("visibility", "hidden"), d3.select("#centretoDo").style("visibility", "hidden"), d3.select("#centretoDoPercentage").style("visibility", "hidden"), d3.select("#centreInProgressText").style("visibility", "hidden"), d3.select("#centreInProgress").style("visibility", "hidden"), d3.select("#centreInProgressPercentage").style("visibility", "hidden"), d3.select("#centreDoneText").style("visibility", "hidden"), d3.select("#centreDone").style("visibility", "hidden"), d3.select("#centreDonePercentage").style("visibility", "hidden") }

    function breadcrumbPoints(t, e) { var n = []; return n.push("0,0"), n.push(r.w + ",0"), n.push(r.w + r.t + "," + r.h / 2), n.push(r.w + "," + r.h), n.push("0," + r.h), e > 0 && n.push(r.t + "," + r.h / 2), n.join(" ") }

    function toggleLegend() { var t = d3.select("#legend"); "hidden" == t.style("visibility") ? t.style("visibility", "") : t.style("visibility", "hidden") }! function createVisualization(t) {
        (function initializeBreadcrumbTrail() {
            var t = d3.select("#sequence").append("svg").attr("width", e).attr("height", 50).attr("id", "trail");
            t.append("text").attr("id", "endsize").style("fill", "#000"), t.append("text").attr("id", "endlabel").style("fill", "#000")
        })(),
        function drawLegend() {
            var t = d3.select("#legend").append("svg").attr("width", 75).attr("height", 33 * d3.keys(a).length).attr("transform", "translate(" + (d3.select("#legend").node().getBoundingClientRect().width - 112.5) + ",0)").selectAll("g").data(d3.entries(a)).enter().append("g").attr("transform", function(t, e) { return "translate(0," + 33 * e + ")" });
            t.append("rect").attr("rx", 3).attr("ry", 3).attr("width", 75).attr("height", 30).style("fill", function(t) { return t.value }), t.append("text").attr("x", 37.5).attr("y", 15).attr("dy", "0.35em").attr("text-anchor", "middle").style("fill", "#2E353D").text(function(t) { return t.key })
        }(), d3.select("#togglelegend").on("click", toggleLegend), d.append("circle").attr("r", i).style("opacity", 0);
        var n = d3.hierarchy(t).sum(function(t) { return t.size }),
            r = c(n).descendants().filter(function(t) { return t.x1 - t.x0 > 0 }),
            h = d.data([t]).selectAll("path").data(r).enter().append("path").attr("id", function(t, e) { return "arc_" + e }).attr("class", "arcs").attr("display", function(t) { return t.depth ? null : "none" }).attr("d", o).attr("fill-rule", "evenodd").style("fill", function(t) { return "THEME-??" == t.data.name || "FEATURE-??" == t.data.name || "EPIC-??" == t.data.name ? "grey" : a[t.data.status] }).style("opacity", 1).on("mouseover", mouseover);
        h.each((t, e) => {
            var n = /(^.+?)L/.exec(d3.select("#arc_" + e).attr("d"));
            if (n) {
                if (n = n[1].replace(/,/g, " "), t.x0 > 90 * Math.PI / 180 && t.x1 < 270 * Math.PI / 180) {
                    var i = /0 0 1 (.*?)$/;
                    if (null != i.exec(n)) {
                        var r = i.exec(n)[1],
                            a = /M(.*?)A/.exec(n)[1];
                        n = "M" + r + "A" + /A(.*?)0 0 1/.exec(n)[1] + "0 0 0 " + a, t.flipped = !0
                    }
                } else t.flipped = !1;
                d.append("path").attr("class", "hiddenDonutArcs").attr("id", "donutArc" + e).attr("d", n).style("fill", "none")
            }
        }), d.selectAll(".arcText").data(r).enter().append("text").attr("class", "arcText").attr("dy", function(t) { return 1 == t.depth ? t.x0 > 90 * Math.PI / 180 && t.x1 < 270 * Math.PI / 180 ? -25 : 35 : 2 == t.depth ? t.x0 > 90 * Math.PI / 180 && t.x1 < 270 * Math.PI / 180 ? -20 : 25 : 3 == t.depth ? t.x0 > 90 * Math.PI / 180 && t.x1 < 270 * Math.PI / 180 ? -15 : 20 : 4 == t.depth ? t.x0 > 90 * Math.PI / 180 && t.x1 < 270 * Math.PI / 180 ? -10 : 15 : void 0 }).append("textPath").attr("startOffset", "50%").attr("text-anchor", "middle").attr("xlink:href", function(t, e) { return "#donutArc" + e }).attr("display", t => (t => {
            const e = t.x1 - t.x0,
                n = Math.max(0, (Math.sqrt(t.y0) + Math.sqrt(t.y1)) / 2) * e;
            return "root" == t.data.name ? 6 * t.data.name.length < n : 6 * t.data.desc.length < n
        })(t) ? null : "none").style("font-size", "0.75em").style("fill", function(t) { if ("THEME-??" != t.data.name && "FEATURE-??" != t.data.name && "EPIC-??" != t.data.name) return s[t.data.status] }).text(t => t.data.desc).attr("pointer-events", "none"), d3.select("#container").on("mouseleave", mouseleave), l = h.datum().value, d3.select("#container").append("text").attr("id", "centreKey").attr("text-anchor", "middle").attr("y", "-50px").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#container").append("text").attr("id", "centreDesc").attr("text-anchor", "middle").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#container").append("g").attr("id", "centre").attr("transform", "translate(0,75)"), d3.select("#centre").append("text").attr("id", "centretoDoText").attr("text-anchor", "middle").attr("x", "-50px").attr("y", "-25px").attr("dy", "-1em").text("To Do").style("fill", a["To Do"]).style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centretoDo").attr("text-anchor", "middle").attr("x", "-50px").attr("y", "-25px").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centretoDoPercentage").attr("text-anchor", "middle").attr("x", "-50px").attr("y", "-25px").attr("dy", "1em").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centreInProgressText").attr("text-anchor", "middle").attr("y", "-25px").attr("dy", "-1em").text("In Progress").style("fill", a["In Progress"]).style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centreInProgress").attr("text-anchor", "middle").attr("y", "-25px").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centreInProgressPercentage").attr("text-anchor", "middle").attr("y", "-25px").attr("dy", "1em").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centreDoneText").attr("text-anchor", "middle").attr("x", "50px").attr("y", "-25px").attr("dy", "-1em").text("Done").style("fill", a.Done).style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centreDone").attr("text-anchor", "middle").attr("x", "50px").attr("y", "-25px").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centreDonePercentage").attr("text-anchor", "middle").attr("x", "50px").attr("y", "-25px").attr("dy", "1em").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden")
    }(function buildHierarchy(t) {
        for (var e = { name: "root", children: [] }, n = 0; n < t.length; n++) {
            var i = t[n][0],
                r = +t[n][1],
                a = t[n][2],
                s = t[n][3],
                l = t[n][4],
                d = t[n][5],
                c = t[n][6];
            if (!isNaN(r))
                for (var o = i.split("\\\\\\"), h = a.split("\\\\\\"), y = s.split("\\\\\\"), u = l.split("\\\\\\"), p = d.split("\\\\\\"), x = c.split("\\\\\\"), f = e, g = 0; g < o.length; g++) {
                    var m, v = f.children,
                        b = y[g],
                        P = h[g],
                        D = o[g],
                        w = u[g],
                        I = p[g],
                        z = x[g];
                    if (g + 1 < o.length) {
                        for (var T = !1, A = 0; A < v.length; A++)
                            if (v[A].name == b) {
                                (m = v[A]).children.sort(function(t, e) {
                                    var n = { "To Do": 1, "In Progress": 2, Done: 3 },
                                        i = +n[t.status],
                                        r = +n[e.status];
                                    return d3.descending(i, r)
                                }), T = !0;
                                break
                            }
                        T || (m = { name: b, status: P, desc: D, toDo: +w, inProgress: +I, done: +z, children: [] }, v.push(m)), f = m
                    } else m = { name: b, status: P, desc: D, toDo: +w, inProgress: +I, done: +z, size: r }, v.push(m)
                }
        }
        for (var M, E, q = { "To Do": 1, "In Progress": 2, Done: 3 }, k = e.children.length - 1; k >= 0; k--) {
            for (var S = e.children[k].children.length - 1; S >= 0; S--) {
                for (var B = e.children[k].children[S].children.length - 1; B >= 0; B--) e.children[k].children[S].children[B].children.sort(function(t, e) { return M = +q[t.status], E = +q[e.status], M != E ? d3.ascending(M, E) : d3.ascending(t.size, e.size) });
                e.children[k].children[S].children.sort(function(t, e) { return M = +q[t.status], E = +q[e.status], M != E ? d3.ascending(M, E) : d3.ascending(t.size, e.size) })
            }
            e.children[k].children.sort(function(t, e) { return M = +q[t.status], E = +q[e.status], M != E ? d3.ascending(M, E) : d3.ascending(t.size, e.size) })
        }
        return e
    }(t))
});