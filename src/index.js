import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import LineChart from './LineChart';
import BarChart from './BarChart';

const randomArrayData = () => {
  return {
    y: (() => {
      let y = []
      y.push(50 + Math.random() * 40)
      for (var i = 1; i < 50; i++) {
        y.push( y[i-1] + (Math.random() - 0.5) * 10  )
      }
      return y
    })(),
    x: (() => {
      let x = [];
      x.push(new Date())
      for (var i = 1; i < 50; i++) {
        x.push( new Date( x[i-1].getTime() + (24 * 60 * 60 * 1000)) )
      }
      return x;
    })(),
  }
}

const randomCSVData = () => {
  let csv = [];
  // Initial Value
  csv.push({
    x: new Date(),
    y: 50 + Math.random() * 40,
  })

  // Random Value pairs
  for(let i = 1; i < 50; i++) {
    csv.push({
      x: new Date( csv[i-1].x.getTime() + (24 * 60 * 60 * 1000)),
      y: csv[i-1].y + (Math.random() - 0.5) * 10,
    })
  }
  return csv;
}

const Layout = () => {
  // Dummy data to render with charts
  const [arrayData, setArrayData] = useState(randomArrayData())
  const [CSVData, setCSVData] = useState(randomCSVData())

  return ( 
    <div id="charts">
      <div style={{display: "flex", height: "50vh", width:"50vw"}}>
        {/* <BarChart data={arrayData} /> */}
        <LineChart data={CSVData} />
      </div>
      <button onClick={() => { setArrayData(randomArrayData); setCSVData(randomCSVData)}}>New Values</button> 
    </div> 
  );
}

ReactDOM.render(<Layout />, document.getElementById('root'));