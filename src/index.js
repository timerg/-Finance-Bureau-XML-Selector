import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App.js'

function Welcome(props) {
  return <h1>Hello, Guten , {props.name}</h1>
}

const element = ReactDOM.render(
  <App />,
  document.getElementById('root')
);
