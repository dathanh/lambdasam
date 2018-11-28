'use strict';
var AWS = require('aws-sdk');

var dynamo = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-2'
});
exports.handler = (event, context, callback) => {
    var scanningParameters = {
          TableName: "ArticlesTable",
      };
console.log('bug:____'+JSON.stringify(process.env.PARAM1));
console.log('bug:____'+JSON.stringify(process.env.PARAM2));
      dynamo.scan(scanningParameters, (err, data) => {
          if (err) {

              callback(err, null);

          }
          else {
              callback(null,{
          		statusCode:200,
          		headers: { "Content-Type" : "application/json" },
          		body:JSON.stringify(data.Items)
          	});
          }
      });

};
