d3.csv("data.csv",function(t,e){if(t)throw t;e.forEach(function(t){t.key=t["Epic Link"],t.total=+t.Total});var a={top:10,right:50,bottom:50,left:50},r=$("#chart").width()-a.left-a.right,l=.6*$(window).innerHeight()-a.top-a.bottom,o=d3.select("#chart").append("svg").attr("width",r+a.left+a.right).attr("height",l+a.top+a.bottom).append("g").attr("transform","translate("+a.left+","+a.top+")"),n=d3.select("#chart").append("div").attr("id","tooltip").style("position","absolute").style("visibility","hidden"),s=d3.scaleLinear().domain([0,d3.max(e,t=>t.total)]).range([0,r]);d3.scaleSequential().interpolator(function(t,e){var a=0,r=e.length-1,i=e[0],l=new Array(r<0?0:r);for(;a<r;)l[a]=t(i,i=e[++a]);return function(t){var e=Math.max(0,Math.min(r-1,Math.floor(t*=r)));return l[e](t-e)}}(d3.interpolateRgb,["white","yellow"])).domain([0,e.length]);o.append("g").attr("transform","translate(0,"+l+")").attr("class","axis").call(d3.axisBottom(s)),o.append("text").attr("class","axis").attr("transform","translate("+r/2+" ,"+(l+a.top+20)+")").style("text-anchor","middle").text("Size of Epic (Number of User Stories");var c=d3.histogram().value(function(t){return t.total}).domain(s.domain()).thresholds(s.ticks(s.domain()[1]/5))(e);c.unshift({x0:0,x1:0,length:0});var d=d3.scaleLinear().range([l,0]).domain([0,d3.max(c,function(t){return t.length})]);o.append("g").attr("class","axis").call(d3.axisLeft(d)),o.append("text").attr("class","axis").attr("transform","rotate(-90)").attr("y",0-a.left).attr("x",0-l/2).attr("dy","1em").style("text-anchor","middle").text("Frequency of Epic Size"),o.selectAll("rect").data(c).enter().append("rect").attr("class","bar").attr("x",1).attr("transform",function(t){return"translate("+s(t.x0)+","+d(t.length)+")"}).attr("width",function(t){return s(t.x1)-s(t.x0)-1}).attr("height",function(t){return l-d(t.length)}).style("fill","white").style("opacity",.3);var h=d3.area().x(t=>s(t.x0)+(s(t.x1)-s(t.x0))/2).y0(d(0)).y1(t=>d(t.length)),p=o.append("path").data([c]).attr("class","path").attr("id","areachart").attr("clip-path","url(#clip)").attr("d",h).style("stroke-width","2px").style("stroke","#FDBB32").style("fill","#FDBB32").style("fill-opacity",.2),y=o.append("g").attr("class","mouse-over-effects");y.append("line").attr("class","mouse-line").style("stroke-width","1px").style("opacity","0"),y.append("circle").attr("id","circle").attr("class","hoverCircle").attr("r",7).style("stroke-width","1px").style("opacity","0");y.append("rect").attr("width",r).attr("height",l).attr("fill","none").attr("pointer-events","all").on("mouseout",function(){d3.selectAll(".hoverCircle").transition().style("opacity","0"),d3.selectAll(".hoverBackground").transition().style("opacity","0"),d3.selectAll(".hoverText").transition().style("opacity","0"),d3.select("#areachart").transition().style("opacity","0"),n.transition().style("visibility","hidden"),d3.selectAll(".bar").transition().style("opacity",.3)}).on("mouseover",function(){d3.selectAll(".hoverCircle").transition().style("opacity","1"),d3.selectAll(".hoverBackground").transition().style("opacity","1"),d3.selectAll(".hoverText").transition().style("opacity","1"),d3.select("#areachart").transition().style("opacity","1"),d3.selectAll(".bar").transition().style("opacity",.1)}).on("mousemove",function(){!function(t,r){var o=document.getElementById("chart").offsetLeft,c=p.node(),d=c.getTotalLength(),h=d3.bisector(t=>t.x1).right;d3.selectAll(".mouse-line").attr("x1",t[0]).attr("x2",t[0]).attr("y1",l).attr("y2",0),d3.select("#clip").select("rect").attr("width",t[0]);var y=d3.event.pageX-o-a.left-14,u=r[h(r,s.invert(y))],x=h(r,s.invert(y)),m=d3.sum(r.slice(0,x+1),t=>t.length);for(i=y;i<d;i+=1){var v=c.getPointAtLength(i);if(v.x>=y)break}d3.select("#circle").style("fill","white").style("opacity",1).attr("cx",y).attr("cy",v.y);var w=d3.mouse(f.node());g.x=window.scrollX,g.y=window.scrollY,n.style("right",""),n.style("left",""),n.style("bottom",""),n.style("top",""),n.html("<p id='heading'><span style='color:#FDBB32;'> "+m+" Epics </span>(or "+d3.format(".0%")(m/e.length)+" of the "+e.length+" Epics recorded) <span style='color:#FDBB32;'><br>hold "+u.x1+" User Stories </span>or less within them.</p>"),n.style("height",$("#heading").height()),w[0],g.x,g.w,n.style("left",y+a.left+15+"px");w[1],g.y,g.h,n.style("top",v.y-$("#tooltip").height()-15+"px");n.style("visibility","visible")}(d3.mouse(this),c)}),o.append("clipPath").attr("id","clip").append("rect").attr("x",0).attr("y",0).attr("width",r).attr("height",l);var f=d3.select("svg"),g={x:window.scrollX,y:window.scrollY,w:window.innerWidth,h:window.innerHeight},u=d3.select("#chart");u.node().offsetWidth,u.node().offsetHeight,document.width,document.height,function(t){for(var e=d3.select("body").node(),a=0,r=0;null!=t&&t!=e;a+=t.offsetLeft||t.clientLeft,r+=t.offsetTop||t.clientTop,t=t.offsetParent||t.parentNode);}(f.node())});