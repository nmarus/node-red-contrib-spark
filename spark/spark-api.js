module.exports = function(RED) {
  'use strict';
  var SwaggerClient = require('swagger-client');
  var path = require('path');
  var fs = require('fs');
  var _ = require('lodash');

  var swaggerClient = null;
  var swaggerUrl = null;

  // create swagger client
  function createClient(url, callback) {
    // if swagger client already exists...
    if(swaggerClient && swaggerUrl) {
      return callback(null);
    }

    // if swagger url has changed...
    if(swaggerClient && url !== swaggerUrl) {
      swaggerUrl = null;
      swaggerClient = null;
    }

    // update swagger url
    swaggerUrl = url;

    // create swagger client
    swaggerClient = new SwaggerClient({
      url: swaggerUrl,
      success: function() {
        callback(null);
      }, function(err) {
        callback(new Error('error'));
      }
    });
  }

  // send api request
  function sendRequest(msg, resource, method, params, opts, token, processResponse, processError) {
    if(token && swaggerClient) {
      swaggerClient.clientAuthorizations.add('apiKey', new SwaggerClient.ApiKeyAuthorization('Authorization', 'Bearer ' + token, 'header'));
      swaggerClient[resource][method](params, opts, function(response) {
        processResponse(msg, response);
      }, function(err) {
        processError(msg, err);
      });
    } else {
      node.error('spark api token or swagger client invalid or not defined');
    }
  }

  function SparkApiNode(n) {
    RED.nodes.createNode(this, n);

    var node = this;

    node.profileConfig = RED.nodes.getNode(n.profileConfig);
    node.apiUrl = n.apiUrl;
    node.resource = n.resource;
    node.method = n.method;
    node.id = n.id;

    node.reqCount = 0;
    node.reqReceiving = false;

    // set node status visual indicators
    function setNodeStatus(state) {
      var status = {};
      switch(state) {
        case 'warning':
          status = {
            fill: 'yellow',
            shape: 'dot',
            text: 'Spark API: warning'
          };
          break;
        case 'error':
          status = {
            fill: 'red',
            shape: 'dot',
            text: 'Spark API: error'
          };
          break;
        case 'input_error':
          status = {
            fill: 'red',
            shape: 'dot',
            text: 'Spark API: invalid input'
          };
          break;
        default:
          status = {
            fill: 'blue',
            shape: 'ring',
            text: 'Spark API: ready'
          };
          break;
      }

      node.status(status);
    }

    // indicate traffic via status
    function reqPing() {
      // increment request counter
      node.reqCount++;

      var timeout;

      var online = {
        fill: 'blue',
        shape: 'ring',
        text: 'Spark API: online (' + node.reqCount + ')'
      };

      var recieving = {
        fill: 'blue',
        shape: 'dot',
        text: 'Spark API: online (' + node.reqCount + ')'
      };

      if(node.reqReceiving) {
        clearTimeout(timeout);
      } else {
        node.status(recieving);
      }

      node.reqReceiving = true;

      timeout = setTimeout(function() {
        node.reqReceiving = false;
        node.status(online);
      }, 200);
    }

    function processResponse(msg, response) {
      reqPing();

      var newMsg = {};
      newMsg.topic = node.resource + '.' + node.method;

      // handle object response
      if(response && typeof response === 'object') {

        // capture headers
        if(response.hasOwnProperty('headers') && typeof response.headers === 'object') {
          newMsg.headers = response.headers;
        }

        // capture status
        if(response.hasOwnProperty('status')) {
          newMsg.status = response.status;
        } else {
          newMsg.status = 500;
        }

        // if response is from a delete...
        if(newMsg.status === 204) {
          newMsg.payload = {};

          // send message
          node.send(newMsg);

          return null;
        }

        // if response.data
        if(response.hasOwnProperty('data')) {
          var data = response.data;

          // if empty response...
          if(typeof data === 'string' && (data === '' || data === '{}')) {
            // show warning
            node.warn('error processsing response');

            // set node status
            setNodeStatus('warning');

            return null;
          }

          // if response.data is valid...
          if(typeof data === 'string') {

            // attempt parsing of json
            try {
              data = JSON.parse(data);
            }
            catch(err) {
              // show warning
              node.warn('error: ' + err.message || 'undefined');

              // set node status
              setNodeStatus('warning');

              return null;
            }

            // if response is array of items
            if(typeof data === 'object' && data.hasOwnProperty('items') && data.items instanceof Array) {

              // if as multiple messages
              if(true) {
                // define _msgid
                newMsg._msgid = RED.util.generateId();

                // define messages
                var newMsgArray = _.map(data.items, function(item, index) {
                  var msg = _.cloneDeep(newMsg);

                  msg.payload = item;
                  msg.parts = {
                    "id": msg._msgid,
                    "type": "array",
                    "index": index,
                    "count": data.items.length
                  };
                  return msg;
                });

                // send message
                node.send([newMsgArray]);
              }

              // else, as single message
              else {
                // define _msgid
                newMsg._msgid = msg._msgid;

                // define paypload
                newMsg.payload = data.items;

                // send message
                node.send(newMsg);
              }

            }


            // else, response is single item
            else {
              newMsg.payload = data;

              // send message
              node.send(newMsg);
            }
          }
        }

        // else, response.data does not exist...
        else {
          // show warning
          node.warn('response has no content');

          // set node status
          setNodeStatus('warning');
        }
      }

      else {
        node.warn('response invalid or not received');

        // set node status
        setNodeStatus('warning');
      }
    }

    function processError(msg, response) {
      if(response && typeof response === 'object') {
        var status;
        var data;
        var errMessage;
        var trackingId;

        // capture status
        if(response.hasOwnProperty('status')) {
          status = response.status;
        } else {
          status = 500;
        }

        // capture response body
        if(response.hasOwnProperty('data')) {
          data = response.data;

          // if response.data is valid...
          if(typeof data === 'string') {

            // attempt parsing of json
            try {
              data = JSON.parse(data);
            }
            catch(err) {
              node.error('error ' + status + ': ' + err.message || 'undefined');

              // set node status
              setNodeStatus('error');

              return null;
            }

            if(data.hasOwnProperty('trackingId')) {
              trackingId = data.trackingId;
            } else {
              trackingId = 'unknown';
            }

            if(data.hasOwnProperty('message')) {
              errMessage = data.message;
            } else {
              errMessage = 'unknown';
            }

            node.error('error ' + status + ': ' + errMessage + ' | trackingId: ' + trackingId);
          }
        } else {
          node.error('error ' + status + ': undefined error');
        }
      } else {
        node.error('error: unknown API response');
      }

      // set node status
      setNodeStatus('error');
    }

    // start node if profileConfig is defined
    if(node.profileConfig) {

      // set default status
      setNodeStatus();

      // create client
      createClient(node.apiUrl, function(err) {

        // if error creating client
        if(err) {
          // show warning
          node.warn('invalid input');

          // set node status
          setNodeStatus('input_error');

          return;
        }

        // else, client created
        else {

          // create input event
          node.on('input', function(msg) {

            var opts = {
              requestContentType: 'application/json',
              responseContentType: 'application/json'
            };

            var params = {};

            // if input is non empty string
            if(msg && typeof msg.payload === 'string' && msg.payload.length > 0) {
              // atempt parsing of json
              try {
                params = JSON.parse(msg.payload);
                if(params instanceof Array) {
                  // show warning
                  node.warn('invalid input');

                  // set node status
                  setNodeStatus('input_error');

                  return;
                }
              }
              catch(err) {
                // show warning
                node.warn(err.message);

                // set node status
                setNodeStatus('input_error');

                return;
              }
            }

            // else if input is object
            else if(msg && typeof msg.payload === 'object' && !(msg.payload instanceof Array)) {
              params = msg.payload;
            }

            // else input is invalid
            else {
              // show warning
              node.warn('invalid input');

              // set node status
              setNodeStatus('input_error');

              return;
            }

            // Send Spark API Request
            sendRequest(msg, node.resource, node.method, params, opts, node.profileConfig.credentials.token, processResponse, processError);
          });
        }
      });
    }
  }

  if(RED.settings.httpNodeRoot !== false) {
    RED.httpNode.get('/swagger-client-web.js', function(req, res) {
      var clientPath = path.resolve(__dirname, './swagger-client-web.js');
      fs.readFile(clientPath, function(err, data) {
        if(err) {
          res.set('Content-Type', 'text/javascript').send('{ "error": "' + err.message + '", "message": "Error reading swagger-client-web.js" }');
        } else {
          res.set('Content-Type', 'text/javascript').send(data);
        }
      });
    });

    RED.httpNode.get('/api/cisco_spark_v1.json', function(req, res) {
      var apiPath = path.resolve(__dirname, './api/cisco_spark_v1.json');
      fs.readFile(apiPath, function(err, data) {
        if(err) {
          res.set('Content-Type', 'text/javascript').send('{ "error": "' + err.message + '", "message": "Error reading api/cisco_spark_v1.json" }');
        } else {
          res.set('Content-Type', 'text/javascript').send(data);
        }
      });
    });
  } else {
    this.warn('httpNodeRoot is disabled in node-red settings');
  }

  RED.nodes.registerType('Spark API', SparkApiNode);
};
