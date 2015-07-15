/**
 * 
 */



function update(source) {
	
	
	var margin = {top: 20, right: 20, bottom: 20, left: 420},
	width = 960 - margin.right - margin.left,
	height = 500 - margin.top - margin.bottom;
	
var i = 0;

/*var tree = d3.layout.tree()
	.size([height, width]);*/

// for horizontal
//var diagonal = d3.svg.diagonal()
	//.projection(function(d) { return [d.y, d.x]; });

// for verticle
var diagonal = d3.svg.diagonal()
.projection(function(d) { return [d.x, d.y]; });



//calculate child count

var levelWidth = [1];
var childCount = function(level, n) {

  if(n.children && n.children.length > 0) {
    if(levelWidth.length <= level + 1) levelWidth.push(0);

    levelWidth[level+1] += n.children.length;
    n.children.forEach(function(d) {
      childCount(level + 1, d);
    });
  }
};
childCount(0, source);  
var newWidth = 100+d3.max(levelWidth) * 100; // 20 pixels per line
var newHeight = levelWidth.length * 160
//var tree = d3.layout.tree().size([newHeight, newWidth]);
var tree = d3.layout.tree().nodeSize([70, 60]);
console.log(newHeight);
console.log(newWidth);
console.log(levelWidth.length);

var svg = d3.select("#orgChart").append("svg")
	.attr("width", newWidth + margin.right + margin.left)
	.attr("height", newHeight + margin.top + margin.bottom)
  .append("g")
	.attr("transform", 
	      "translate(" + margin.left + "," + margin.top + ")");




  // Compute the new tree layout.
  var nodes = tree.nodes(source).reverse(),
	  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 100; });

  // Declare the nodes…
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter the nodes.
  var nodeEnter = node.enter().append("g")
  	  .attr("email", function(d) { 
		  return d.primaryEmail; })
	  .attr("class", "node")
	  .attr("transform", function(d) { 
		// for verticle
		  return "translate(" + d.x + "," + d.y + ")"; });

		  // for horizontal
		  //return "translate(" + d.y + "," + d.x + ")"; });

  nodeEnter.append("image")
      .attr("xlink:href", function(d) 
		  { if(d.thumbnailPhotoUrl) 
               return d.thumbnailPhotoUrl;
			else
				return 'img/image_not_found.jpg';})
      .attr("x", "-12px")
      .attr("y", "-12px")
      .attr("width", "38px")
      .attr("height", "38px");

  nodeEnter.append("text")
	  .attr("x", function(d) { 
		  return d.children || d._children ? 
		  (15) * -1 : -15 })
		.attr("y", function(d) { 
		  return d.children || d._children ? 
		  (0) : + 35 })
	  .attr("dy", ".35em")
	  .attr("fill", "blue")
	  .attr("style", "font-weight: bold;")
	  .attr("text-anchor", function(d) { 
		  return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { return d.name.fullName; })
	  .style("fill-opacity", 1);
	
	nodeEnter.append("text")
	  .attr("x", function(d) { 
		  return d.children || d._children ? 
		  (15) * -1 : -15 })
	.attr("y", function(d) { 
		  return d.children || d._children ? 
		  (15) : + 50 })
	  //.attr("y", "15px")
	  .attr("dy", ".35em")
	  .attr("text-anchor", function(d) { 
		  return d.children || d._children ? "end" : "middle"; })
	  .text(function(d) { return d.organizations[0].name})
	  .style("fill-opacity", .8);
	  
	nodeEnter.append("text")
	  .attr("x", function(d) { 
		  return d.children || d._children ? 
		  (15) * -1 : -15 })
	  //.attr("y", "28px")
	  .attr("y", function(d) { 
		  return d.children || d._children ? 
		  (30) : + 65 })
	  .attr("dy", ".35em")
	  .attr("text-anchor", function(d) { 
		  return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { return d.addresses[0].locality})
	  .style("fill-opacity", .6);

  // Declare the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });

  // Enter the links.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .style("stroke", function(d) { return d.target.level; })
	  .attr("d", diagonal);  
  
  
  svg.selectAll("g.node").on("click", function(){
      console.log(d3.select(this).attr("email"));
      advSearchRequest(d3.select(this).attr("email"));
      // invoke new server request to load user
  });
  
  // node seperation distance
  
  

}