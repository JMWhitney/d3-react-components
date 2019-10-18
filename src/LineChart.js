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
  curveMonotoneX
} from 'd3';
import React, { useEffect } from 'react';
import propTypes from 'prop-types';
import Chart from './Chart';

const renderChart = (svgRef, data) => {
  console.log(data);
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
  const minY = min(data, (d) => d.y)

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
    .x( (d, i) => xScale(i))
    .y1( (d) => yScale(d.y))
    .y0( yScale(0) )
    .curve(curveMonotoneX);
  
  const container = 
  svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  container.append('svg')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', curve)
    
  container.selectAll('.dot')
    .data(data)
  .enter().append('circle')
    .attr('class', 'dot')
    .attr('cx', (d, i) => xScale(i))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', 3)
    
  const xLabel = 
  container.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis);

  const yLabel = 
  container.append('g')
    .call(yAxis);

}

const LineChart = (props) => <Chart data={props.data} renderChart={renderChart} />

LineChart.propTypes = {
  data: propTypes.arrayOf(propTypes.shape({
    x: propTypes.object,
    y: propTypes.number
  })),
}

export default LineChart;

