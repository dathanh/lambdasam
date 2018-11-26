'use strict';

var AWS = require('aws-sdk');

var dynamo = new AWS.DynamoDB();


exports.handler = (event, context, callback) => {
    var scanningParameters = {
        TableName: "ArticlesTable",
    };

    dynamo.scan(scanningParameters, (err, data) => {
        if (err) {
            callback(err, null);
        }
        else {
            
            callback(null, data.Items);
        }
    });

};
