/*************************************************************************
 * Global Foundries
 *
 *************************************************************************
 *
 * @description
 * Java script util to draw Org Chart 
 * user Jquery APIs and D3,js
 * @author
 * Nuthan Kumar
 *
 *************************************************************************/

/****************************************
 * Function to wrap text under image ..
 ***************************************/
function wrap(text, width) {
	text
			.each(function() {
				var text = d3.select(this), words = d3.select(this).text()
						.split(/\s+/).reverse(), word, line = [], lineNumber = 0, lineHeight = 1.1, // ems
				x = text.attr("x"), y = text.attr("y"), dy = 0, //parseFloat(text.attr("dy")),
				tspan = text.text(null).append("tspan").attr("x", x).attr("y",
						y).attr("dy", dy + "em");
				while (word = words.pop()) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node().getComputedTextLength() > width) {
						line.pop();
						tspan.text(line.join(" "));
						line = [ word ];
						tspan = text.append("tspan").attr("x", x).attr("y", y)
								.attr("dy",
										++lineNumber * lineHeight + dy + "em")
								.text(word);
					}
				}
			});
}

function getSize(d) {
	var bbox = this.getBBox(), cbbox = this.parentNode.getBBox(), scale = Math
			.min(cbbox.width / bbox.width, cbbox.height / bbox.height);
	
	d.scale = scale;
}

