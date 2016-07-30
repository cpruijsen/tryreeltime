import { getPeer, getMyId, establishPeerCall, establishPeerConnection} from '../lib/webrtc';


function recorddd (localStream, socket) {
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
        //return the stream so it can be further interacted with. Although, just return local stream
        //from other funk and use this as side effect for isolation :)
       return localStream;
};


export default recorddd;