import React from 'react';

import { establishPeerCall } from '../lib/webrtc';

require('dotenv').config();

class VideoChat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      localStream: null,
      filterArray: ['ig-willow', 'ig-earlybird', 'ig-mayfair', 'ig-amaro', 'ig-xpro2', 'ig-toaster', 'ig-kelvin', 'ig-brannan'],
      filtercounter: 0,
      remoteVideoClassName: "remote-video",
      localVideoClassName: "local-video"
    };

    this.setUpVideoStream = this.setUpVideoStream.bind(this);

    this.props.socket.on('videoUrls',  (data) => {
      console.log('videoUrls on client side', data.publicUrl);
      fetch(`https://api.kairos.com/media?source=${data.publicUrl}`, {
        method: 'POST',
        headers: {
          app_id: '52efd677',
          app_key: 'c168477a480e5ac9a15a290cb7275d71',
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      }).then( res => {
        return res.json();
      }).then ( (data) => {
        console.log('data from fetch kairos emotions', data);
        this.props.renderToDom(data);
      }).catch( err => {
        console.error('err in kairosAPIfetch', err);
      });
    });




    this.props.socket.on('photoUrls',  (data) => {
      console.log('there are photoUrls too!')
    });
  }

  componentDidMount() {
    const constraints = {
      audio: false,
      video: true
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then( (localStream) => {

        console.log('stream after getUserMedia', localStream);

        window.mediaRecorder = new MediaRecorder(localStream);
        var recordedChunks = [];
        var handleDataAvailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          } else {
            console.log('no stream? error in handleDataAvailable');
          }
        };
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = () => {
          console.log('stop fired');

          var file = new File(recordedChunks, `userid.webm`, {
            type: 'video/webm'
          });

          console.log('file', file);
          this.props.socket.emit('videoFile', file);

          var reader = new FileReader();

          reader.onload = function( e ) {
          }.bind( this );
          reader.readAsText( file );

        };

        mediaRecorder.start();

        window.setTimeout( () => {
          mediaRecorder.stop();
        }, 5000)
        return localStream;
      })
      .then(function(whatisEVENHERE){
        console.log('nutherCheck', whatisEVENHERE);
        return whatisEVENHERE;
      })
      .then(this.setUpVideoStream)
        .catch(console.error.bind(console));
  }

  setUpVideoStream(localStream) {
    const localVideo = document.querySelector('.local-video');
    localVideo.srcObject = localStream;

    establishPeerCall(localStream, this.props.isSource ? null : this.props.peerId)
      .then((remoteStream) => {
        const remoteVideo = document.querySelector('.remote-video');
        remoteVideo.srcObject = remoteStream;
      })
      .catch(console.error.bind(console));
  }

  /* filter classes:
  ig-willow, ig-earlybird, ig-mayfair, ig-amaro, ig-xpro2, ig-toaster, ig-kelvin, ig-brannan

  TODO: separate remote video filters and local video filters.
  intended functionality:
  - you can control your localVideo filter, and the socket emits your filter choice to the connected peers
  - you receive filter info from connected peers and remoteVideo is filtered with those filters.
  */

  changeFilter() {
    if (this.state.filtercounter < this.state.filterArray.length - 1) {
      this.setState({filtercounter: this.state.filtercounter + 1});
    } else {
      this.setState({filtercounter: 0});
    }
  }

  render() {
    return (
      <div>
        <video onClick={this.changeFilter.bind(this)} className={`${this.state.localVideoClassName} ${this.state.filterArray[this.state.filtercounter]}`} autoPlay></video>
        <video onClick={this.changeFilter.bind(this)} className={`${this.state.remoteVideoClassName} ${this.state.filterArray[this.state.filtercounter]}`} autoPlay></video>
      </div>
    );
  }
}

VideoChat.propTypes = {
  isSource: React.PropTypes.bool.isRequired,
  peerId: React.PropTypes.string,
};

export default VideoChat;
