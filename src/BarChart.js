import { 
  select,
  selectAll,
  scaleLinear,
  scaleBand,
  max,
  axisLeft,
  axisBottom,
  timeDay,
  scaleTime,
  event,
} from 'd3';
import React from 'react';
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

  const xScale = 
  scaleBand()
    .domain(data.y)
    .paddingInner(.05)
    .paddingOuter(.05)
    .range([0, innerWidth]);

  const xAxisValues = 
  scaleTime()
    .domain([ data.x[0], data.x[data.x.length - 1] ])
    .range([0, width]);

  const xAxis = 
  axisBottom(xAxisValues)
    .ticks(timeDay.every(parseInt(data.x.length / 5)));

  const yScale = scaleLinear()
  .domain([0, max(data.y)])
  .range([0, innerHeight]);

  const yAxis = axisLeft(yScale);

  const container =
  svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

  const entries = 
  container.selectAll('rect').data(data.y)
      .enter().append('rect')
        .attr('class', 'data-entry')
        .attr('width', d => xScale.bandwidth())
        .attr('height', d => yScale(d))
        .attr('x', d => xScale(d))
        .attr('y', d => innerHeight - yScale(d))
  
  entries.on('mouseover', function(d) {
    tooltip.transition().duration(200)
      .style('opacity', .9)
    tooltip.text(d)
      .attr('x', xScale(d) <= innerWidth/2 ? event.x + 50 : event.x - 50 )
      .attr('y', event.y)
  })
  .on('mouseout', function(d) {
    tooltip.text(null);
  });
  
  const xLabel = 
  container.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis);

  const yLabel = 
  container.append('g')
    .call(yAxis);

  const tooltip = 
  container
    .append('text')
    .attr('class', 'chart_tooltip')
    .attr('fill', 'white')
    .style('opacity', 0);
}

const BarChart = (props) => <Chart data={props.data} renderChart={renderChart} />

export default BarChart;
