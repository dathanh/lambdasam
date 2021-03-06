var AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-2'
});
exports.handler = (event, context, callback) => {
console.log(JSON.stringify(context));
    var scanningParameters = {
        TableName: 'ArticlesTable',
        Limit: 1,
        Key: {
            id: parseInt(event.pathParameters.id),
        }

    };

    docClient.get(scanningParameters, (err, data) => {

        if (err) {
            callback(err, null);
        }
        else {
            callback(null,{
              statusCode:200,
              headers: { "Content-Type" : "application/json" },
              body:JSON.stringify(data.Item)
          });
        }
    });
};
