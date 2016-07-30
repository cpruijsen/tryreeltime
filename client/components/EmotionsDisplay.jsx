import React from 'react';
import _ from 'underscore';

//NEED TO HAND DOWN THE SOCKET!! 
class EmotionsDisplay extends React.Component {
	constructor(props) {
		super(props)
		this.state = {

		}
	}

	render() {
		return(
			<nav class="navbar navbar-default">
			  <div class="container-fluid">
			    <div class="navbar-header">
			      <a class="navbar-brand" href="#">Emotional Analysis</a>
			    </div>
			    <div>
			  	    <ul>
			  		    {_.map(this.props.emotions, (emotion, i) => {
			  		    	return <li key={i}> {emotion.emotion}: {emotion.val} </li>
			  		    })}
			  	    </ul>
			    </div>
			  </div>
			  <div onClick={(e)=>{
			  	  console.log('Button clicked');
			  	  this.props.socket.emit('buttonClick', e);
			  }}>
				  <button>R they really enjoying this tho?</button>
			  </div>
			</nav>
		)
	}
}

export default EmotionsDisplay;