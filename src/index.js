import React, { useState } from 'react';
import ReactDOM from 'react-dom';
// import BarChart from './BarChart';
// import LineChart from './LineChart';
import PracticeChart from './PracticeChart';

const randomValues = () => {
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

const Layout = () => {
  // Dummy data to render with charts
  const [data, setData] = useState(randomValues())

  return ( 
    <div id="charts">
      <div style={{display: "flex", minHeight: "500px"}}>
        <PracticeChart data={data} _id={"c"}/>
      </div>
      <button onClick={() => setData(randomValues)}>New Values</button> 
    </div> 
  );
}

ReactDOM.render(<Layout />, document.getElementById('root'));