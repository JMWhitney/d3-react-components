import { 
  select,
  selectAll,
  scaleLinear,
  max,
  min,
  axisLeft,
  axisBottom,
  timeDay,
  scaleTime,
  event,
  line,
  area,
  curveMonotoneX,
  mouse,
  brushX,
  zoom,
  zoomIdentity,
  zoomTransform,
} from 'd3';
import * as ease from 'd3-ease';
import React from 'react';
import propTypes from 'prop-types';
import Chart from './Chart';

const renderXGridLines = (container, innerHeight, semanticXScale, numTicks) => { 
  // Remove gridlines if they exist
  if(container.select('.grid-x')) container.select('.grid-x').remove();

  // Update

  // render x gridlines and return a reference to them
  return container.append('g')
  .attr('class', 'grid-x')
  .attr('transform', `translate(0, ${innerHeight})`)
  .call(
    axisBottom(semanticXScale)
      .ticks(numTicks)
      .tickSize(-innerHeight)
      .tickFormat('')
  );
}

const renderXLabel = (container, innerHeight, semanticXScale, numTicks) => {
  // Remove label if it currently exists.
  if(container.select('.chart-x-label')) container.select('.chart-x-label').remove();

  const xAxis = 
  axisBottom(semanticXScale)
    .ticks(numTicks);

  const xLabel = 
  container.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .classed('chart-x-label', true)
    .call(xAxis);

    // console.log(semanticXScale);
}

const renderYLabel = (container, yAxis) => {
  // Remove y label if it exists
  if(container.select('.chart-x-label')) container.select('.chart-x-label').remove();

  const yLabel = 
  container.append('g')
    .classed('chart-y-label', true)
    .call(yAxis);
}

const renderYGridLines = (container, innerWidth, geometricYScale, numTicks) => {
  // Remove gridlines if they exist
  if(container.select('.grid-y')) container.select('.grid-y').remove();

  return container.append('g')
      .attr('class', 'grid-y')
      .call(
        axisLeft(geometricYScale)
          .ticks(numTicks)
          .tickSize(-innerWidth)
          .tickFormat('')
        )
}

const renderPlot = (container, innerWidth, innerHeight, semanticXScale, yScale, data) => {

  // Remove plot if it already exists
  if(container.select('.chart-graph-container')) container.select('.chart-graph-container').remove();

  const curve = 
  area()
    .x((d) => semanticXScale(d.x))
    .y1((d) => yScale(d.y))
    .y0( yScale(0) )
    .curve(curveMonotoneX);

  // Draw graph curve
  const graph = 
  container.append('svg')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .append('g')
      .classed('chart-graph-container', true)

  const plot = 
    graph.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', curve)
      .style('fill', 'lightblue')
      .style('stroke', 'black')
      .classed('chart-curve', true);
    
  // Draw dots
  const dots =
  graph.selectAll('.dot')
    .data(data)
  .enter().append('circle')
    .attr('class', 'dot')
    .attr('cx', (d) => semanticXScale(d.x))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', 4)
    .style('fill', 'steelblue')
}

const attachToolTip = (container) => {
  // Remove tooltip if it exists
  if(container.select('.chart-tool-tip')) container.select('.chart-tool-tip').remove();

  // Reference to the group element that contains the tooltip
  const self = 
  container.append('g')
    .attr('opacity', 0)
    .classed('chart-tool-tip', true);

  // The circle that encloses the point hovered point on the graph
  const circle =
  self.append('circle')
    .style('fill', 'none')
    .attr('stroke', 'black')
    .attr('r', 8.5)
    .classed('chart-tool-tip-circle', true);

  // The background for the tooltip's text
  const rect = 
  self.append('rect')
    .attr('fill', 'white')
    .attr('height', 27)
    .attr('stroke', 'black')
    .attr('opacity', 0.8)
    .classed('chart-tool-tip-background', true);
  
  // The text that displays the data value
  const text =   
  self.append('text')
    .attr('text-anchor', 'left')
    .attr('alignment-baseline', 'middle')
    .style('fill', 'black')
    .classed('chart-tool-tip-text', true)

  return { self: self, circle: circle, rect: rect, text: text }
}

