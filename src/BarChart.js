import React, { useEffect } from 'react';
import { scaleLinear, scaleTime, scaleBand } from 'd3-scale'
import { select, selectAll, event, remove } from 'd3-selection';
import { max } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { timeDay } from 'd3-time';
import * as ease from 'd3-ease';
import { transition } from 'd3-transition';
import { zoom } from 'd3-zoom';
import propTypes from 'prop-types';

const drawChart = (d, _id) => {
  var margin = { top: 0, right: 0, bottom: 30, left: 20 },
      height = 400 - margin.top - margin.bottom,
      width = 600 - margin.left - margin.right,
      tempColor,
      yScale,
      yAxisValues,
      yAxisTicks,
      yGuide,
      xScale,
      xAxisValues,
      xAxisTicks,
      xGuide,
      colors,
      tooltip,
      myChart;

  yScale = scaleLinear()
    .domain([0, max(d.temperatures)])
    .range([0,height]);

  yAxisValues = scaleLinear()
    .domain([0, max(d.temperatures)])
    .range([height, 0])
  
  yAxisTicks = axisLeft(yAxisValues)
    .ticks(10);
  
  xScale = scaleBand()
    .domain(d.temperatures)
    .paddingInner(.1)
    .paddingOuter(.1)
    .range([0, width]);

  xAxisValues = scaleTime()
    .domain([ d.dates[0], d.dates[d.dates.length - 1] ])
    .range([0, width]);

  xAxisTicks = axisBottom(xAxisValues)
    .ticks(timeDay.every(parseInt(d.dates.length / 5)));
  
  colors = scaleLinear()
    .domain([ 0, 60, max(d.temperatures) ])
    .range(['#FFF', '#2D8BCF', '#DA3637']);
  
  tooltip = select('body')
              .append('div')
              .style('position', 'absolute')
              .style('padding', '0 10px')
              .style('background', 'white')
              .style('opacity', 0);
  
  select(`#${_id} svg`).remove(`#{_id} svg`);

  myChart = 
  select(`#${_id}`).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 
            'translate(' + margin.left + ',' + margin.right + ')'
          )
  .selectAll('rect').data(d.temperatures)
    .enter().append('rect')
      .attr('fill', colors)
      .attr('width', function(d) {
        return xScale.bandwidth();
      })
      .attr('height', 0)
      .attr('x', function(d) {
        return xScale(d);
      })
      .attr('y', height)
      .on('mouseover', function(d) {
        tooltip.transition().duration(200)
          .style('opacity', .9)
        tooltip.html(
            '<div style="font-size: 1rem; font-weight: bold;">'
              + d + 
            '</div>'
          )
          .style('left', (event.pageX -35) + 'px')
          .style('top', (event.pageY -30) + 'px')
        tempColor = this.style.fill;
        select(this)
          .style('fill', 'yellow')
      })
      .on('mouseout', function(d) {
        tooltip.html('');
        select(this)
          .style('fill', tempColor)
      });

  yGuide = select(`#${_id} svg`).append('g')
    .attr('transform', 'translate(20, 0)')
    .call(yAxisTicks);

  xGuide = select(`#${_id} svg`).append('g')
    .attr('transform', 'translate(20,' + height + ')')
    .call(xAxisTicks);
  
  myChart.transition()
    .attr('height', function(d) {
      return yScale(d);
    })
    .attr('y', function(d) {
      return height - yScale(d);
    })
    .delay(function(d, i) {
      return i * 10;
    })
    .duration(1000)
    .ease(ease.easeBackOut)

  };

function BarChart(props) {

  useEffect(() => {
    drawChart(props.data, props._id);
  })

  return (
    <div id={props._id} className="BarChart">

    </div>
  );
}

BarChart.propTypes = {
  data: propTypes.shape({
    temperatures: propTypes.array.isRequired,
    dates: propTypes.array.isRequired,
  }),
  _id: propTypes.string.isRequired
}

export default BarChart;
