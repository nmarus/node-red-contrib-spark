module.exports = function(RED) {
  'use strict';
  var _ = require('lodash');

  function SparkParserNode(n) {
    RED.nodes.createNode(this, n);

    var node = this;

    node.parser = n.parser;
    node.output = n.output.toLowerCase();
    node.topic = n.topic;

    function processPayload(pl, k) {
      // determine topic
      var topic = typeof node.topic === 'string' && node.topic.length > 0 ? node.topic : k;

      // value
      var value = '';

      // validate payload is object
      if(typeof pl === 'object') {

        // if webhook
        if(pl.hasOwnProperty('data')) {
          if(pl.data.hasOwnProperty(k)) {
            value = pl.data[k];
          } else {
            return null;
          }
        }

        // else api
        else {
          if(pl.hasOwnProperty(k)) {
            value = pl[k];
          } else {
            return null;
          }
        }

        // format output

        // if output is original
        if(node.output === 'original') {
          return value;
        }

        // else, if output is object
        else if(node.output === 'object') {
          return { [topic]: value };
        }

        // else, unrecognized
        else {
          return null;
        }
      }

      // else, not an object
      else {
        return null;
      }
    }

    function processPayloadArray(plArr, k) {
      // determine topic
      var topic = typeof node.topic === 'string' && node.topic.length > 0 ? node.topic : k;

      var collection =  _.map(plArr, function(pl) {
        // define payload
        var payload = processPayload(pl, k);
        if(payload) {
          return { "payload": payload, "topic": topic };
        }
      });

      collection = _.compact(collection);

      if(collection && collection.length > 0) {
        return collection;
      } else {
        return null;
      }
    }

    // input event
    node.on('input', function(msg) {
      // determine topic
      var topic = typeof node.topic === 'string' && node.topic.length > 0 ? node.topic : node.parser;

      var msgParser = {};

      // if input is valid
      if(typeof node.parser === 'string' && msg && typeof msg === 'object' && msg.hasOwnProperty('payload')) {
        var payload = _.clone(msg.payload);

        // if payload is array
        if(payload instanceof Array) {
          if(payload.length > 0) {
            var newArray = processPayloadArray(payload, node.parser);
            if(newArray && newArray.length > 0) {
              msgParser = newArray;
            } else {
              msgParser = null;
              node.warn('unmatched parser');
            }
          }
        }

        // else, payload is not instance of array
        else {
          var newPayload = processPayload(payload, node.parser);
          if(newPayload) {
            msgParser.payload = newPayload;
            msgParser.topic = topic;
          } else {
            msgParser = null;
            node.warn('unmatched parser');
          }
        }

        // send msgs
        node.send([msgParser, msg]);
      }

      // else input is invalid
      else {
        node.warn('invalid input');

        // send msgs
        node.send([null, msg]);
      }
    });
  }

  RED.nodes.registerType('Spark Payload Parser', SparkParserNode);
};
