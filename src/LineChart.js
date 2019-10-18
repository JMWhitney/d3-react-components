import { 
  select,
  selectAll,
  scaleLinear,
  scaleBand,
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
  bisector,
  mouse
} from 'd3';
import React, { useEffect } from 'react';
import propTypes from 'prop-types';
import Chart from './Chart';

const renderChart = (svgRef, data) => {
  try {
    select(svgRef.firstChild).remove()
    selectAll(`.chart_tooltip`).remove()
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
  const bisect = bisector((d) => d.x).left;

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
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Draw graph curve
  container.append('svg')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', curve)
    
  // Draw dots
  const dots =
  container.selectAll('.dot')
    .data(data)
  .enter().append('circle')
    .attr('class', 'dot')
    .attr('cx', (d, i) => xScale(i))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', 3)
    .attr('width', 8)
    .attr('height', 8)
    
  const xLabel = 
  container.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis);

  const yLabel = 
  container.append('g')
    .call(yAxis);

  const focus = 
  container.append('g')
    .append('circle')
    .style('fill', 'none')
    .attr('stroke', 'black')
    .attr('r', 8.5)
    .style('opacity', 0);

  const focusText = 
  container.append('g')
    .append('text')
    .style('opacity', 0)
    .attr('text-anchor', 'left')
    .attr('alignment-baseline', 'middle');

  const focusArea =
  container.append('rect')
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

  function mouseover() {
    focus.style("opacity", 1)
    focusText.style("opacity",1)
  }

  function mousemove() {
    // recover coordinate we need
    const i = parseInt(xScale.invert(mouse(this)[0]));
    const selectedData = data[i];
    
    console.log(parseInt(i));

    focus
      .attr("cx", xScale(i))
      .attr("cy", yScale(selectedData.y))
    focusText
      .html(selectedData.y)
      .attr("x", xScale(i)+15)
      .attr("y", yScale(selectedData.y))
    }
  function mouseout() {
    focus.style("opacity", 0)
    focusText.style("opacity", 0)
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

