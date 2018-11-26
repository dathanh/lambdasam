var AWS = require('aws-sdk');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
var dateFormat = require('dateformat');
exports.handler = (event, context, callback) => {
    var authenticationData = {
        Username: event.email,
        Password: event.password,
    };

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var poolData = {
        UserPoolId: 'us-east-2_4bvR0oGQq', // Your user pool id here
        ClientId: '7tpjolv03m7o5buan8q1d9g6ra', // Your client id here
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username: event.email,
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(result) {
            callback(null,{'token': result.idToken.getJwtToken()});
        },

        onFailure: function(err) {
            callback(err, null);
        },

    });
}
