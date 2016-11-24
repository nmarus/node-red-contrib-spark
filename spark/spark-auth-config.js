module.exports = function(RED) {
  'use strict';

  function SparkAuthConfigNode(n) {
    RED.nodes.createNode(this, n);

    this.name = n.name;
  }

  RED.nodes.registerType('Spark Authentication', SparkAuthConfigNode, {
    credentials: {
      token: {
        type: 'text'
      }
    }
  });
};
