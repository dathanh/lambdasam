var AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-2'
});
exports.handler = (event, context, callback) => {

    var scanningParameters = {
        TableName: 'ArticlesTable',
        Limit: 1,
        Key: {
            id: parseInt(event.id),
        }

    };

    docClient.get(scanningParameters, (err, data) => {

        if (err) {
            callback(err, null);
        }
        else {
          callback(err, data.Item);
        }
    });
};
