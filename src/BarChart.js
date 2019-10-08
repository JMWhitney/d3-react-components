import React, { useEffect } from 'react';
import { scaleLinear, scaleTime, scaleBand } from 'd3-scale'
import { select, selectAll, event, remove } from 'd3-selection';
import { max } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { timeDay } from 'd3-time';
import * as ease from 'd3-ease';
import { transition } from 'd3-transition';
import { zoom } from 'd3-zoom';
import { brushX } from 'd3-brush';
import propTypes from 'prop-types';
import responsify from './util/responsify';

const drawChart = (d, _id) => {

  try {
    selectAll(`#${_id} g`).remove();
    select(`#chart_tooltip`).remove()
  } catch (error) {
    console.error(error);
  }

  var svg = select(`#${_id}`),
      margin = { top: 0, right: 0, bottom: 30, left: 20 },
      height = svg.node().getBoundingClientRect().height - margin.top - margin.bottom,
      width = svg.node().getBoundingClientRect().width - margin.left - margin.right,
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
      brush,
      myChart;

  yScale = scaleLinear()
    .domain([0, max(d.y)])
    .range([0,height]);

  yAxisValues = scaleLinear()
    .domain([0, max(d.y)])
    .range([height, 0])
  
  yAxisTicks = axisLeft(yAxisValues)
    .ticks(10);
  
  xScale = scaleBand()
    .domain(d.y)
    .paddingInner(.1)
    .paddingOuter(.1)
    .range([0, width]);

  xAxisValues = scaleTime()
    .domain([ d.x[0], d.x[d.x.length - 1] ])
    .range([0, width]);

  xAxisTicks = axisBottom(xAxisValues)
    .ticks(timeDay.every(parseInt(d.x.length / 5)));
  
  colors = scaleLinear()
    .domain([ 0, 60, max(d.y) ])
    .range(['#FFF', '#2D8BCF', '#DA3637']);
  
  tooltip = 
  select('body')
    .append('div')
    .attr('id', 'chart_tooltip')
    .style('position', 'absolute')
    .style('padding', '0 10px')
    .style('background', 'white')
    .style('opacity', 0);

  myChart = 
  svg.append('g')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')')
  .selectAll('rect').data(d.y)
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

  yGuide = svg.append('g')
    .attr('transform', 'translate(20, 0)')
    .call(yAxisTicks);

  xGuide = svg.append('g')
    .attr('transform', 'translate(20,' + height + ')')
    .call(xAxisTicks);

  brush = svg.append('g')
    .attr("class", "brush")
    .call(brushX().on("brush", () => console.log("Brushy brushy")))
  
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

  return <svg id={props._id} width="100%" height="100%"></svg>
  
}

BarChart.propTypes = {
  data: propTypes.shape({
    y: propTypes.array.isRequired,
    x: propTypes.array.isRequired,
  }),
  _id: propTypes.string.isRequired
}

export default BarChart;
