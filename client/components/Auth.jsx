import React from 'react';
import startup from './../lib/captureStills.js';

class Auth extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      textinput: ''
    }
  }

  // generic handle text input.
  handleInput(e) {
    this.setState({textinput: e.target.value});
  }

  // start captureStills and Kairos fetch methods.
  handleSubmit() {
    startup(this.state.textinput, this.props.socket); 
      // pass down socket to doAuth function in ./captureStills.js
  }

  render() {
    return(
      <div>
        <input className="authText" type='text' value={this.state.textinput}
              onChange={this.handleInput.bind(this)}></input>
        <button className="authText" onClick={this.handleSubmit.bind(this)}>Authenticate</button>
      </div>
    )
  }
}

export default Auth
