const dscc = require('@google/dscc');
const d3 = window.d3;

// Define width and height
const width = 600;
const height = 400;

// Create SVG element
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Define the force simulation
const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(d => d.id).distance(50))
  .force("charge", d3.forceManyBody().strength(-100))
  .force("center", d3.forceCenter(width / 2, height / 2));

dscc.subscribeToData(message => {
  const data = message.tables.DEFAULT;

  // Process nodes and links from Looker Studio data
  const nodes = data.map(d => ({ id: d.dimensions[0] }));
  const links = data.map(d => ({
    source: d.dimensions[0],
    target: d.dimensions[1]
  }));

  // Remove old elements
  svg.selectAll("*").remove();

  // Create link elements
  const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke-width", 2)
    .attr("stroke", "#999");

  // Create node elements
  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", 5)
    .attr("fill", "#69b3a2")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  // Add labels
  const label = svg.append("g")
    .selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(d => d.id);

  // Update simulation nodes and links
  simulation.nodes(nodes).on("tick", ticked);
  simulation.force("link").links(links);

  // Tick function
  function ticked() {
    link.attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node.attr("cx", d => d.x)
      .attr("cy", d => d.y);

    label.attr("x", d => d.x + 5)
      .attr("y", d => d.y + 5);
  }

  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
});
