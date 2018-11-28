var AWS = require('aws-sdk');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
var dateFormat = require('dateformat');
exports.handler = (event, context, callback) => {
    event.body = JSON.parse(event.body);
    var authenticationData = {
        Username: event.body.email,
        Password: event.body.password,
    };

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var poolData = {
        UserPoolId: 'us-east-2_4bvR0oGQq', // Your user pool id here
        ClientId: '7tpjolv03m7o5buan8q1d9g6ra', // Your client id here
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username: event.body.email,
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(result) {
            callback(null, {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'token': result.idToken.getJwtToken()
                })
            });
        },
        onFailure: function(err) {
            callback({
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(err)
            }, null);
        },

    });
}
