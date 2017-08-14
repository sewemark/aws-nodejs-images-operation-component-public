var AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json');

var  queueUrl= 'https://sqs.us-east-2.amazonaws.com/810664644484/image-operation';

var params = {
    QueueUrl: queueUrl,
};

var sqs = new AWS.SQS();

sqs.receiveMessage(params, function(err, data) {
    console.log("data222");
    console.log(data);
    if (err) {
        console.log("Receive Error", err);
    } else {
        console.log(data);
        var deleteParams = {
            QueueUrl: queueURL,
            ReceiptHandle: data.Messages[0].ReceiptHandle
        };
        /*sqs.deleteMessage(deleteParams, function(err, data) {
            if (err) {
                console.log("Delete Error", err);
            } else {
                console.log("Message Deleted", data);
            }
        });*/
    }
});