module.exports = function(RED) {
  'use strict';
  var _ = require('lodash');

  function SparkParserNode(n) {
    RED.nodes.createNode(this, n);

    var node = this;

    node.parser = n.parser;
    node.multi = n.multi === 'true' ? true : false;

    function processPayload(pl, f) {
      // validate payload is object
      if(typeof pl === 'object') {

        // if webhook
        if(pl.hasOwnProperty('data')) {
          if(pl.data.hasOwnProperty(f)) {
            return pl.data[f];
          } else {
            return null;
          }
        }

        // else api
        else {
          if(pl.hasOwnProperty(f)) {
            return pl[f];
          } else {
            return null;
          }
        }

      }
    }

    function processPayloadArray(plArr, f) {
      return _.map(plArr, function(pl) {
        var payload = processPayload(pl, f);

        if(payload) {
          return payload;
        }
      });
    }

    function processPayloadMulti(plArr, f) {
      return _.map(plArr, function(pl) {
        var payload = processPayload(pl, f);

        if(payload) {
          return { "payload": payload };
        }
      });
    }

    // input event
    node.on('input', function(msg) {
      var msgParser = {};

      // if input is valid
      if(typeof node.parser === 'string' && msg && typeof msg === 'object' && msg.hasOwnProperty('payload')) {
        var payload = _.clone(msg.payload);

        // if payload is array
        if(payload instanceof Array) {
          if(payload.length > 0) {
            if(node.multi) {
              msgParser = processPayloadMulti(payload, node.parser);
            } else {
              msgParser.payload = processPayloadArray(payload, node.parser);
            }
          }
          else {
            msgParser = null;
            node.warn('unmatched parser');
          }
        }

        // else, payload is not instance of array
        else {
          var newPayload = processPayload(payload, node.parser);
          if(newPayload) {
            msgParser.payload = newPayload;
          } else {
            msgParser = null;
            node.warn('unmatched parser');
          }
        }
      }

      // else input is invalid
      else {
        node.warn('invalid input');
      }

      // send msgs
      node.send([msgParser, msg]);
    });
  }

  RED.nodes.registerType('Spark Payload Parser', SparkParserNode);
};
