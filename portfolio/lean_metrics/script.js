        var dataTable, colourScheme, parseDate = d3.utcParse("%d/%m/%Y"),
            formatDate = d3.timeFormat("%Y-%W"),
            parseTime = d3.timeParse("%Y-%W"),
            cleanDate = d3.timeFormat("%e %b '%y"),
            emptyDate = formatDate(parseDate(0));
        d3.csv("data.csv", function(t, e) {
            if (t) throw t;
            e.forEach(t => {
                t.date = parseDate(t.Date), t.cycle15th = +t["Cycle Time 15th"], t.cycle50th = +t["Cycle Time 50th"], t.cycle85th = +t["Cycle Time 85th"], t.throughput = +t.Throughput, t.throughputAvg = +t["Throughput Avg"], t.wip = +t.WIP, t.defectsRaised = +t["Defects Raised"], t.defectsResolved = +t["Defects Resolved"], t.wellbeingBad = parseFloat(t["Wellbeing Negative"]), t.wellbeingOkay = parseFloat(t["Wellbeing Neutral"]), t.wellbeingGood = parseFloat(t["Wellbeing Positive"])
            });
            var a, r, l = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 40
            };
            a = $("#cycleChartContainer").innerWidth() - l.left - l.right - parseFloat($(".container").css("padding-left")) - parseFloat($(".container").css("padding-right")), r = .6 * $(window).innerHeight() * .25 - l.top - l.bottom;
            var o = d3.select("#cycleChartContainer").append("svg").attr("id", "cycleChart").attr("width", a + l.left + l.right).attr("height", r + l.top + l.bottom).append("g").attr("transform", "translate(" + l.left + "," + l.top + ")"),
                s = d3.select("#throughputChartContainer").append("svg").attr("id", "throughputChart").attr("width", a + l.left + l.right).attr("height", r + l.top + l.bottom).append("g").attr("transform", "translate(" + l.left + "," + l.top + ")"),
                d = d3.select("#wipChartContainer").append("svg").attr("id", "wipChart").attr("width", a + l.left + l.right).attr("height", r + l.top + l.bottom).append("g").attr("transform", "translate(" + l.left + "," + l.top + ")"),
                n = d3.select("#qualityChartContainer").append("svg").attr("id", "qualityChart").datum(e).attr("width", a + l.left + l.right).attr("height", r + l.top + l.bottom).append("g").attr("transform", "translate(" + l.left + "," + l.top + ")"),
                c = d3.select("#wellbeingChartContainer").append("svg").attr("id", "wellbeingChart").datum(e).attr("width", a + l.left + l.right).attr("height", r + l.top + l.bottom).append("g").attr("transform", "translate(" + l.left + "," + l.top + ")"),
                y = o.append("defs").append("linearGradient").attr("id", "cycleGradient").attr("x1", "0%").attr("x2", "0%").attr("y1", "0%").attr("y2", "100%");
            y.append("stop").attr("class", "bad").attr("offset", "0%"), y.append("stop").attr("class", "okay").attr("offset", "50%"), y.append("stop").attr("class", "good").attr("offset", "100%");
            var p = s.append("defs").append("linearGradient").attr("id", "throughputGradient").attr("x1", "0%").attr("x2", "0%").attr("y1", "0%").attr("y2", "100%");
            p.append("stop").attr("class", "good").attr("offset", "0%"), p.append("stop").attr("class", "okay").attr("offset", "50%"), p.append("stop").attr("class", "bad").attr("offset", "100%");
            var h = d.append("defs").append("linearGradient").attr("id", "wipGradient").attr("x1", "0%").attr("x2", "0%").attr("y1", "0%").attr("y2", "100%");
            h.append("stop").attr("class", "bad").attr("offset", "0%"), h.append("stop").attr("class", "okay").attr("offset", "50%"), h.append("stop").attr("class", "good").attr("offset", "100%");
            var x = c.append("defs").append("linearGradient").attr("id", "wellbeingGradient").attr("x1", "0%").attr("x2", "0%").attr("y1", "0%").attr("y2", "100%");
            x.append("stop").attr("class", "good").attr("offset", "0%"), x.append("stop").attr("class", "okay").attr("offset", "50%"), x.append("stop").attr("class", "bad").attr("offset", "100%");
            var g = {
                good: "#2EB86B",
                okay: "#E8BF61",
                bad: "#D85D6C"
            };
            d3.selectAll(".good").style("stop-color", g.good), d3.selectAll(".okay").style("stop-color", g.okay), d3.selectAll(".bad").style("stop-color", g.bad);
            var u = d3.scaleTime().range([0, a]),
                f = d3.scaleLinear().range([r, 0]),
                v = d3.line().x(function(t) {
                    return u(t.date)
                }).y(function(t) {
                    return f(t.cycle50th)
                }),
                w = d3.area().x(function(t) {
                    return u(t.date)
                }).y0(function(t) {
                    return f(t.cycle15th)
                }).y1(function(t) {
                    return f(t.cycle85th)
                });
            u.domain(d3.extent(e, function(t) {
                return t.date
            })), f.domain([0, d3.max(e, function(t) {
                return t.cycle85th
            })]), o.append("path").data([e]).attr("class", "line").attr("d", w).style("fill", "grey").style("opacity", .3).style("stroke", "none");
            var m = o.append("path").data([e]).attr("class", "line").attr("d", v).style("fill", "none").style("stroke", "url(#cycleGradient)").style("stroke-width", "4px");
            o.append("g").attr("class", "axis").attr("transform", "translate(0," + r + ")").call(d3.axisBottom(u)), o.append("g").attr("class", "axis").call(d3.axisLeft(f).ticks(5));
            var B = d3.scaleBand().range([0, a]).padding(.1),
                b = d3.scaleTime().range([0, a]),
                T = d3.scaleLinear().range([r, 0]);
            B.domain(e.map(function(t) {
                return t.date
            })), b.domain(d3.extent(e, function(t) {
                return t.date
            })), T.domain([0, d3.max(e, function(t) {
                return t.throughput
            })]);
            var k = d3.line().x(function(t) {
                return b(t.date)
            }).y(function(t) {
                return T(t.throughputAvg)
            });
            s.selectAll(".bar").data(e).enter().append("rect").attr("class", "bar").attr("x", function(t) {
                return B(t.date)
            }).attr("width", B.bandwidth()).attr("y", function(t) {
                return T(t.throughput)
            }).attr("height", function(t) {
                return r - T(t.throughput)
            }).style("opacity", .3).style("fill", "grey");
            var A = s.append("path").data([e]).attr("class", "line").attr("d", k).style("fill", "none").style("stroke", "url(#throughputGradient)").style("stroke-width", "4px");
            s.append("g").attr("class", "axis").attr("transform", "translate(0," + r + ")").call(d3.axisBottom(b)), s.append("g").attr("class", "axis").call(d3.axisLeft(T).ticks(5));
            var R = d3.scaleTime().range([0, a]),
                H = d3.scaleLinear().range([r, 0]),
                C = d3.line().x(function(t) {
                    return R(t.date)
                }).y(function(t) {
                    return H(t.wip)
                }),
                D = d3.area().x(function(t) {
                    return R(t.date)
                }).y0(function(t) {
                    return H(0)
                }).y1(function(t) {
                    return H(t.wip)
                });
            R.domain(d3.extent(e, function(t) {
                return t.date
            })), H.domain([0, d3.max(e, function(t) {
                return t.wip
            })]), d.append("path").data([e]).attr("class", "line").attr("d", D).style("fill", "grey").style("opacity", .3).style("stroke", "none");
            var q = d.append("path").data([e]).attr("class", "line").attr("d", C).style("fill", "none").style("stroke", "url(#wipGradient)").style("stroke-width", "4px");
            d.append("g").attr("class", "axis").attr("transform", "translate(0," + r + ")").call(d3.axisBottom(R)), d.append("g").attr("class", "axis").call(d3.axisLeft(H).ticks(5));
            var L = d3.scaleTime().range([0, a]),
                G = d3.scaleLinear().range([r, 0]),
                O = d3.line().x(function(t) {
                    return L(t.date)
                }).y(function(t) {
                    return G(t.defectsRaised)
                }),
                P = d3.line().x(function(t) {
                    return L(t.date)
                }).y(function(t) {
                    return G(t.defectsResolved)
                });
            L.domain(d3.extent(e, function(t) {
                return t.date
            })), G.domain([0, d3.max(e, t => Math.max(t.defectsRaised, t.defectsResolved))]);
            var F = d3.area().x(function(t) {
                return L(t.date)
            }).y1(function(t) {
                return G(t.defectsRaised)
            });
            n.append("clipPath").attr("id", "clip-below").append("path").attr("d", F.y0(r)), n.append("clipPath").attr("id", "clip-above").append("path").attr("d", F.y0(0)), n.append("path").attr("class", "area above").attr("clip-path", "url(#clip-above)").attr("d", F.y0(function(t) {
                return G(t.defectsResolved)
            })).style("opacity", .3).style("fill", g.good), n.append("path").attr("class", "area below").attr("clip-path", "url(#clip-below)").attr("d", F).style("opacity", .3).style("fill", g.bad);
            var W = n.append("path").data([e]).attr("class", "line").attr("d", O).style("stroke", g.bad).style("fill", "none").style("stroke-width", "4px"),
                M = n.append("path").data([e]).attr("class", "line").attr("d", P).style("stroke", g.good).style("fill", "none").style("stroke-width", "4px");
            n.append("g").attr("class", "axis").attr("transform", "translate(0," + r + ")").call(d3.axisBottom(L)), n.append("g").attr("class", "axis").call(d3.axisLeft(G).ticks(5));
            var E = d3.scaleBand().range([0, a]).padding(.1),
                S = d3.scaleTime().range([0, a]),
                N = d3.scaleLinear().range([r, 0]);
            E.domain(e.map(function(t) {
                return t.date
            })), S.domain(d3.extent(e, function(t) {
                return t.date
            })), N.domain([-1, 1]);
            var Y = d3.area().x(function(t) {
                    return S(t.date)
                }).y0(function(t) {
                    return N(t.wellbeingOkay / 2)
                }).y1(function(t) {
                    return N(t.wellbeingGood + t.wellbeingOkay / 2)
                }),
                I = d3.area().x(function(t) {
                    return S(t.date)
                }).y0(function(t) {
                    return N(-t.wellbeingOkay / 2)
                }).y1(function(t) {
                    return N(t.wellbeingOkay / 2)
                }),
                U = d3.area().x(function(t) {
                    return S(t.date)
                }).y1(function(t) {
                    return N(-t.wellbeingOkay / 2)
                }).y0(function(t) {
                    return N(-(t.wellbeingBad + t.wellbeingOkay / 2))
                }),
                X = d3.line().x(function(t) {
                    return S(t.date)
                }).y(function(t) {
                    return N(t.wellbeingGood + t.wellbeingOkay / 2)
                }),
                j = d3.line().x(function(t) {
                    return S(t.date)
                }).y(function(t) {
                    return N(0)
                }),
                z = d3.line().x(function(t) {
                    return S(t.date)
                }).y(function(t) {
                    return N(-(t.wellbeingBad + t.wellbeingOkay / 2))
                });
            c.append("path").data([e]).attr("class", "line").attr("d", I).style("fill", "grey").style("fill-opacity", .3).style("stroke", "grey").style("stroke-width", "2px").style("stroke-opacity", 1), c.append("path").data([e]).attr("class", "line").attr("d", Y).style("fill", g.good).style("fill-opacity", .3).style("stroke", g.good).style("stroke-width", "2px").style("stroke-opacity", 1), c.append("path").data([e]).attr("class", "line").attr("d", U).style("fill", g.bad).style("fill-opacity", .3).style("stroke", g.bad).style("stroke-width", "2px").style("stroke-opacity", 1);
            var J = c.append("path").data([e]).attr("class", "line").attr("d", X).style("fill", "none"),
                K = c.append("path").data([e]).attr("class", "line").attr("d", j).style("fill", "none"),
                Q = c.append("path").data([e]).attr("class", "line").attr("d", z).style("fill", "none");
            c.append("g").attr("class", "axis").attr("transform", "translate(0," + r / 2 + ")").call(d3.axisBottom(S).ticks(0)).style("stroke-dasharray", "2, 2"), c.append("g").attr("class", "axis").attr("transform", "translate(0," + r + ")").call(d3.axisBottom(S)), c.append("g").attr("class", "axis").call(d3.axisLeft(N).tickFormat(t => d3.format(".0%")(Math.abs(t))).ticks(5));
            var V = o.append("g").attr("class", "mouse-over-effects"),
                Z = (V.append("line").attr("class", "mouse-line").style("stroke-width", "2px").style("opacity", "0").style("stroke", "white"), V.append("circle").attr("id", "cycleCircle").attr("class", "hoverCircle").attr("r", 7).style("stroke-width", "2px").style("opacity", "0"), V.selectAll("rect").data(["HoverRect", "DateRect"]).enter().append("rect").attr("id", t => "cycle" + t).attr("class", "hoverBackground"), V.selectAll("text").data(["HoverText", "DateText"]).enter().append("text").attr("id", t => "cycle" + t).attr("class", "hoverText").attr("fill", "white"), s.append("g").attr("class", "mouse-over-effects")),
                _ = (Z.append("line").attr("class", "mouse-line").style("stroke-width", "2px").style("opacity", "0").style("stroke", "white"), Z.append("circle").attr("id", "throughputCircle").attr("class", "hoverCircle").attr("r", 7).style("stroke-width", "2px").style("opacity", "0"), Z.selectAll("rect").data(["HoverRect", "DateRect"]).enter().append("rect").attr("id", t => "throughput" + t).attr("class", "hoverBackground"), Z.selectAll("text").data(["HoverText", "DateText"]).enter().append("text").attr("id", t => "throughput" + t).attr("class", "hoverText").attr("fill", "white"), d.append("g").attr("class", "mouse-over-effects")),
                tt = (_.append("line").attr("class", "mouse-line").style("stroke-width", "2px").style("opacity", "0").style("stroke", "white"), _.append("circle").attr("id", "wipCircle").attr("class", "hoverCircle").attr("r", 7).style("stroke-width", "2px").style("opacity", "0"), _.selectAll("rect").data(["HoverRect", "DateRect"]).enter().append("rect").attr("id", t => "wip" + t).attr("class", "hoverBackground"), _.selectAll("text").data(["HoverText", "DateText"]).enter().append("text").attr("id", t => "wip" + t).attr("class", "hoverText").attr("fill", "white"), n.append("g").attr("class", "mouse-over-effects")),
                et = (tt.append("line").attr("class", "mouse-line").style("stroke-width", "2px").style("opacity", "0").style("stroke", "white"), tt.append("circle").attr("id", "qualityRaisedCircle").attr("class", "hoverCircle").attr("r", 7).style("stroke-width", "2px").style("opacity", "0"), tt.selectAll("rect").data(["qualityRaisedHoverRect", "qualityResolvedHoverRect", "qualityRaisedDateRect"]).enter().append("rect").attr("id", t => t).attr("class", "hoverBackground"), tt.selectAll("text").data(["qualityRaisedHoverText", "qualityResolvedHoverText", "qualityRaisedDateText"]).enter().append("text").attr("id", t => t).attr("class", "hoverText").attr("fill", "white"), tt.append("circle").attr("id", "qualityResolvedCircle").attr("class", "hoverCircle").attr("r", 7).style("stroke-width", "2px").style("opacity", "0"), c.append("g").attr("class", "mouse-over-effects"));
            et.append("line").attr("class", "mouse-line").style("stroke-width", "2px").style("opacity", "0").style("stroke", "white"), et.append("circle").attr("id", "wellbeingGoodCircle").attr("class", "hoverCircle").attr("r", 7).style("stroke-width", "2px").style("opacity", "0"), et.selectAll("rect").data(["wellbeingGoodHoverRect", "wellbeingOkayHoverRect", , "wellbeingBadHoverRect", "wellbeingDateRect"]).enter().append("rect").attr("id", t => t).attr("class", "hoverBackground"), et.selectAll("text").data(["wellbeingGoodHoverText", "wellbeingOkayHoverText", "wellbeingBadHoverText", "wellbeingDateText"]).enter().append("text").attr("id", t => t).attr("class", "hoverText").attr("fill", "white"), et.append("circle").attr("id", "wellbeingOkayCircle").attr("class", "hoverCircle").attr("r", 7).style("stroke-width", "2px").style("opacity", "0"), et.append("circle").attr("id", "wellbeingBadCircle").attr("class", "hoverCircle").attr("r", 7).style("stroke-width", "2px").style("opacity", "0");

            function at(t, o, s) {
                var d = document.getElementById("cycleChartContainer").offsetLeft,
                    n = m.node(),
                    c = n.getTotalLength(),
                    y = A.node(),
                    p = y.getTotalLength(),
                    h = q.node(),
                    x = h.getTotalLength(),
                    g = W.node(),
                    v = g.getTotalLength(),
                    w = M.node(),
                    B = w.getTotalLength(),
                    k = J.node(),
                    C = k.getTotalLength(),
                    D = K.node(),
                    G = D.getTotalLength(),
                    O = Q.node(),
                    P = O.getTotalLength(),
                    F = d3.bisector(t => t.date).right,
                    E = (Math.max(c, p, x, v, B), Math.max(d3.select("text#cycleHoverText").node().getBBox().width, d3.select("text#throughputHoverText").node().getBBox().width, d3.select("text#wipHoverText").node().getBBox().width, d3.select("text#qualityRaisedHoverText").node().getBBox().width, d3.select("text#wellbeingGoodHoverText").node().getBBox().width, d3.select("text#wellbeingOkayHoverText").node().getBBox().width, d3.select("text#wellbeingBadHoverText").node().getBBox().width)),
                    N = d3.scaleSequential().interpolator(rt(d3.interpolateRgb, [s.good, s.okay, s.bad])).domain([f(d3.min(e, t => t.cycle50th)), f(d3.max(e, t => t.cycle50th))]),
                    Y = d3.scaleSequential().interpolator(rt(d3.interpolateRgb, [s.bad, s.okay, s.good])).domain([T(d3.min(e, t => +t.throughputAvg)), T(d3.max(e, t => +t.throughputAvg))]),
                    I = d3.scaleSequential().interpolator(rt(d3.interpolateRgb, [s.good, s.okay, s.bad])).domain([H(d3.min(e, t => +t.wip)), H(d3.max(e, t => +t.wip))]);
                d3.selectAll(".mouse-line").attr("x1", t[0]).attr("x2", t[0]).attr("y1", r).attr("y2", 0);
                var U = d3.event.pageX - d - l.left - parseFloat($(".container").css("padding-left")),
                    X = o[F(o, u.invert(U))],
                    j = o[F(o, b.invert(U))],
                    z = o[F(o, R.invert(U))],
                    V = o[F(o, L.invert(U))],
                    Z = o[F(o, L.invert(U))],
                    _ = o[F(o, S.invert(U))],
                    tt = o[F(o, S.invert(U))],
                    et = o[F(o, S.invert(U))];
                for (d3.select("text#cycleDateText").style("opacity", 1).attr("x", U).attr("y", r + l.bottom / 2 + 5).attr("dy", "0.1em").attr("text-anchor", "middle").text(cleanDate(X.date)), d3.select("rect#cycleDateRect").style("opacity", 1).attr("x", U).attr("y", r + l.bottom / 2 + 5).attr("width", d3.select("text#cycleDateText").node().getBBox().width + 2).attr("height", d3.select("text#cycleDateText").node().getBBox().height + 2).attr("transform", "translate(" + -d3.select("text#cycleDateText").node().getBBox().width / 2 + ",-15)"), d3.select("text#throughputDateText").style("opacity", 1).attr("x", U).attr("y", r + l.bottom / 2 + 5).attr("dy", "0.1em").attr("text-anchor", "middle").text(cleanDate(j.date)), d3.select("rect#throughputDateRect").style("opacity", 1).attr("x", U).attr("y", r + l.bottom / 2 + 5).attr("width", d3.select("text#throughputDateText").node().getBBox().width + 2).attr("height", d3.select("text#throughputDateText").node().getBBox().height + 2).attr("transform", "translate(" + -d3.select("text#throughputDateText").node().getBBox().width / 2 + ",-15)"), d3.select("text#wipDateText").style("opacity", 1).attr("x", U).attr("y", r + l.bottom / 2 + 5).attr("dy", "0.1em").attr("text-anchor", "middle").text(cleanDate(z.date)), d3.select("rect#wipDateRect").style("opacity", 1).attr("x", U).attr("y", r + l.bottom / 2 + 5).attr("width", d3.select("text#wipDateText").node().getBBox().width + 2).attr("height", d3.select("text#wipDateText").node().getBBox().height + 2).attr("transform", "translate(" + -d3.select("text#wipDateText").node().getBBox().width / 2 + ",-15)"), d3.select("text#qualityRaisedDateText").style("opacity", 1).attr("x", U).attr("y", r + l.bottom / 2 + 5).attr("dy", "0.1em").attr("text-anchor", "middle").text(cleanDate(V.date)), d3.select("rect#qualityRaisedDateRect").style("opacity", 1).attr("x", U).attr("y", r + l.bottom / 2 + 5).attr("width", d3.select("text#qualityRaisedDateText").node().getBBox().width + 2).attr("height", d3.select("text#qualityRaisedDateText").node().getBBox().height + 2).attr("transform", "translate(" + -d3.select("text#qualityRaisedDateText").node().getBBox().width / 2 + ",-15)"), d3.select("text#wellbeingDateText").style("opacity", 1).attr("x", U).attr("y", r + l.bottom / 2 + 5).attr("dy", "0.1em").attr("text-anchor", "middle").text(cleanDate(_.date)), d3.select("rect#wellbeingDateRect").style("opacity", 1).attr("x", U).attr("y", r + l.bottom / 2 + 5).attr("width", d3.select("text#wellbeingDateText").node().getBBox().width + 2).attr("height", d3.select("text#wellbeingDateText").node().getBBox().height + 2).attr("transform", "translate(" + -d3.select("text#wellbeingDateText").node().getBBox().width / 2 + ",-15)"), i = U; i < c; i += 1) {
                    var at = n.getPointAtLength(i);
                    if (at.x >= U) break
                }
                if (a - at.x - E < 30) var lt = -15 - d3.select("text#cycleHoverText").node().getBBox().width;
                else lt = 10;
                for (d3.select("circle#cycleCircle").style("fill", N(at.y)).style("stroke", "white").style("opacity", 1).attr("cx", U - 1).attr("cy", at.y), d3.select("text#cycleHoverText").style("opacity", 1).attr("x", U).attr("y", at.y).attr("dx", lt).attr("dy", "0.25em").text("Average: " + X.cycle50th + " Bus. Days"), d3.select("rect#cycleHoverRect").style("opacity", 1).attr("x", U).attr("y", at.y).attr("width", d3.select("text#cycleHoverText").node().getBBox().width + 2).attr("height", d3.select("text#cycleHoverText").node().getBBox().height + 2).attr("transform", "translate(" + lt + ",-12.5)"), i = U; i < p; i += 1) {
                    var ot = y.getPointAtLength(i);
                    if (ot.x >= U) break
                }
                if (a - ot.x - E < 30) var it = -15 - d3.select("text#throughputHoverText").node().getBBox().width;
                else it = 10;
                for (d3.select("circle#throughputCircle").style("fill", Y(ot.y)).style("stroke", "white").style("opacity", 1).attr("cx", U).attr("cy", ot.y), d3.select("text#throughputHoverText").style("opacity", 1).attr("x", U).attr("y", ot.y).attr("dx", it).attr("dy", "0.25em").text("Average: " + j.throughputAvg + " User Stories / Week"), d3.select("rect#throughputHoverRect").style("opacity", 1).attr("x", U).attr("y", ot.y).attr("width", d3.select("text#throughputHoverText").node().getBBox().width + 2).attr("height", d3.select("text#throughputHoverText").node().getBBox().height + 2).attr("transform", "translate(" + it + ",-12.5)"), i = U; i < x; i += 1) {
                    var st = h.getPointAtLength(i);
                    if (st.x >= U) break
                }
                if (a - st.x - E < 30) var dt = -15 - d3.select("text#wipHoverText").node().getBBox().width;
                else dt = 10;
                for (d3.select("circle#wipCircle").style("fill", I(st.y)).style("stroke", "white").style("opacity", 1).attr("cx", U - 1).attr("cy", st.y), d3.select("text#wipHoverText").style("opacity", 1).attr("x", U).attr("y", st.y).attr("dx", dt).attr("dy", "0.25em").text("Total: " + z.wip + " User Stories"), d3.select("rect#wipHoverRect").style("opacity", 1).attr("x", U).attr("y", st.y).attr("width", d3.select("text#wipHoverText").node().getBBox().width + 2).attr("height", d3.select("text#wipHoverText").node().getBBox().height + 2).attr("transform", "translate(" + dt + ",-12.5)"), i = U; i < v; i += 1) {
                    var nt = g.getPointAtLength(i);
                    if (nt.x >= U) break
                }
                if (a - nt.x - E < 30) var ct = -15 - d3.select("text#qualityRaisedHoverText").node().getBBox().width;
                else ct = 10;
                for (i = U; i < B; i += 1) {
                    var yt = w.getPointAtLength(i);
                    if (yt.x >= U) break
                }
                if (a - yt.x - E < 30) var pt = -15 - d3.select("text#qualityResolvedHoverText").node().getBBox().width;
                else pt = 10;
                if (yt.y - nt.y < d3.select("text#qualityResolvedHoverText").node().getBBox().height + 2) var ht = -(d3.select("text#qualityResolvedHoverText").node().getBBox().height + 2) + yt.y - nt.y;
                else ht = 0;
                for (d3.select("circle#qualityRaisedCircle").style("fill", "#D85D6C").style("stroke", "white").style("opacity", 1).attr("cx", U - 1).attr("cy", nt.y), d3.select("text#qualityRaisedHoverText").style("opacity", 1).attr("x", U).attr("y", nt.y).attr("dx", ct).attr("dy", ht).text("Raised: " + V.defectsRaised), d3.select("rect#qualityRaisedHoverRect").style("opacity", 1).attr("x", U).attr("y", nt.y).attr("width", d3.select("text#qualityRaisedHoverText").node().getBBox().width + 2).attr("height", d3.select("text#qualityRaisedHoverText").node().getBBox().height + 2).attr("transform", "translate(" + ct + "," + (-15.5 + ht) + ")"), d3.select("circle#qualityResolvedCircle").style("fill", "#2EB86B").style("stroke", "white").style("opacity", 1).attr("cx", U - 1).attr("cy", yt.y), d3.select("text#qualityResolvedHoverText").style("opacity", 1).attr("x", U).attr("y", yt.y).attr("dx", pt).attr("dy", "0.25em").text("Resolved: " + Z.defectsResolved), d3.select("rect#qualityResolvedHoverRect").style("opacity", 1).attr("x", U).attr("y", yt.y).attr("width", d3.select("text#qualityResolvedHoverText").node().getBBox().width + 2).attr("height", d3.select("text#qualityResolvedHoverText").node().getBBox().height + 2).attr("transform", "translate(" + pt + ",-12.5)"), i = U; i < C; i += 1) {
                    var xt = k.getPointAtLength(i);
                    if (xt.x >= U) break
                }
                if (a - xt.x - E < 30) var gt = -15 - d3.select("text#wellbeingGoodHoverText").node().getBBox().width;
                else gt = 10;
                for (i = U; i < G; i += 1) {
                    var ut = D.getPointAtLength(i);
                    if (ut.x >= U) break
                }
                if (a - ut.x - E < 30) var ft = -15 - d3.select("text#wellbeingOkayHoverText").node().getBBox().width;
                else ft = 10;
                for (i = U; i < P; i += 1) {
                    var vt = O.getPointAtLength(i);
                    if (vt.x >= U) break
                }
                if (a - vt.x - E < 30) var wt = -15 - d3.select("text#wellbeingBadHoverText").node().getBBox().width;
                else wt = 10;
                if (ut.y - xt.y < d3.select("text#wellbeingOkayHoverText").node().getBBox().height + 2) var mt = -(d3.select("text#wellbeingOkayHoverText").node().getBBox().height + 2) + ut.y - xt.y;
                else mt = 0;
                if (vt.y - ut.y < d3.select("text#wellbeingOkayHoverText").node().getBBox().height + 2) var Bt = d3.select("text#wellbeingOkayHoverText").node().getBBox().height + 2 + ut.y - vt.y;
                else Bt = 0;
                d3.select("circle#wellbeingGoodCircle").style("fill", "#2EB86B").style("stroke", "white").style("opacity", 1).attr("cx", U - 1).attr("cy", xt.y), d3.select("text#wellbeingGoodHoverText").style("opacity", 1).attr("x", U).attr("y", xt.y).attr("dx", gt).attr("dy", mt).text("Positive: " + d3.format(".0%")(tt.wellbeingGood)), d3.select("rect#wellbeingGoodHoverRect").style("opacity", 1).attr("x", U).attr("y", xt.y).attr("width", d3.select("text#wellbeingGoodHoverText").node().getBBox().width + 2).attr("height", d3.select("text#wellbeingGoodHoverText").node().getBBox().height + 2).attr("transform", "translate(" + gt + "," + (-15.5 + mt) + ")"), d3.select("circle#wellbeingOkayCircle").style("fill", "grey").style("stroke", "white").style("opacity", 1).attr("cx", U - 1).attr("cy", ut.y), d3.select("text#wellbeingOkayHoverText").style("opacity", 1).attr("x", U).attr("y", ut.y).attr("dx", ft).attr("dy", "0.25em").text("Neutral: " + d3.format(".0%")(tt.wellbeingOkay)), d3.select("rect#wellbeingOkayHoverRect").style("opacity", 1).attr("x", U).attr("y", ut.y).attr("width", d3.select("text#wellbeingOkayHoverText").node().getBBox().width + 2).attr("height", d3.select("text#wellbeingOkayHoverText").node().getBBox().height + 2).attr("transform", "translate(" + ft + ",-12.5)"), d3.select("circle#wellbeingBadCircle").style("fill", "#D85D6C").style("stroke", "white").style("opacity", 1).attr("cx", U - 1).attr("cy", vt.y), d3.select("text#wellbeingBadHoverText").style("opacity", 1).attr("x", U).attr("y", vt.y).attr("dx", wt).attr("dy", Bt).text("Negative: " + d3.format(".0%")(et.wellbeingBad)), d3.select("rect#wellbeingBadHoverRect").style("opacity", 1).attr("x", U).attr("y", vt.y).attr("width", d3.select("text#wellbeingBadHoverText").node().getBBox().width + 2).attr("height", d3.select("text#wellbeingBadHoverText").node().getBBox().height + 2).attr("transform", "translate(" + wt + "," + (-15.5 + Bt) + ")")
            }

            function rt(t, e) {
                for (var a = 0, r = e.length - 1, l = e[0], o = new Array(r < 0 ? 0 : r); a < r;) o[a] = t(l, l = e[++a]);
                return function(t) {
                    var e = Math.max(0, Math.min(r - 1, Math.floor(t *= r)));
                    return o[e](t - e)
                }
            }
            V.append("rect").attr("width", a).attr("height", r).attr("fill", "none").attr("pointer-events", "all").on("mouseout", function() {
                d3.selectAll(".mouse-line").style("opacity", "0"), d3.selectAll(".hoverCircle").style("opacity", "0"), d3.selectAll(".hoverBackground").style("opacity", "0"), d3.selectAll(".hoverText").style("opacity", "0")
            }).on("mouseover", function() {
                d3.selectAll(".mouse-line").style("opacity", "1"), d3.selectAll(".hoverCircle").style("opacity", "1"), d3.selectAll(".hoverBackground").style("opacity", "1"), d3.selectAll(".hoverText").style("opacity", "1")
            }).on("mousemove", function() {
                at(d3.mouse(this), e, g)
            }), Z.append("rect").attr("width", a).attr("height", r).attr("fill", "none").attr("pointer-events", "all").on("mouseout", function() {
                d3.selectAll(".mouse-line").style("opacity", "0"), d3.selectAll(".hoverCircle").style("opacity", "0"), d3.selectAll(".hoverBackground").style("opacity", "0"), d3.selectAll(".hoverText").style("opacity", "0")
            }).on("mouseover", function() {
                d3.selectAll(".mouse-line").style("opacity", "1"), d3.selectAll(".hoverCircle").style("opacity", "1"), d3.selectAll(".hoverBackground").style("opacity", "1"), d3.selectAll(".hoverText").style("opacity", "1")
            }).on("mousemove", function() {
                at(d3.mouse(this), e, g)
            }), _.append("rect").attr("width", a).attr("height", r).attr("fill", "none").attr("pointer-events", "all").on("mouseout", function() {
                d3.selectAll(".mouse-line").style("opacity", "0"), d3.selectAll(".hoverCircle").style("opacity", "0"), d3.selectAll(".hoverBackground").style("opacity", "0"), d3.selectAll(".hoverText").style("opacity", "0")
            }).on("mouseover", function() {
                d3.selectAll(".mouse-line").style("opacity", "1"), d3.selectAll(".hoverCircle").style("opacity", "1"), d3.selectAll(".hoverBackground").style("opacity", "1"), d3.selectAll(".hoverText").style("opacity", "1")
            }).on("mousemove", function() {
                at(d3.mouse(this), e, g)
            }), tt.append("rect").attr("width", a).attr("height", r).attr("fill", "none").attr("pointer-events", "all").on("mouseout", function() {
                d3.selectAll(".mouse-line").style("opacity", "0"), d3.selectAll(".hoverCircle").style("opacity", "0"), d3.selectAll(".hoverBackground").style("opacity", "0"), d3.selectAll(".hoverText").style("opacity", "0")
            }).on("mouseover", function() {
                d3.selectAll(".mouse-line").style("opacity", "1"), d3.selectAll(".hoverCircle").style("opacity", "1"), d3.selectAll(".hoverBackground").style("opacity", "1"), d3.selectAll(".hoverText").style("opacity", "1")
            }).on("mousemove", function() {
                at(d3.mouse(this), e, g)
            }), et.append("rect").attr("width", a).attr("height", r).attr("fill", "none").attr("pointer-events", "all").on("mouseout", function() {
                d3.selectAll(".mouse-line").style("opacity", "0"), d3.selectAll(".hoverCircle").style("opacity", "0"), d3.selectAll(".hoverBackground").style("opacity", "0"), d3.selectAll(".hoverText").style("opacity", "0")
            }).on("mouseover", function() {
                d3.selectAll(".mouse-line").style("opacity", "1"), d3.selectAll(".hoverCircle").style("opacity", "1"), d3.selectAll(".hoverBackground").style("opacity", "1"), d3.selectAll(".hoverText").style("opacity", "1")
            }).on("mousemove", function() {
                at(d3.mouse(this), e, g)
            })
        });
