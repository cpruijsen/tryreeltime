import { getPeer, getMyId, establishPeerCall, establishPeerConnection} from '../lib/webrtc';


function recorddd (localStream, socket) {

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
          //send off the video as a file through server socket (then to s3 then to Kairos)
          var file = new File(recordedChunks, `userid.webm`, {
            type: 'video/webm'
          });
          socket.emit('videoFile', file);
        };

        mediaRecorder.start();

        window.setTimeout( () => {
          mediaRecorder.stop();
        }, 5000)
};


export default recorddd;