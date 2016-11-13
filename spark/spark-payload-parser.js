module.exports = function(RED) {
  'use strict';
  var _ = require('lodash');

  function SparkParserNode(n) {
    RED.nodes.createNode(this, n);

    var node = this;

    node.parsers = n.parsers;

    // return value
    function getPayloadKeyValue(payload, key) {
      // validate payload is object
      if(typeof payload === 'object') {

        var value = '';

        // search msg.payload.data
        if(payload.hasOwnProperty('data') && payload.data.hasOwnProperty(key)) {
          value = payload.data[key];
        }

        // search msg.payload
        else if(payload.hasOwnProperty(key)) {
          value = payload[key];
        }

        if(value != '') {
          return value;
        }
      }
    }

    function processMsg(msg, parsers) {
      var newMsg = _.cloneDeep(msg);
      var newPayload = {};

      if(parsers && parsers instanceof Array && parsers.length > 0) {
        _.forEach(parsers, function(parser) {
          if(parser.hasOwnProperty('key') && parser.key !== '') {
            if(!parser.hasOwnProperty('as') || (parser.hasOwnProperty('as') && parser.as === '')) {
              parser.as = parser.key;
            }
            newPayload[parser.as] = getPayloadKeyValue(newMsg.payload, parser.key);
          }
        });
      }

      if(newPayload !== {}) {
        newMsg.payload = newPayload ;

        return newMsg;
      }
    }

    // input event
    node.on('input', function(msg) {

      // if input is valid
      if(msg && typeof msg === 'object' && msg.hasOwnProperty('payload')) {

        // create new message and preserve properties that this node is not manipulating
        var newMsg = _.cloneDeep(msg);

        // if payload is object
        if(typeof newMsg.payload === 'object') {
          newMsg = processMsg(newMsg, node.parsers);

          // if parser returned value
          if(newMsg) {
            node.send(newMsg);
          }
        }
      }

      // else input is invalid
      else {
        node.warn('invalid input');
      }
    });
  }

  RED.nodes.registerType('Spark Payload Parser', SparkParserNode);
};
