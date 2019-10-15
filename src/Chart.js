import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import propTypes from 'prop-types';
import debounce from './util/debounce';
  
const Chart = (props) => {
  
  const [, update] = useState();
  const forceUpdate = () =>  update({});
  const debouncedUpdate = debounce(forceUpdate, 100);
  const svgRef = useRef(null);

  useEffect(() => {
    props.renderChart(svgRef.current, props.data)
  })
  
  useLayoutEffect(() => {
    window.onresize = debouncedUpdate;

    //This function will get called before the hook unmounts
    return () => window.onresize = null;
    
  }, [debouncedUpdate]);

  return <svg ref={svgRef} height="100%" width="100%"></svg>
}

Chart.propTypes = {
  data: propTypes.shape({
    x: propTypes.array.isRequired,
    y: propTypes.array.isRequired
  }),
  renderChart: propTypes.func,
}

export default Chart;