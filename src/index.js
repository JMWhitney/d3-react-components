import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import BarChart from './BarChart';

const Layout = () => {
  // Dummy data to render with charts
  const [data, setdata] = useState({
    temperatures: (() => {
      let temperatures = []
      temperatures.push(50 + Math.random() * 40)
      for (var i = 1; i < 50; i++) {
        temperatures.push( temperatures[i-1] + (Math.random() - 0.5) * 10  )
      }
      return temperatures
    })(),
    dates: (() => {
      let dates = [];
      dates.push(new Date)
      for (var i = 1; i < 50; i++) {
        dates.push( new Date( dates[i-1].getTime() + (24 * 60 * 60 * 1000)) )
      }
      return dates;
    })(),
  })

  const randomValues = () => {
    setdata({
      temperatures: (() => {
        let temperatures = []
        temperatures.push(50 + Math.random() * 40)
        for (var i = 1; i < 50; i++) {
          temperatures.push( temperatures[i-1] + (Math.random() - 0.5) * 10  )
        }
        return temperatures
      })(),
      dates: (() => {
        let dates = [];
        dates.push(new Date)
        for (var i = 1; i < 50; i++) {
          dates.push( new Date( dates[i-1].getTime() + (24 * 60 * 60 * 1000)) )
        }
        return dates;
      })(),
    })
  }

  return ( 
    <div id="charts">
      <BarChart _id={"a"} data={data}/>
      <button onClick={randomValues}>New Values</button>
    </div> 
  );
}

ReactDOM.render(<Layout />, document.getElementById('root'));