const renderChart = (svgRef, data) => {
  try {
    select(svgRef.firstChild).remove()
  } 
  catch (error) {
    console.error(error)
  }

  const svg = select(svgRef);
  let width = svg.node().getBoundingClientRect().width;
  let height = svg.node().getBoundingClientRect().height;
  const margin = { top: 20, right: 20, bottom: 30, left: 30 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const maxY = max(data, (d) => d.y);
  const minY = min(data, (d) => d.y);
  const numTicks = 10;
  
  const d3Zoom = 
  zoom()
    .scaleExtent([1, data.length])
    .translateExtent([[0, 0], [innerWidth, innerHeight]])
    .extent([[0, 0], [innerWidth, innerHeight]])
    .on("zoom", zoomed);

  const d3Brush = 
  brushX()
    .extent([ [0, 0], [innerWidth, innerHeight] ])
    .on('end', brushed)

  const initialGeometricXScale = 
  scaleLinear()
    .domain([0, data.length -1])
    .range([0, innerWidth + margin.right + margin.left])

  let currentGeometricXScale = 
  initialGeometricXScale.copy();

  const initialSemanticXScale = 
  scaleTime()
    .domain([ data[0].x, data[data.length - 1].x ])
    .range([0, width]);

  let currentSemanticXScale = 
  initialSemanticXScale.copy();
    
  const yScale =
  scaleLinear()
  .domain([minY, maxY])
  .range([innerHeight, 0])
    
  const yAxis = 
  axisLeft(yScale)
    .ticks(numTicks);
  
  const container = 
  svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .classed('chart-container', true);

  renderYGridLines(container, innerWidth, yScale, numTicks);
  renderXGridLines(container, innerHeight, currentSemanticXScale, numTicks);
  renderYLabel(container, yAxis);
  renderXLabel(container, innerHeight, currentSemanticXScale, numTicks);
  renderPlot(container, innerWidth, innerHeight, currentSemanticXScale, yScale, data);
  let toolTip = attachToolTip(container);

  
  const focusArea =
  container
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout)
    .call(d3Brush)
    .call(d3Zoom);

  function mouseover() {
    toolTip.self.style("opacity", 1)
  }

  function mousemove() {
    // Convert mouse position to data index based on the geometric scale
    const i = Math.round(currentGeometricXScale.invert(mouse(this)[0]));
    const selectedPoint = data[i];

    // Handle out of bounds errors
    if(!selectedPoint) return;
    
    // Obtain information about the location of the current point
    const xPos = currentSemanticXScale(selectedPoint.x);
    const yPos = yScale(selectedPoint.y);
    const width = toolTip.text._groups[0][0].textLength.baseVal.value
    const widthOffset = 
      xPos < innerWidth/2 ? 15 : -15 - width

    // Update the information and location of the tool tip
    toolTip.self
      .transition().duration(25)
      .attr('transform', `translate(${xPos}, ${yPos})`)

    toolTip.rect
      .attr('width', width + 10)
      .attr('x', widthOffset)
      .attr('y', -1 * toolTip.rect.attr('height')/2)

    toolTip.text
      .text(selectedPoint.y)
      .attr('x', widthOffset);
  }

  function mouseout() {
    toolTip.self.style("opacity", 0)
  }

  function zoomed() {
    if(event.sourceEvent && event.sourceEvent.type === 'end') return; //ignore zoom-by-brush
    // Alias the zoom transformation
    const transform = event.transform;

    // Update chart scaling information based on the transform
    currentGeometricXScale = transform.rescaleX(initialGeometricXScale);
    currentSemanticXScale = transform.rescaleX(initialSemanticXScale);

    // Rerender necessary components
    renderXGridLines(container, innerHeight, currentSemanticXScale, numTicks);
    renderXLabel(container, innerHeight, currentSemanticXScale, numTicks);
    renderPlot(container, innerWidth, innerHeight, currentSemanticXScale, yScale, data);
    toolTip = attachToolTip(container);

    container.call(d3Brush.move, initialGeometricXScale.range().map(transform.invertX, transform));
    
  }

  function brushed() {
    if(event.sourceEvent && event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
    const selection = event.selection;
    if(!selection) return;

    // currentSemanticXScale
    //   .domain(
    //     selection.map(initialSemanticXScale.invert, initialSemanticXScale)
    //   );
    // currentGeometricXScale
    //   .domain(
    //     selection.map(initialGeometricXScale.invert, initialGeometricXScale)
    //   );

    renderXGridLines(container, innerHeight, currentSemanticXScale, numTicks);
    renderXLabel(container, innerHeight, currentSemanticXScale, numTicks);
    renderPlot(container, innerWidth, innerHeight, currentSemanticXScale, yScale, data);
    toolTip = attachToolTip(container);


    console.log('brush')
    container.call(d3Zoom.transform, zoomIdentity
      .scale((innerWidth - margin.left - margin.right) / (selection[1] - selection[0]))
      .translate(-selection[0], 0));

  }
}

const LineChart = (props) => <Chart data={props.data} renderChart={renderChart} />

LineChart.propTypes = {
  data: propTypes.arrayOf(propTypes.shape({
    x: propTypes.object,
    y: propTypes.number
  })),

}

export default LineChart;