function update(source) {

	var margin = {
		top : 20,
		right : 20,
		bottom : 20,
		left : 420
	}, width = 960 - margin.right - margin.left, height = 500 - margin.top
			- margin.bottom;

	var i = 0;

	/*var tree = d3.layout.tree()
	 .size([height, width]);*/

	// for horizontal
	//var diagonal = d3.svg.diagonal()
	//.projection(function(d) { return [d.y, d.x]; });
	
	
	// for verticle
	var diagonal = d3.svg.diagonal().projection(function(d) {
		return [ d.x, d.y ];
	});

	//calculate child count

	
    
	var levelWidth = [ 1 ];
	var childCount = function(level, n) {

		if (n.children && n.children.length > 0) {
			if (levelWidth.length <= level + 1)
				levelWidth.push(0);

			levelWidth[level + 1] += n.children.length;
			n.children.forEach(function(d) {
				childCount(level + 1, d);
			});
		}
	};
	childCount(0, source);
	var newWidth = 100 + d3.max(levelWidth) * 55;
	var newHeight = levelWidth.length * 160
	//var tree = d3.layout.tree().size([newHeight, newWidth]);
	// calculate left new offset -- to show huge chart
	
	var newleftOffset = 0;
	
	
	if(d3.max(levelWidth) >10 && d3.max(levelWidth) <=40)
	{
		newleftOffset = (d3.max(levelWidth) -10) * 17;
	} else if(d3.max(levelWidth) > 40)
	{
		newleftOffset = (d3.max(levelWidth) -10) * 6;
	}
	var tree = d3.layout.tree().nodeSize([ 70, 60 ]);
	
	
    
	var svg = d3.select("#orgChart").append("svg").attr("width",
			newWidth + margin.right + margin.left).attr("height",
			newHeight + margin.top + margin.bottom).append("g").attr(
			"transform", "translate(" + (margin.left +newleftOffset) + "," + margin.top + ")");
			//.call(zoomListener);;

	/*function zoom() {
		svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);*/
    
	// Compute the new tree layout.
	var nodes = tree.nodes(source).reverse(), links = tree.links(nodes);

	// Normalize for fixed-depth.
	/*nodes.forEach(function(d) {
		d.y = d.depth * 100;
	});*/

	// Normalize for variable-depth.
	nodes.forEach(function(d) {
		d.y = d.depth * 100;
		/*if (d.parent != null) {
			d.x = d.parent.x - (d.parent.children.length - 1) * 30 / 2
					+ (d.parent.children.indexOf(d)) * 30;
		}*/
		// if the node has too many children, go in and fix their positions to two columns.
		if (d.children != null && d.children.length > 40) {
			d.children.forEach(function(d, i) {
				d.y = (d.depth * 100 + i % 3 * 100);
				d.x =  d.parent.x - (d.parent.children.length-1)*30/4
				+ (d.parent.children.indexOf(d))*50/2 - i % 2 * 15;
			});
		} else if (d.children != null && d.children.length > 18) {
			d.children.forEach(function(d, i) {
				d.y = (d.depth * 100 + i % 2 * 100);
				d.x =  d.parent.x - (d.parent.children.length-1)*30/4
				+ (d.parent.children.indexOf(d))*70/2 - i % 2 * 15;
			});
		}
	});

	// Declare the nodes…
	var node = svg.selectAll("g.node").data(nodes, function(d) {
		return d.id || (d.id = ++i);
	});

	// Enter the nodes.
	var nodeEnter = node.enter().append("g").attr("email", function(d) {
		return d.primaryEmail;
	}).attr("class", "node").attr("transform", function(d) {
		// for verticle
		return "translate(" + d.x + "," + d.y + ")";
	});

	// for horizontal
	//return "translate(" + d.y + "," + d.x + ")"; });

	nodeEnter.append("image").attr("xlink:href", function(d) {
		if (d.thumbnailPhotoUrl)
			return d.thumbnailPhotoUrl;
		else
			return 'img/image_not_found.jpg';
	}).attr("x", "-12px").attr("y", "-12px").attr("width", "38px").attr(
			"height", "38px");

	nodeEnter.append("text").attr("x", function(d) {
		return d.children || d._children ? (15) * -1 : -15
	}).attr("y", function(d) {
		return d.children || d._children ? (0) : +35
	}).attr("dy", ".35em").attr("fill", "blue").attr("style",
			"font-weight: bold;").attr("text-anchor", function(d) {
		return d.children || d._children ? "end" : "start";
	}).text(function(d) {
		return d.name.fullName;
	}).style("fill-opacity", 1).call(wrap, 60); // wrap the text in <= 30 pixels

	//.each(getSize).style("font-size", function(d) {
	//return d.scale + "px";
	//});

	nodeEnter.append("text").attr("x", function(d) {
		return d.children || d._children ? (15) * -1 : -15
	})
	//.attr("y", "28px")
	.attr("y", function(d) {
		//return d.children || d._children ? (30) : +65
		return d.children || d._children ? (15) : +50
	}).attr("dy", ".35em").attr("text-anchor", function(d) {
		return d.children || d._children ? "end" : "start";
	}).text(function(d) {
		return d.addresses[0].locality
	}).style("fill-opacity", .6);

	// Declare the links…
	var link = svg.selectAll("path.link").data(links, function(d) {
		return d.target.id;
	});

	// Enter the links.
	link.enter().insert("path", "g").attr("class", "link").style("stroke",
			function(d) {
				return d.target.level;
			}).attr("d", diagonal);

	svg.selectAll("g.node").on("click", function() {
		//console.log(d3.select(this).attr("email"));
		advSearchRequest(d3.select(this).attr("email"));
		// invoke new server request to load user
	});

	// attch context menu
	contextMenuShowing = false;

	d3.selectAll("g.node").on('contextmenu',function (e) {
		console.log(e);
		d3.event.preventDefault();
		if(contextMenuShowing) {
	        d3.select(".contextpopup").remove();
	        contextMenuShowing = false;
	    } 
		//d3_target = d3.select(d3.event.target);
		
		
	    contextMenuShowing = true;
	    d = d3.select(this);
	    
	    // getting mail ids
	    mailIds = [d.attr("email")]
	    var childMailIds = function(n) {
	    	if(d.attr("email") === n.primaryEmail && n.children)
	    	{
	    		n.children.forEach(function(d) {
	    			mailIds.push( d.primaryEmail);
				});
	    		return;
	    	} else if(n.children) {
				n.children.forEach(function(d) {
					childMailIds(d);
				});
			}
		};
		childMailIds(source);	    
	    canvas = d3.select("#orgChart");
	  
	   
	
	    popup = canvas.append("div")
	        .attr("class", "contextpopup")
	        .attr("id", "contextpopup")
	        .style("left", (d3.event.pageX-300) + "px")
	        .style("top",(d3.event.pageY-100) + "px");
	    popup.append("span")
	    	.attr("class", "label label-primary")
	    	.style("float", "left")
	    	.append("a")
	    	 .attr('href','mailto:'+mailIds.join())
	    	 .text('Mail To');
	    popup.append("span")
    		.attr("class", "label label-primary")
    		.style("float", "right")
	    	.append("a")
		   	 .attr('id','copyClip')
		   	 .attr('href','#')
		   	 .on('click', function(event) {  
			   	  var s =  $('#copyText').text();  
			   	  window.prompt("Copy to clipboard: Ctrl+C, Enter", s);
			  })
		   	 .text('Clipboard Copy');
	    
	    popup.append("textarea")
	    	 .style("display", "none")
		   	 .attr('id','copyText')
		   	 .text(mailIds.join());
		   	 
	   
	   // attache event to close div tags
	    
	    $(document).mouseup(function (e)
	    		{
	    		    var container = $("#contextpopup");

	    		    if (!container.is(e.target) // if the target of the click isn't the container...
	    		        && container.has(e.target).length === 0) // ... nor a descendant of the container
	    		    {
	    		        container.remove();
	    		    }
	    		});
	    
	    
	});

	


}