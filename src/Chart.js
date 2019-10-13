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
import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import propTypes from 'prop-types';
import debounce from './util/debounce';

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
        .attr('class', 'data-entry')
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

}
  
const Chart = (props) => {
  
  const [, update] = useState();
  const forceUpdate = () =>  update({});
  const debounceRender = debounce(forceUpdate, 250);
  const svgRef = useRef(null);

  useEffect(() => {
    renderChart(svgRef.current, props.data)
  })
  
  useLayoutEffect(() => {
    window.onresize = debounceRender;

    //This function will get called before the hook unmounts
    return () => window.onresize = null;
    
  }, [props.data]);

  return <svg className="svg-content-responsive" ref={svgRef} height="100%" width="100%"></svg>
}

Chart.propTypes = {
  data: propTypes.shape({
    x: propTypes.array.isRequired,
    y: propTypes.array.isRequired
  }),
}

export default Chart;