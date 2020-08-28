"use strict";

exports.handler = async (event, context, callback) => {
    console.log('Received EVENT', JSON.stringify(event, null, 2));
    event.response.autoConfirmUser = true;
    event.response.autoVerifyPhone = true;
  callback(null, event);
};