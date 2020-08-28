/* tslint:disable */
/* eslint-disable */
'use strict';

const crypto_secure_random_digit = require("crypto-secure-random-digit");
const AWS = require("aws-sdk");
var sns = new AWS.SNS();

exports.handler = async (event, context, callback) => {
  console.log('RECEIVED event: ', JSON.stringify(event, null, 2));

  let passCode;
  var phoneNumber = event.request.userAttributes.phone_number;

  // The first CUSTOM_CHALLENGE request for authentication from
  // iOS AWSMobileClient actually comes in as an "SRP_A" challenge (a bug in the AWS SDK for iOS?)
  // web (Angular) comes in with an empty event.request.session
  if (event.request.session && event.request.session.length && event.request.session.slice(-1)[0].challengeName == "SRP_A" || event.request.session.length == 0) {

    passCode = crypto_secure_random_digit.randomDigits(6).join('');
    await sendSMSviaSNS(phoneNumber, passCode);

  } else {

    const previousChallenge = event.request.session.slice(-1)[0];
    passCode = previousChallenge.challengeMetadata.match(/CODE-(\d*)/)[1];
  }
  event.response.publicChallengeParameters = { phone: event.request.userAttributes.phone_number };
  event.response.privateChallengeParameters = { passCode };
  event.response.challengeMetadata = `CODE-${passCode}`;

  console.log('RETURNED event: ', JSON.stringify(event, null, 2));
  callback(null, event);
};

// Send secret code over SMS via Amazon Simple Notification Service (SNS)
async function sendSMSviaSNS(phoneNumber, passCode) {
  const params = { "Message": "[EXNOMY] Your secret code: " + passCode, "PhoneNumber": phoneNumber };
  await sns.publish(params).promise();
}
