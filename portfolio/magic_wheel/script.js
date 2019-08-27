        /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) || /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform) ? ($("#chart").append('<img src="/img/portfolio/magic_wheel.png"/>'), $("#chart").append("<p>For the interactive version, please visit this site on desktop!</p>")) : d3.csv("data.csv", function(t, e) {
            if (t) throw t;
            var n, i;
            e.forEach(function(t, n) {
                e[n] = [t["Summary Sequence"], +t.Count, t["Status Sequence"], t["Key Sequence"], t["To Do Sequence"], t["In Progress Sequence"], t["Done Sequence"]], delete t.data
            }), n = $("#chart").innerWidth(), i = .6 * $(window).innerHeight();
            var r = Math.min(n, i) / 2;
            d3.scaleLinear().range([0, 2 * Math.PI]).clamp(!0), d3.scaleSqrt().range([.1 * r, r]);
            const a = t => {
                const e = t.x1 - t.x0,
                    n = Math.max(0, (Math.sqrt(t.y0) + Math.sqrt(t.y1)) / 2) * e;
                return "root" == t.data.name ? 6 * t.data.name.length < n : 6 * t.data.desc.length < n
            };
            var s = {
                    w: $("#sequence").width() / 5,
                    h: 50,
                    s: 3,
                    t: 10
                },
                l = {
                    "To Do": "#4FC0E8",
                    "In Progress": "#FECD57",
                    Done: "#9ED36A"
                },
                d = {
                    "To Do": "darkblue",
                    "In Progress": "brown",
                    Done: "darkgreen"
                },
                c = 0,
                o = d3.select("#chart").append("svg").attr("width", n).attr("height", i).attr("x", n / 2).append("g").attr("id", "container").attr("transform", "translate(" + n / 2 + "," + i / 2 + ")"),
                h = d3.partition().size([2 * Math.PI, r * r]),
                y = d3.arc().startAngle(function(t) {
                    return t.x0
                }).endAngle(function(t) {
                    return t.x1
                }).innerRadius(function(t) {
                    return Math.sqrt(t.y0)
                }).outerRadius(function(t) {
                    return Math.sqrt(t.y1)
                });

            function p(t) {
                if (t.ancestors) {
                    var e = t.ancestors().reverse(),
                        n = (100 * t.value / c).toPrecision(3),
                        i = n + "%";
                    n < .1 && (i = "< 0.1%"), d3.select("#percentage").text(i), d3.select("#explanation").style("visibility", ""), e.shift(),
                        function(t, e) {
                            var n = d3.select("#trail").selectAll("g").data(t, function(t) {
                                return t.data.name + t.depth
                            });
                            n.exit().remove();
                            var i = n.enter().append("g");
                            i.append("polygon").attr("points", x).style("fill", function(t) {
                                return "THEME-??" == t.data.name || "FEATURE-??" == t.data.name || "EPIC-??" == t.data.name ? "grey" : l[t.data.status]
                            }), i.append("text").attr("x", (s.w + s.t) / 2).attr("y", s.h / 2).attr("dy", "1.15em").attr("text-anchor", "middle").style("fill", "#2E353D").text(function(t) {
                                return t.data.desc.length < 25 ? t.data.desc : t.data.desc.substring(0, 25) + "..."
                            }), i.append("text").attr("x", (s.w + s.t) / 2).attr("y", s.h / 2).attr("dy", "-0.5em").attr("text-anchor", "middle").style("fill", "#2E353D").text(function(t) {
                                return t.data.name
                            }), i.merge(n).attr("transform", function(t, e) {
                                return "translate(" + e * (s.w + s.s) + ", 0)"
                            }), d3.select("#trail").select("#endsize").attr("x", (t.length + .1) * (s.w + s.s)).attr("y", s.h / 2).attr("dy", "-0.5em").attr("text-anchor", "left").style("fill", "white").text("% of Backlog"), d3.select("#trail").select("#endlabel").attr("x", (t.length + .1) * (s.w + s.s)).attr("y", s.h / 2).attr("dy", "1.15em").attr("text-anchor", "left").style("fill", "white").text(e), d3.select("#trail").style("visibility", "")
                        }(e, i), d3.selectAll("path").style("opacity", .3), o.selectAll("path").filter(function(t) {
                            return e.indexOf(t) >= 0
                        }).style("opacity", 1), d3.select("#centreKey").text(t.data.name).style("visibility", "");
                    d3.select("#centreDesc").text(function() {
                        return t.data.desc.length > 25 ? t.data.desc.substring(0, 25) + "..." : t.data.desc
                    }).style("visibility", ""), d3.select("#centretoDoText").style("visibility", ""), d3.select("#centretoDo").text(t.data.toDo).style("visibility", ""), d3.select("#centretoDoPercentage").text(d3.format(",.0%")(t.data.toDo / (t.data.toDo + t.data.inProgress + t.data.done))).style("visibility", ""), d3.select("#centreInProgressText").style("visibility", ""), d3.select("#centreInProgress").text(t.data.inProgress).style("visibility", ""), d3.select("#centreInProgressPercentage").text(d3.format(",.0%")(t.data.inProgress / (t.data.toDo + t.data.inProgress + t.data.done))).style("visibility", ""), d3.select("#centreDoneText").style("visibility", ""), d3.select("#centreDone").text(t.data.done).style("visibility", ""), d3.select("#centreDonePercentage").text(d3.format(",.0%")(t.data.done / (t.data.toDo + t.data.inProgress + t.data.done))).style("visibility", "")
                }
            }

            function u(t) {
                d3.select("#trail").style("visibility", "hidden"), d3.selectAll("path").on("mouseover", null), d3.selectAll("path").transition().style("opacity", 1).on("end", function() {
                    d3.select(this).on("mouseover", p)
                }), d3.select("#explanation").style("visibility", "hidden"), d3.select("#centreKey").style("visibility", "hidden"), d3.select("#centreDesc").style("visibility", "hidden"), d3.select("#centretoDoText").style("visibility", "hidden"), d3.select("#centretoDo").style("visibility", "hidden"), d3.select("#centretoDoPercentage").style("visibility", "hidden"), d3.select("#centreInProgressText").style("visibility", "hidden"), d3.select("#centreInProgress").style("visibility", "hidden"), d3.select("#centreInProgressPercentage").style("visibility", "hidden"), d3.select("#centreDoneText").style("visibility", "hidden"), d3.select("#centreDone").style("visibility", "hidden"), d3.select("#centreDonePercentage").style("visibility", "hidden")
            }

            function x(t, e) {
                var n = [];
                return n.push("0,0"), n.push(s.w + ",0"), n.push(s.w + s.t + "," + s.h / 2), n.push(s.w + "," + s.h), n.push("0," + s.h), e > 0 && n.push(s.t + "," + s.h / 2), n.join(" ")
            }

            function f() {
                var t = d3.select("#legend");
                "hidden" == t.style("visibility") ? t.style("visibility", "") : t.style("visibility", "hidden")
            }! function(t) {
                x = d3.select("#sequence").append("svg").attr("width", n).attr("height", 50).attr("id", "trail"), x.append("text").attr("id", "endsize").style("fill", "#000"), x.append("text").attr("id", "endlabel").style("fill", "#000"), e = {
                    w: 75,
                    h: 30,
                    s: 3,
                    r: 3
                }, s = d3.select("#chart").append("svg").attr("width", e.w).attr("height", d3.keys(l).length * (e.h + e.s)).attr("transform", "translate(" + (d3.select("#chart").node().getBoundingClientRect().width - 1.5 * e.w) + "," + -i + ")").selectAll("g").data(d3.entries(l)).enter().append("g").attr("transform", function(t, n) {
                    return "translate(0," + n * (e.h + e.s) + ")"
                }), s.append("rect").attr("rx", e.r).attr("ry", e.r).attr("width", e.w).attr("height", e.h).style("fill", function(t) {
                    return t.value
                }), s.append("text").attr("id", "legend").attr("x", e.w / 2).attr("y", e.h / 2).attr("dy", "0.35em").attr("text-anchor", "middle").style("fill", "#2E353D").text(function(t) {
                    return t.key
                }), d3.select("#togglelegend").on("click", f), o.append("circle").attr("r", r).style("opacity", 0);
                var e, s;
                var x;
                var g = d3.hierarchy(t).sum(function(t) {
                        return t.size
                    }),
                    v = h(g).descendants().filter(function(t) {
                        return t.x1 - t.x0 > 0
                    }),
                    m = o.data([t]).selectAll("path").data(v).enter().append("path").attr("id", function(t, e) {
                        return "arc_" + e
                    }).attr("class", "arcs").attr("display", function(t) {
                        return t.depth ? null : "none"
                    }).attr("d", y).attr("fill-rule", "evenodd").style("fill", function(t) {
                        return "THEME-??" == t.data.name || "FEATURE-??" == t.data.name || "EPIC-??" == t.data.name ? "grey" : l[t.data.status]
                    }).style("opacity", 1).on("mouseover", p);
                m.each((t, e) => {
                    var n = /(^.+?)L/.exec(d3.select("#arc_" + e).attr("d"));
                    if (n) {
                        if (n = n[1].replace(/,/g, " "), t.x0 > 90 * Math.PI / 180 && t.x1 < 270 * Math.PI / 180) {
                            var i = /0 0 1 (.*?)$/;
                            if (null != i.exec(n)) {
                                var r = i.exec(n)[1],
                                    a = /M(.*?)A/.exec(n)[1],
                                    s = /A(.*?)0 0 1/.exec(n)[1];
                                n = "M" + r + "A" + s + "0 0 0 " + a, t.flipped = !0
                            }
                        } else t.flipped = !1;
                        o.append("path").attr("class", "hiddenDonutArcs").attr("id", "donutArc" + e).attr("d", n).style("fill", "none")
                    }
                }), o.selectAll(".arcText").data(v).enter().append("text").attr("class", "arcText").attr("dy", function(t) {
                    return 1 == t.depth ? t.x0 > 90 * Math.PI / 180 && t.x1 < 270 * Math.PI / 180 ? -25 : 35 : 2 == t.depth ? t.x0 > 90 * Math.PI / 180 && t.x1 < 270 * Math.PI / 180 ? -20 : 25 : 3 == t.depth ? t.x0 > 90 * Math.PI / 180 && t.x1 < 270 * Math.PI / 180 ? -15 : 20 : 4 == t.depth ? t.x0 > 90 * Math.PI / 180 && t.x1 < 270 * Math.PI / 180 ? -10 : 15 : void 0
                }).append("textPath").attr("startOffset", "50%").attr("text-anchor", "middle").attr("xlink:href", function(t, e) {
                    return "#donutArc" + e
                }).attr("display", t => a(t) ? null : "none").style("font-size", "0.75em").style("fill", function(t) {
                    if ("THEME-??" != t.data.name && "FEATURE-??" != t.data.name && "EPIC-??" != t.data.name) return d[t.data.status]
                }).text(t => t.data.desc).attr("pointer-events", "none"), d3.select("#container").on("mouseleave", u), c = m.datum().value, d3.select("#container").append("text").attr("id", "centreKey").attr("text-anchor", "middle").attr("y", "-50px").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#container").append("text").attr("id", "centreDesc").attr("text-anchor", "middle").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#container").append("g").attr("id", "centre").attr("transform", "translate(0,75)"), d3.select("#centre").append("text").attr("id", "centretoDoText").attr("text-anchor", "middle").attr("x", "-50px").attr("y", "-25px").attr("dy", "-1em").text("To Do").style("fill", l["To Do"]).style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centretoDo").attr("text-anchor", "middle").attr("x", "-50px").attr("y", "-25px").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centretoDoPercentage").attr("text-anchor", "middle").attr("x", "-50px").attr("y", "-25px").attr("dy", "1em").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centreInProgressText").attr("text-anchor", "middle").attr("y", "-25px").attr("dy", "-1em").text("In Progress").style("fill", l["In Progress"]).style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centreInProgress").attr("text-anchor", "middle").attr("y", "-25px").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centreInProgressPercentage").attr("text-anchor", "middle").attr("y", "-25px").attr("dy", "1em").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centreDoneText").attr("text-anchor", "middle").attr("x", "50px").attr("y", "-25px").attr("dy", "-1em").text("Done").style("fill", l.Done).style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centreDone").attr("text-anchor", "middle").attr("x", "50px").attr("y", "-25px").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden"), d3.select("#centre").append("text").attr("id", "centreDonePercentage").attr("text-anchor", "middle").attr("x", "50px").attr("y", "-25px").attr("dy", "1em").style("fill", "white").style("font-size", "0.75em").style("visibility", "hidden")
            }(function(t) {
                for (var e = {
                        name: "root",
                        children: []
                    }, n = 0; n < t.length; n++) {
                    var i = t[n][0],
                        r = +t[n][1],
                        a = t[n][2],
                        s = t[n][3],
                        l = t[n][4],
                        d = t[n][5],
                        c = t[n][6];
                    if (!isNaN(r))
                        for (var o = i.split("\\\\\\"), h = a.split("\\\\\\"), y = s.split("\\\\\\"), p = l.split("\\\\\\"), u = d.split("\\\\\\"), x = c.split("\\\\\\"), f = e, g = 0; g < o.length; g++) {
                            var v, m = f.children,
                                P = y[g],
                                b = h[g],
                                D = o[g],
                                w = p[g],
                                I = u[g],
                                T = x[g];
                            if (g + 1 < o.length) {
                                for (var z = !1, A = 0; A < m.length; A++)
                                    if (m[A].name == P) {
                                        (v = m[A]).children.sort(function(t, e) {
                                            var n = {
                                                    "To Do": 1,
                                                    "In Progress": 2,
                                                    Done: 3
                                                },
                                                i = +n[t.status],
                                                r = +n[e.status];
                                            return d3.descending(i, r)
                                        }), z = !0;
                                        break
                                    }
                                z || (v = {
                                    name: P,
                                    status: b,
                                    desc: D,
                                    toDo: +w,
                                    inProgress: +I,
                                    done: +T,
                                    children: []
                                }, m.push(v)), f = v
                            } else v = {
                                name: P,
                                status: b,
                                desc: D,
                                toDo: +w,
                                inProgress: +I,
                                done: +T,
                                size: r
                            }, m.push(v)
                        }
                }
                for (var M, E, q = {
                        "To Do": 1,
                        "In Progress": 2,
                        Done: 3
                    }, k = e.children.length - 1; k >= 0; k--) {
                    for (var S = e.children[k].children.length - 1; S >= 0; S--) {
                        for (var C = e.children[k].children[S].children.length - 1; C >= 0; C--) e.children[k].children[S].children[C].children.sort(function(t, e) {
                            return M = +q[t.status], E = +q[e.status], M != E ? d3.ascending(M, E) : d3.ascending(t.size, e.size)
                        });
                        e.children[k].children[S].children.sort(function(t, e) {
                            return M = +q[t.status], E = +q[e.status], M != E ? d3.ascending(M, E) : d3.ascending(t.size, e.size)
                        })
                    }
                    e.children[k].children.sort(function(t, e) {
                        return M = +q[t.status], E = +q[e.status], M != E ? d3.ascending(M, E) : d3.ascending(t.size, e.size)
                    })
                }
                return e
            }(e))
        });
