var AWS = require('aws-sdk');
require('dotenv').config();

// var vids = require('../client/components/VideoChat.jsx');

var s3 = new AWS.S3(); //{apiVersion: '2006-03-01'}
AWS.config.update({accessKeyId: process.env.app_id, secretAccessKey: process.env.app_key});
AWS.config.update({region:'us-west-2'});

/////////////////////////
///////VIDEO POST////////
/////////////////////////

const postTheVideo = (videoFile) => {
  console.log('Posting videoFile to your AWS s3 bucket');
  //set the parameters for video posts
  var params = {
  	Bucket: process.env.bucket,
    Key: 'videoFile_kairos2.webm',
    Body: videoFile,
    ContentType: 'video/webm',
    ACL: 'public-read-write'
  };

  //CONNECT WITH THE BUCKET --once things work, experiment to make sure it is necessary
  s3.createBucket({Bucket: process.env.bucket}, function() {
    //put an object in the bucket -- change to post if works!
    s3.putObject(params, function(err, data) {
        if (err)
            console.log(err)
        else {
          process.env.video_id += 1;
          console.log('vidId', process.env.video_id);
          console.log("Successfully uploaded video to myBucket");
          }

     });
  });


  //set public and authenticated urls to return to the client!
    var publicUrl = 'https://s3-us-west-1.amazonaws.com/' + params.Bucket + '/' + params.Key;
    var presignedUrl = s3.getSignedUrl('putObject', params);

    //send them off
    return {publicUrl:publicUrl, presignedUrl: presignedUrl};
};

/////////////////////////
///////PHOTO POST////////
/////////////////////////

const postThePhoto = (photo) => {
  console.log('Attempting post of videoFile to s3')
  // the below is a weird buffer string, see stackoverflow link below for info.
  //http://stackoverflow.com/questions/7511321/uploading-base64-encoded-image-to-amazon-s3-via-node-js
  let buf = new Buffer(photo.replace(/^data:image\/\w+;base64,/, ""),'base64');
  let params = {
    Bucket: process.env.bucket,
    Key: `Photo for Kairos ${process.env.photo_id}`,
    Body: buf,
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg',
    ACL: 'public-read-write'
  };

 s3.createBucket({Bucket: process.env.bucket}, function() {
  //THE BODY IS WHAT YOUR ARE INPUTTING, the KEY IS THE TITLE!

  s3.putObject(params, function(err, data) {
      if (err) {
          console.log(err)
      }
      else {
        console.log("Successfully uploaded photo to myBucket" + data);
        process.env.photo_id += 1;
        return data;
      }
  });

});
    var publicUrl = 'https://s3-us-west-1.amazonaws.com/' + params.Bucket + '/' + params.Key;
    var presignedUrl = s3.getSignedUrl('putObject', params);

    //send them off
    return {publicUrl:publicUrl, presignedUrl: presignedUrl};
};

module.exports.postTheVideo = postTheVideo;
module.exports.postThePhoto = postThePhoto;



// | authenticated-read | aws-exec-read | bucket-owner-read | bucket-owner-full-control private | public-read |
//Content-Type: application/pdf
//Content-Transfer-Encoding: base64
// var params = {Bucket: process.env.bucket, Key: 'key'};
// var url = s3.getSignedUrl('getObject', params);
//presigned
// console.log('The URL is', url);
