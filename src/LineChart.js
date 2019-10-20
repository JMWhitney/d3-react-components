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
  brushX
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

  const xScale = 
  scaleLinear()
    .domain([0, data.length -1])
    .range([0, innerWidth])

  const xAxisValues = 
  scaleTime()
    .domain([ data[0].x, data[data.length - 1].x ])
    .range([0, width]);

  const xAxis = 
  axisBottom(xAxisValues)
    .ticks(timeDay.every(parseInt(data.length / 5)));

  const yScale =
  scaleLinear()
    .domain([minY, maxY])
    .range([innerHeight, 0])

  const yAxis = axisLeft(yScale);

  const curve = 
  area()
    .x((d, i) => xScale(i))
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
    .append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', curve)
      .style('fill', 'lightblue')
      .style('stroke', 'black')
      .classed('chart-curve', true);
    
  // Draw dots
  const dots =
  container.selectAll('.dot')
    .data(data)
  .enter().append('circle')
    .attr('class', 'dot')
    .attr('cx', (d, i) => xScale(i))
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
  
  // const toolTipLines = 
  // toolTip.append('rect')
  //   .attr('stroke', 'black')
  //   .attr('fill', 'none');

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
    const i = parseInt(xScale.invert(mouse(this)[0]));
    const selectedData = data[i];
    const xPos = xScale(i);
    const yPos = yScale(selectedData.y);
    const width = toolTipText._groups[0][0].textLength.baseVal.value
    const widthOffset = 
      xPos < innerWidth/2 ? 15 : -15 - width

    toolTip
      // .transition().duration(75)
      .attr('transform', `translate(${xPos}, ${yPos})`)

    toolTipRect
      .attr('width', width + 10)
      .attr('x', widthOffset)
      .attr('y', -1 * toolTipRect.attr('height')/2)

    toolTipText
      .text(selectedData.y)
      .attr('x', widthOffset);

    // toolTipLines
    //   .attr('width', xPos)
    //   .attr('x', -1 * xPos)
    //   .attr('height', innerHeight - yPos)
  }

  function mouseout() {
    toolTip.style("opacity", 0)
  }

  container
    .call(
      brushX()
        .extent([ [0, 0], [innerWidth, innerHeight] ])
    )
  
}

const LineChart = (props) => <Chart data={props.data} renderChart={renderChart} />

LineChart.propTypes = {
  data: propTypes.arrayOf(propTypes.shape({
    x: propTypes.object,
    y: propTypes.number
  })),
}

export default LineChart;

