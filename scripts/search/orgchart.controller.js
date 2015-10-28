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
app = angular.module('search');

app.directive("orgChart", function($window) {
	return{
		restrict: "EA",
		scope: {
			data: '=',
			direction :'=',
			selecteduser :'=',
			buildhierarchy:'&'
		},
		template: "<svg width='50' height='200'></svg>",
		link: function(scope, elem, attrs){

			// variable definition
			var totalNodes,maxLabelLength;
			// variables for drag/drop
			var selectedNode = null;
			var draggingNode = null;
			// panning variables
			var panSpeed;
			var panBoundary; 
			// Misc. variables
			var i ;
			var duration;
			var root;

			// size of the diagram
			var viewerWidth ;
			var viewerHeight ;

			var tree;

			// define a d3 diagonal projection for use by the node paths later on.
			var diagonal ;

			var rawSvg=elem.find('svg');
			var baseSvg = d3.select(rawSvg[0]);
			var svgGroup;
			// function variables
			var wrap;
			var visit;
			var sortTree;
			var zoom;

			var exp = scope.data;
			//console.log(exp);
			scope.$watch('data', function (val) {
				if(!$.isEmptyObject(val))
					drawOrgChart();
			});
			
			

			function setChartParameters(){

				totalNodes = 0;
				maxLabelLength = 0;
				// variables for drag/drop
				selectedNode = null;
				draggingNode = null;
				// panning variables
				panSpeed = 200;
				panBoundary = 20; // Within 20px from edges will pan when dragging.
				// Misc. variables
				i = 0;
				duration = 750;
				// size of the diagram
				viewerWidth = $('#orgChart').width()-15;
				
				viewerHeight = $(document).height()-100;

				
				tree = d3.layout.tree()
				.size([viewerHeight, viewerWidth]);

			
				if(scope.direction ==='horizontal')
				{
					diagonal = d3.svg.diagonal()
					.projection(function(d) {
						return [ d.x, d.y ];
					});

				}else { 
					diagonal = d3.svg.diagonal()
					.projection(function(d) { 
						return [d.y, d.x]; 
					});					
				}


				wrap = function (text, width) {
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

				// A recursive helper function for performing some setup by walking through all nodes
				visit = function (parent, visitFn, childrenFn) {
					if (!parent) return;

					visitFn(parent);

					var children = childrenFn(parent);
					if (children) {
						var count = children.length;
						for (var i = 0; i < count; i++) {
							visit(children[i], visitFn, childrenFn);
						}
					}
				}
				
				// sort the tree according to the node names

				sortTree = function () {
					tree.sort(function(a, b) {
						return b.name.fullName.toLowerCase() < a.name.fullName.toLowerCase() ? 1 : -1;
					});
				}
				
				// Define the zoom function for the zoomable tree
				zoom = function () {
					svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
				}

			}



			function drawOrgChart() {

				setChartParameters();

				
				// Call visit function to establish maxLabelLength
				visit(scope.data, function(d) {
					totalNodes++;
					// Nuthan , get maxlable length only if node has chidren
					if(d.children)
					{
						maxLabelLength = Math.max(d.name.fullName.length, maxLabelLength);
					}
				}, function(d) {
					return d.children && d.children.length > 0 ? d.children : null;
				});

				// Sort the tree initially incase the JSON isn't in a sorted order.
				sortTree();

				// TODO: Pan function, can be better implemented.

				function pan(domNode, direction) {
					var speed = panSpeed;
					if (panTimer) {
						clearTimeout(panTimer);
						translateCoords = d3.transform(svgGroup.attr("transform"));
						if (direction == 'left' || direction == 'right') {
							translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
							translateY = translateCoords.translate[1];
						} else if (direction == 'up' || direction == 'down') {
							translateX = translateCoords.translate[0];
							translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
						}
						scaleX = translateCoords.scale[0];
						scaleY = translateCoords.scale[1];
						scale = zoomListener.scale();
						svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
						d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
						zoomListener.scale(zoomListener.scale());
						zoomListener.translate([translateX, translateY]);
						panTimer = setTimeout(function() {
							pan(domNode, speed, direction);
						}, 50);
					}
				}

				
				// define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
				var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

				function initiateDrag(d, domNode) {
					draggingNode = d;
					
					svgGroup.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
						if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
						else return -1; // a is the hovered element, bring "a" to the front
					});
					dragStarted = null;
				}
				
				
				baseSvg.selectAll('*').remove();
				
				
				// define the baseSvg, attaching a class for styling and the zoomListener
				baseSvg.attr("width", viewerWidth)
				.attr("height", viewerHeight)
				.attr("class", "overlay")
				.call(zoomListener);


				// Define the drag listeners for drag/drop behaviour of nodes.
				dragListener = d3.behavior.drag()
				.on("dragstart", function(d) {
					if (d == root) {
						return;
					}
					dragStarted = true;
					nodes = tree.nodes(d);
					d3.event.sourceEvent.stopPropagation();
					// it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
				})
				.on("drag", function(d) {
					if (d == root) {
						return;
					}
					if (dragStarted) {
						domNode = this;
						initiateDrag(d, domNode);
					}

					// get coords of mouseEvent relative to svg container to allow for panning
					relCoords = d3.mouse($('svg').get(0));
					if (relCoords[0] < panBoundary) {
						panTimer = true;
						pan(this, 'left');
					} else if (relCoords[0] > ($('svg').width() - panBoundary)) {

						panTimer = true;
						pan(this, 'right');
					} else if (relCoords[1] < panBoundary) {
						panTimer = true;
						pan(this, 'up');
					} else if (relCoords[1] > ($('svg').height() - panBoundary)) {
						panTimer = true;
						pan(this, 'down');
					} else {
						try {
							clearTimeout(panTimer);
						} catch (e) {

						}
					}

					d.x0 += d3.event.dy;
					d.y0 += d3.event.dx;
					var node = d3.select(this);
					node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
					updateTempConnector();
				}).on("dragend", function(d) {
					if (d == root) {
						return;
					}
					domNode = this;
					
					endDrag();
				});

				function endDrag() {
					selectedNode = null;
					
					updateTempConnector();
					if (draggingNode !== null) {
						update(root);
						centerNode(draggingNode);
						draggingNode = null;
					}
				}

				// Helper functions for collapsing and expanding nodes.

				function collapse(d) {
					if (d.children) {
						d._children = d.children;
						d._children.forEach(collapse);
						d.children = null;
					}
				}

				function expand(d) {
					if (d._children) {
						d.children = d._children;
						d.children.forEach(expand);
						d._children = null;
					}
				}

				var overCircle = function(d) {
					selectedNode = d;
					updateTempConnector();
				};
				var outCircle = function(d) {
					selectedNode = null;
					updateTempConnector();
				};

				// Function to update the temporary connector indicating dragging affiliation
				var updateTempConnector = function() {
					var data = [];
					if (draggingNode !== null && selectedNode !== null) {
						// have to flip the source coordinates since we did this for the existing connectors on the original tree
						data = [{
							source: {
								x: selectedNode.y0,
								y: selectedNode.x0
							},
							target: {
								x: draggingNode.y0,
								y: draggingNode.x0
							}
						}];
					}
					var link = svgGroup.selectAll(".templink").data(data);

					link.enter().append("path")
					.attr("class", "templink")
					.attr("d", d3.svg.diagonal())
					.attr('pointer-events', 'none');

					link.attr("d", d3.svg.diagonal());

					link.exit().remove();
				};

				// Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

				function centerNode(source) {
					scale = zoomListener.scale();
					x = -source.y0;
					y = -source.x0;
					x = x * scale + viewerWidth / 4;
					y = y * scale + viewerHeight / 2;
					d3.select('g').transition()
					.duration(duration)
					.attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
					zoomListener.scale(scale);
					zoomListener.translate([x, y]);
				}

				// Toggle children function

				function toggleChildren(d) {
					if (d.children) {
						d._children = d.children;
						d.children = null;
					} else if (d._children) {
						d.children = d._children;
						d._children = null;
					}
					return d;
				}

				// Toggle children on click.

				function click(d) {
					//if (d3.event.defaultPrevented) return; // click suppressed
					d = toggleChildren(d);
					//console.log(d);
					scope.selecteduser = d;
					scope.$apply(); 
					scope.buildhierarchy();
					//update(d);
					//centerNode(d);
				}

				function update(source) {
					// Compute the new height, function counts total children of root node and sets tree height accordingly.
					// This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
					// This makes the layout more consistent.
					var levelWidth = [1];
					var childCount = function(level, n) {

						if (n.children && n.children.length > 0) {
							if (levelWidth.length <= level + 1) levelWidth.push(0);

							levelWidth[level + 1] += n.children.length;
							n.children.forEach(function(d) {
								childCount(level + 1, d);
							});
						}
					};
					childCount(0, root);
					//viewerWidth = d3.max(3) * 25; // 25 pixels per line  
					//console.log(levelWidth);
					if(d3.max(levelWidth) > 15)
					{
						viewerHeight = d3.max(levelWidth) * 25; // 25 pixels per line
					} else {
						viewerHeight = d3.max(levelWidth) * 35; // 25 pixels per line
					}
					
					tree = tree.size([viewerHeight, viewerWidth]);

					// Compute the new tree layout.
					var nodes = tree.nodes(root).reverse(),
					links = tree.links(nodes);

					// Set widths between levels based on maxLabelLength.
					nodes.forEach(function(d) {
						d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
						// alternatively to keep a fixed scale one can set a fixed depth per level
						// Normalize for fixed-depth by commenting out below line
						// d.y = (d.depth * 500); //500px per level.
					});

					// Update the nodes…
					node = svgGroup.selectAll("g.node")
					.data(nodes, function(d) {
						return d.id || (d.id = ++i);
					});

					// Enter any new nodes at the parent's previous position.
					var nodeEnter = node.enter().append("g")
					.call(dragListener)
					.attr("class", "node")
					.attr("transform", function(d) {
						return "translate(" + source.y0 + "," + source.x0 + ")";
					})
					.on('click', click);

					nodeEnter.append("circle")
					.attr('class', 'nodeCircle')
					.attr("r", 0)
					.style("fill", function(d) {
						return d._children ? "lightsteelblue" : "#fff";
					});


					nodeEnter.append("svg:image")
					.attr('x',-12)
					.attr('y',-12)
					.attr('width', 20)
					.attr('height', 24)
					//.attr("xlink:href","/start/favicon.jpg")
					.attr('xlink:href', function(d) {
						return d.thumbnailPhotoUrl || '/img/image_not_found.jpg';
					});

					nodeEnter.append("text").attr("x", function(d) {
						return d.children || d._children ? -10 : 10;
					}).attr("y", function(d) {
						return -2;
					})
					.attr("dy", ".35em").attr("fill", "blue").attr("style",
					"font-weight: bold;").attr("text-anchor", function(d) {
						return d.children || d._children ? "end" : "start";
					}).text(function(d) {

						return d.name.fullName;
					}).style("fill-opacity", 1).call(wrap, 150); 


					nodeEnter.append("text").attr("x", function(d) {
						return d.children || d._children ? -10 : 10;
					}).attr("y", function(d) {
						return 5;
					})
					.attr("dy", ".35em").attr("text-anchor", function(d) {
						return d.children || d._children ? "end" : "start";
					}).text(function(d) {
						return d.addresses[0].locality
					}).style("fill-opacity", .6);




					// phantom node to give us mouseover in a radius around it
					nodeEnter.append("circle")
					.attr('class', 'ghostCircle')
					.attr("r", 30)
					.attr("opacity", 0.2) // change this to zero to hide the target area
					.style("fill", "red")
					.attr('pointer-events', 'mouseover')
					.on("mouseover", function(node) {
						overCircle(node);
					})
					.on("mouseout", function(node) {
						outCircle(node);
					});

					// Update the text to reflect whether node has children or not.

					// Change the circle fill depending on whether it has children and is collapsed
					node.select("circle.nodeCircle")
					.attr("r", 4.5)
					.style("fill", function(d) {
						return d._children ? "lightsteelblue" : "#fff";
					});

					// Transition nodes to their new position.
					var nodeUpdate = node.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(" + d.y + "," + d.x + ")";
					});

					// Fade the text in
					nodeUpdate.select("text")
					.style("fill-opacity", 1);

					// Transition exiting nodes to the parent's new position.
					var nodeExit = node.exit().transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(" + source.y + "," + source.x + ")";
					})
					.remove();

					nodeExit.select("circle")
					.attr("r", 0);

					nodeExit.select("text")
					.style("fill-opacity", 0);

					// Update the links…
					var link = svgGroup.selectAll("path.link")
					.data(links, function(d) {
						return d.target.id;
					});

					// Enter any new links at the parent's previous position.
					link.enter().insert("path", "g")
					.attr("class", "link")
					.attr("d", function(d) {
						var o = {
								x: source.x0,
								y: source.y0
						};
						return diagonal({
							source: o,
							target: o
						});
					});

					// Transition links to their new position.
					link.transition()
					.duration(duration)
					.attr("d", diagonal);

					// Transition exiting nodes to the parent's new position.
					link.exit().transition()
					.duration(duration)
					.attr("d", function(d) {
						var o = {
								x: source.x,
								y: source.y
						};
						return diagonal({
							source: o,
							target: o
						});
					})
					.remove();

					// Stash the old positions for transition.
					nodes.forEach(function(d) {
						d.x0 = d.x;
						d.y0 = d.y;
					});
					
					// context menu 
					
					contextMenuShowing = false;

					d3.selectAll("g.node").on('contextmenu',function (e) {
						d3.event.preventDefault();
						if(contextMenuShowing) {
					        d3.select(".contextpopup").remove();
					        contextMenuShowing = false;
					    } 
						d = d3.select(this);
						//console.log(d)
						
						c = d.selectAll("g.parentNode.childNodes.g")[0].parentNode.__data__.children
						console.log(c);
						
						if(c)
						{
							contextMenuShowing = true;
							// getting mail ids
						    mailIds = [d[0][0].__data__.primaryEmail]
						    var childMailIds = function(n) {
						    	 		n.forEach(function(d) {
						    			mailIds.push( d.primaryEmail);
									});
							};
							childMailIds(c);
							
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
							   	 .attr('id','copyClip')
							   	 .attr('href','#')
							   	 .on('click', function(event) {  
							   		var str = 'http://mail.google.com/mail/?view=cm&fs=1'+
							           '&to=' + mailIds.join(',') +
							            '&ui=1';
							            window.open(str,'_blank');
								  })
							   	 .text('Send Mail to group');
					    
						}
						// here
					    
					});
					
					
				}

				// Append a group which holds all nodes and which the zoom Listener can act upon.
				svgGroup = baseSvg.append("g");

				// Define the root
				root = scope.data;
				root.x0 = viewerHeight / 2;
				root.y0 = 0;

				// Layout the tree initially and center on the root node.
				update(root);
				centerNode(root);
				
				$(document).mouseup(function (e)
	    		{
	    		    var container = $("#contextpopup");

	    		    if (!container.is(e.target) // if the target of the click isn't the container...
	    		        && container.has(e.target).length === 0) // ... nor a descendant of the container
	    		    {
	    		        container.remove();
	    		    }
	    		});
				

			}
		}
	}
});
