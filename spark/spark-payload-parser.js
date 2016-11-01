module.exports = function(RED) {
  'use strict';
  var _ = require('lodash');

  function SparkParserNode(n) {
    RED.nodes.createNode(this, n);

    var node = this;

    node.parser = n.parser;
    node.topic = n.topic;
    node.multi = n.multi === 'true' ? true : false;

    function processPayload(pl, k) {
      // validate payload is object
      if(typeof pl === 'object') {

        // if webhook
        if(pl.hasOwnProperty('data')) {
          if(pl.data.hasOwnProperty(k)) {
            return pl.data[k];
          } else {
            return null;
          }
        }

        // else api
        else {
          if(pl.hasOwnProperty(k)) {
            return pl[k];
          } else {
            return null;
          }
        }

      }
    }

    function processPayloadArray(plArr, k) {
      var flatArr = _.map(plArr, function(pl) {
        // get payload
        var payload = processPayload(pl, k);

        if(payload) {
          return payload;
        }
      });

      // determine topic
      var topic = typeof node.topic === 'string' && node.topic.length > 0 ? node.topic : k;

      return { "payload": flatArr, "topic": topic };
    }

    function processPayloadMulti(plArr, k) {
      var collection =  _.map(plArr, function(pl) {
        // define payload
        var payload = processPayload(pl, k);

        // determine topic
        var topic = typeof node.topic === 'string' && node.topic.length > 0 ? node.topic : k;

        if(payload) {
          return { "payload": payload, "topic": topic };
        }
      });

      return collection;
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
              msgParser = processPayloadArray(payload, node.parser);
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
            msgParser.topic = typeof node.topic === 'string' && node.topic.length > 0 ? node.topic : node.parser;
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
