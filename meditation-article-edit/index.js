const AWS = require('aws-sdk');
const moment = require('moment');
const s3 = new AWS.S3();
const fileType = require('file-type');
const sha1 = require('sha1');
const dateFormat = require('dateformat');
const empty = require('is-empty');
const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-2'
});

exports.handler = (event, context, callback) => {
    var thumbnailPath = '';
    var oldData = ''
    event.body = JSON.parse(event.body);
    docClient.get({
        TableName: 'ArticlesTable',
        Limit: 1,
        Key: {
            id: parseInt(event.pathParameters.id),
        }
    }, (err, data) => {
        if (err) {
            callback({
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "test": err + ''
                })
            }, null);
        } else {
            oldData = data;
            var day = dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
            if (!empty(event.body.base64string)) {
                let base64string = event.body.base64string;
                let buffer = new Buffer(base64string, 'base64');
                let fileMime = fileType(buffer);
                if (fileMime === null) {
                    callback({
                        statusCode: 500,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "error :": 'String supplied is not a file type'
                        })
                    }, null);
                }
                let file = getFile(fileMime, buffer);
                let params = file.params;
                s3.putObject(params, function(err, dataS3) {
                    if (err) {
                        callback({
                            statusCode: 500,
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(err)
                        }, null);
                    }
                    if (dataS3) {
                        thumbnailPath = file.uploadFile.full_path
                        var paramsUpdate = {
                            TableName: 'ArticlesTable',
                            Key: {
                                "id": parseInt(event.pathParameters.id)
                            },
                            UpdateExpression: "set title = :t, description = :d , updated_date = :u, thumbnail = :th",
                            ExpressionAttributeValues: {
                                ":t": !empty(event.body.title) ? event.body.title : oldData.title,
                                ":d": !empty(event.body.description) ? event.body.description : oldData.description,
                                ":th": !empty(thumbnailPath) ? 'https://s3-ap-southeast-1.amazonaws.com/' + thumbnailPath : oldData.thumbnail,
                                ":u": day
                            },
                            ReturnValues: "UPDATED_NEW"
                        };
                        var documentClient = new AWS.DynamoDB.DocumentClient({
                            region: 'us-east-2'
                        });

                        documentClient.update(paramsUpdate, function(err, dataUpdate) {
                            if (err) {
                                callback({
                                    statusCode: 500,
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify(err)
                                }, null);
                            }
                            callback(null, {
                                statusCode: 200,
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(dataUpdate)
                            });
                        });
                    }

                });
            }
        }
    });


}

let getFile = function(fileMime, buffer) {
    let fileExt = fileMime.ext;
    let hash = sha1(new Buffer(new Date().toString()));

    let fileName = hash + '.' + fileExt;

    let fileFullPath = 'meditationnodejs/upload/' + fileName;
    let params = {
        Bucket: 'meditationnodejs/upload',
        Key: fileName,
        Body: buffer,
        ACL: 'public-read-write',
        ContentType: 'image/png',

    }
    let uploadFile = {
        size: buffer.toString('ascii').length,
        type: fileMime.mime,
        name: fileName,
        full_path: fileFullPath,
    }
    return {
        'params': params,
        'uploadFile': uploadFile
    }


}
