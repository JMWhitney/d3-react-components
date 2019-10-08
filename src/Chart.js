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
  event 
} from 'd3';
import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import responsivefy from './util/responsify';

const renderChart = (data, id, forceUpdate) => {
  try {
    select(`#${id} g`).remove()
    selectAll(`.chart_tooltip`).remove()
  } 
  catch (error) {
    console.error(error)
  }
  const svg = select(`#${id}`)//.call(responsivefy);
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

  const xAxisValues = scaleTime()
  .domain([ data.x[0], data.x[data.x.length - 1] ])
  .range([0, width]);

  const xAxis = 
  axisBottom(xAxisValues)
    .ticks(timeDay.every(parseInt(data.x.length / 5)));

  const yScale = scaleLinear()
  .domain([0, max(data.y)])
  .range([0, innerHeight]);

  const yAxis = axisLeft(yScale);

  const tooltip = 
  select('body')
    .append('div')
    .attr('class', 'chart_tooltip')
    .style('position', 'absolute')
    .style('padding', '0 10px')
    .style('background', 'white')
    .style('opacity', 0);

  const container =
  svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)
    
  const entries = 
  container.selectAll('rect').data(data.y)
      .enter().append('rect')
        .attr('width', d => xScale.bandwidth())
        .attr('height', d => yScale(d))
        .attr('x', d => xScale(d))
        .attr('y', d => innerHeight - yScale(d))
  
  entries.on('mouseover', function(d) {
    tooltip.transition().duration(200)
      .style('opacity', .9)
    tooltip.html(
        '<div style="font-size: 1rem; font-weight: bold;">'
          + d + 
        '</div>'
      )
      .style('left', (event.pageX -35) + 'px')
      .style('top', (event.pageY -30) + 'px')
  })
  .on('mouseout', function(d) {
    tooltip.html('');
  });
  
  const xLabel = 
  container.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis);

  const yLabel = 
  container.append('g')
    .call(yAxis);

  select(window).on(
    'resize.' + id, 
    forceUpdate
  );
}

const Chart = (props) => {

  const [, updateState] = useState();
  const forceUpdate = () => updateState({});

  useEffect(() => renderChart(props.data, props._id, forceUpdate))

  return <svg height="100%" width="100%" id={props._id}></svg>
  
}

Chart.propTypes = {
  data: propTypes.shape({
    x: propTypes.array.isRequired,
    y: propTypes.array.isRequired
  }),
  _id: propTypes.string.isRequired
}

export default Chart;