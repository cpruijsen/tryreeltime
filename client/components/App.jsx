import React from "react";

import Landing from './Landing';
import Link from './Link';
import Video from "./Video.jsx";
import ChatSpace from "./ChatSpace.jsx";
import EmotionsDisplay from "./EmotionsDisplay.jsx";

import { getMyId, establishPeerConnection } from '../lib/webrtc';
import readFile from '../lib/fileReader';
import appendChunk from '../lib/mediaSource';
import calculateEmotions from '../lib/calculateEmotions';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.setFile = this.setFile.bind(this);
    this.handleShowChat = this.handleShowChat.bind(this);

    const params = new URLSearchParams(location.search.slice(1));
    const isSource = !params.has('id');

    this.state = {
      isSource,
      file: null,
      myId: null,
      peerId: params.get('id'),
      showLanding: isSource,
      showLink: isSource,
      showBody: !isSource,
      emotions: {
        0: {emotion: 'attention', val: 0},
        1: {emotion: 'negative', val: 0},
        2: {emotion: 'smile', val: 50},
        3: {emotion: 'surprise', val: 50}
      },
      showChatOnly: false,
      localStreamingEmotions:null,
      remoteStreamingEmotions:null
    };

  this.props.socket.on('photoData', data => {
    console.log("base app has received photo confirmation");
  });

  this.props.socket.on('KairosVideoData', data => {
    console.log("base app has received KairosVideoData data");
    console.log('appEmotions data', data);
    //at this point instantiate a new model, passing it KairosVideoData as props;
  });

  }

  componentDidMount() {
    if (this.state.isSource) {
      this.initAsSource();
    } else {
      this.initAsReceiver(this.state.peerId);
    }
  }

  setFile(e) {
    this.setState({
      file: e.target.files[0],
      showLanding: false,
      showChatOnly: false,
      showBody: true
    });
  }

  // TODO: separate initAsSource from componentDidMount
  /* intended:
      - initAsSource is done only when either a user is authenticated (set myId to username --> the link would be '/${username}') OR when a user drops in a file OR when a user clicks 'chat only'.
      - NOTE: myId is set in /lib/webrtc.js
      - add a validator, if a file is present, then readFile etc. otherwise delete the video element from the document. (so we free up the real estate for a larger chat experience) and change the chat styling / className.
  */

  initAsSource() {
    // Act as source: display a link that may be sent to a receiver
    getMyId().then((myId) => {
      this.setState({
        myId,
      });
    });

    establishPeerConnection().then((conn) => {
      // Now connected to receiver as source

      // Remove the link display
      this.setState({
        showLink: false,
      });

      // Read in the file from disk.
      // For each chunk, append it to the local MediaSource and send it to the other peer
      const video = document.querySelector('.video');
      readFile(this.state.file, (chunk) => {
        appendChunk(chunk, video);
        conn.send(chunk);
      });
    })
    .catch(console.error.bind(console));
  }

  initAsReceiver(peerId) {
    establishPeerConnection(peerId).then((conn) => {
      // Now connected to source as receiver

      // Listen for incoming video data from source
      conn.on('data', (data) => {
        if (typeof data === 'string') {
          console.log(data);
        } else {
          // Append each received ArrayBuffer to the local MediaSource
          const video = document.querySelector('.video');
          appendChunk(data, video);
        }
      });
    });
  }

  renderToDom (data) {
    let currentEmotions = calculateEmotions(data);
    console.log(currentEmotions);
    this.setState({emotions: currentEmotions});
  }

  handleShowChat() { // TODO: change <ChatSpace/> to only chat if no video
    this.setState({
      showChatOnly: true,
      showLanding: false,
      showBody: false
    });
  }

  render() {
    return (
      <div>
        {this.state.showLanding ? <Landing handleShowChat={this.handleShowChat} socket={this.props.socket} setFile={this.setFile} /> : null}
        {this.state.showLink ? <Link myId={this.state.myId} /> : null}
        {this.state.showBody ? <div className="wrapper">
          <EmotionsDisplay emotions={this.state.emotions} />
          <span id ='video'>
            <Video socket={this.props.socket} />
          </span>
          <ChatSpace socket={this.props.socket} isSource={this.state.isSource} peerId={this.state.peerId} renderToDom={this.renderToDom.bind(this)}/>
        </div> : null}
        {this.state.showChatOnly ? <div className="wrapper">
          <ChatSpace socket={this.props.socket} isSource={this.state.isSource} peerId={this.state.peerId} />
        </div> : null}
      </div>
    );
  }
}

App.propTypes = {
  socket: React.PropTypes.object.isRequired,
};

export default App;
