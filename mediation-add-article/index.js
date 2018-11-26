const AWS = require('aws-sdk');
const moment = require('moment');
const s3 = new AWS.S3();
const fileType = require('file-type');
const sha1 = require('sha1');
const dateFormat = require('dateformat');
const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-2'
});

exports.handler = (event, context, callback) => {
    // let request = event.body;
    // console.log(event.body);
    let base64string = event.body.base64string;
    let buffer = new Buffer(base64string, 'base64');
    let fileMime = fileType(buffer);
    if (fileMime === null) {
        return context.fail('String supplied is not a file type');
    }

    let file = getFile(fileMime, buffer);
    let params = file.params;
    s3.putObject(params, function(err, dataS3) {
        if (err) {
            return console.log(err);
        }
        if (dataS3) {
            var scanningParameters = {
                TableName: "Reference",
                Limit: 1,
                Key: {
                    id: '1',
                }
            };

            docClient.scan(scanningParameters, (err, reference) => {
                if (err) {
                    callback(err, null);
                }
                else {
                    // console.log(JSON.stringify(dataS3));
                    // callback(null,reference);
                    var day = dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
                    var params = {
                        TableName: 'ArticlesTable',
                        Item: {
                            "id": parseInt(reference.Items[0].articles) + 1,
                            "name": event.body.name,
                            "title": event.body.title,
                            "description": event.body.description,
                            "thumbnail": 'https://s3-ap-southeast-1.amazonaws.com/' + file.uploadFile.full_path,
                            "status": "active",
                            "created_date": day,
                            "updated_date": day,
                        }
                    };
                    var documentClient = new AWS.DynamoDB.DocumentClient();
                    documentClient.put(params, function(err, dataArticlesTable) {
                        if (err) {
                            return console.log(err);
                        }

                        var paramsReference = {
                            TableName: 'Reference',
                            Key: {
                                "id": "1"
                            },
                            UpdateExpression: "set articles = :a",
                            ExpressionAttributeValues: {
                                ":a": parseInt(reference.Items[0].articles) + 1,

                            },
                            ReturnValues: "UPDATED_NEW"
                        };
                        var documentClient = new AWS.DynamoDB.DocumentClient();
                        documentClient.update(paramsReference, function(err, dataReference) {
                            if (err) {
                                return console.log(err);
                            }
                            callback(null, "succcess");
                        });
                    });
                }
            });

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

