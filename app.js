var sharp= require('sharp');
var AWS = require('aws-sdk');
const fs = require('fs');

AWS.config = new AWS.Config();

AWS.config.accessKeyId = "AKIAJWMKWOHSHPFJ7XAQ";
AWS.config.secretAccessKey = "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";
AWS.config.region = "us-east-2";
var s3 =  new AWS.S3();
var  queueUrl= 'https://sqs.us-east-2.amazonaws.com/810664644484/image-operation';

var params = {
    QueueUrl: queueUrl,
    AttributeNames: ["SentTimestamp"],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: ["All"],
    WaitTimeSeconds: 20
};

var sqs = new AWS.SQS();
var rec = function () {

  sqs.receiveMessage(params, function(err, data) {
        if (err) {
            console.log("Receive Error", err);
        }

        if(data.Messages) {
            var body = data.Messages[0].Body;
            var tempData = data;
            var item = JSON.parse(body);

                var params = {Bucket: 'sewemarkbucket', Key: item.file};
                s3.getObject(params, function (err, data) {
                    if (err) console.log(err, err.stack);
                    else {
                        var trimmed =new Date().toDateString().trim();
                        var path = trimmed + item.operation     + item.file;

                        if (item.operation == "rotateRadio") {
                            sharp(data.Body)
                                .rotate(Number(item.params.angels))
                                .toFile(path, function (err, info) {
                                    if (err) console.log(err);
                                    else{ console.log(info);
                                        save(path);
                                    }
                        });
                        } else if (item.operation == "resizeRadio") {
                            sharp(data.Body)
                                .resize(Number(item.params.width), Number(item.params.height))
                                .toFile(path, function (err, info) {
                                    if (err) console.log(err);
                                    else{
                                        save(path);
                                        console.log(info);
                                    }
                                });
                        }else{
                            sharp(data.Body)
                                .negate()
                                .toFile(path, function (err, info) {
                                    if (err) console.log(err);
                                    else{
                                        save(path);
                                        console.log(info);
                                    }
                                });
                        }
                    }

                    var params = {
                        QueueUrl: queueUrl,
                        ReceiptHandle: tempData.Messages[0].ReceiptHandle
                    };

                    sqs.deleteMessage(params, function (err, data) {
                        if (err) console.log(err, err.stack);
                        else     console.log(data);
                    });
                });

            setTimeout(function() {
                rec()
            }, 60 * 1000);

        }else{
            setTimeout(function() {
                rec()
            }, 60 * 1000);
        }
    });
 };

 function save(path) {
     var params = {
         Key: path,
         Body: fs.createReadStream(path),
         Bucket: 'sewemarkbucket',
         ACL:'public-read-write'
     };
     s3.upload(params, function (data,err) {
         if(err){
             console.log(err);
         }
         if(data){
             console.log(data);
         }
     })
 }
 rec();