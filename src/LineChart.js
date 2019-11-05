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
  zoomTransform
} from 'd3';
import React from 'react';
import propTypes from 'prop-types';
import Chart from './Chart';

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

  const initialGeometricXScale = 
  scaleLinear()
    .domain([0, data.length -1])
    .range([0, innerWidth])

  let currentGeometricXScale = 
  scaleLinear()
    .domain([0, data.length -1])
    .range([0, innerWidth])

  const initialSemanticXScale = 
  scaleTime()
    .domain([ data[0].x, data[data.length - 1].x ])
    .range([0, width]);

  let currentTimeXScale = 
  scaleTime()
    .domain([ data[0].x, data[data.length - 1].x ])
    .range([0, width]);


  const xAxis = 
  axisBottom(initialSemanticXScale)
    .ticks(timeDay.every(parseInt(data.length / 5)));

  const yScale =
  scaleLinear()
    .domain([minY, maxY])
    .range([innerHeight, 0])

  const yAxis = axisLeft(yScale);

  const d3Zoom = 
  zoom()
    .scaleExtent([1, 12])
    .translateExtent([[0, 0], [innerWidth, innerHeight]])
    .extent([[0, 0], [innerWidth, innerHeight]])
    .on("zoom", zoomed);

  const curve = 
  area()
    .x((d, i) => initialGeometricXScale(i))
    .y1((d) => yScale(d.y))
    .y0( yScale(0) )
    .curve(curveMonotoneX);
  
  const container = 
  svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .classed('chart-container', true);

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
    .attr('cx', (d, i) => initialGeometricXScale(i))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', 4)
    .style('fill', 'steelblue')
  
  const xLabel = 
  container.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .classed('chart-x-label', true)
    .call(xAxis);

  const yLabel = 
  container.append('g')
    .classed('chart-y-label', true)
    .call(yAxis);

  const toolTip = 
  container.append('g')
  .attr('opacity', 0)
  .classed('chart-tool-tip', true);

  const toolTipCircle =
  toolTip.append('circle')
  .style('fill', 'none')
  .attr('stroke', 'black')
  .attr('r', 8.5)
  .classed('chart-tool-tip-circle', true);

  const toolTipRect = 
  toolTip.append('rect')
    .attr('fill', 'white')
    .attr('height', 27)
    .attr('stroke', 'black')
    .attr('opacity', 0.8)
    .classed('chart-tool-tip-background', true);
  
  const toolTipText =   
  toolTip.append('text')
    .attr('text-anchor', 'left')
    .attr('alignment-baseline', 'middle')
    .style('fill', 'black')
    .classed('chart-tool-tip-text', true)
  
  const focusArea =
  container
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

  function mouseover() {
    toolTip.style("opacity", 1)
  }

  function mousemove() {
    const i = parseInt(currentGeometricXScale.invert(mouse(this)[0]));
    const selectedData = data[i];
    const xPos = currentTimeXScale(selectedData.x);
    const yPos = yScale(selectedData.y);
    const width = toolTipText._groups[0][0].textLength.baseVal.value
    const widthOffset = 
      xPos < innerWidth/2 ? 15 : -15 - width

    toolTip
      .transition().duration(25)
      .attr('transform', `translate(${xPos}, ${yPos})`)

    toolTipRect
      .attr('width', width + 10)
      .attr('x', widthOffset)
      .attr('y', -1 * toolTipRect.attr('height')/2)

    toolTipText
      .text(selectedData.y)
      .attr('x', widthOffset);
  }

  function mouseout() {
    toolTip.style("opacity", 0)
  }

  function zoomed() {
    const transform = event.transform;
    // graph.attr('transform', transform.toString());
    // currentXScale = transform.rescaleX(xScale);

    currentGeometricXScale = transform.rescaleX(initialGeometricXScale);
    currentTimeXScale = transform.rescaleX(initialSemanticXScale);
    // const updatedYScale = transform.rescaleY(yScale);
    xAxis.scale(currentTimeXScale); 
    xLabel.call(xAxis);

    // yAxis.scale(updatedYScale);
    // yLabel.call(yAxis);

    dots.attr('cx', (d, i) => currentTimeXScale(d.x));
    plot.attr('d', area()
    .x((d, i) => currentTimeXScale(d.x))
    .y1((d) => yScale(d.y))
    .y0( yScale(0) )
    .curve(curveMonotoneX))
  }

  function brushed() {

  }

  container
    .call(
      brushX()
        .extent([ [0, 0], [innerWidth, innerHeight] ])
        .on('end', brushed)
    )
  
  container.call(d3Zoom);
}

const LineChart = (props) => <Chart data={props.data} renderChart={renderChart} />

LineChart.propTypes = {
  data: propTypes.arrayOf(propTypes.shape({
    x: propTypes.object,
    y: propTypes.number
  })),
}

export default LineChart;