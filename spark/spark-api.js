module.exports = function(RED) {
  'use strict';
  var SwaggerClient = require('swagger-client');
  var path = require('path');
  var fs = require('fs');

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
      }, function(error) {
        processError(msg, error);
      });
    } else {
      processError(msg, 'error with spark api token or swagger client');
    }
  }

  function SparkApiNode(n) {
    RED.nodes.createNode(this, n);

    var node = this;

    node.profileConfig = RED.nodes.getNode(n.profileConfig);
    node.apiUrl = n.apiUrl;
    node.resource = n.resource;
    node.method = n.method;

    node.reqCount = 0;
    node.reqReceiving = false;

    // set default status
    node.status({
      fill: 'blue',
      shape: 'ring',
      text: 'Spark API: ready'
    });

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
    };

    function processResponse(msg, response) {
      // extend msg object
      msg.payload = {};
      msg.error = {};
      msg.status = 500;

      // handle undefined response
      if(typeof response === 'undefined') {
        // set error message
        msg.error.message = 'response not received';

        // show warning in debug window
        node.warn(msg.error.message);

        // set node status
        setNodeStatus('warning');
      }

      // handle string response
      else if(typeof response === 'string') {
        msg.payload = response;

        // set error message
        msg.error.message = 'response is not object';

        // show warning in debug window
        node.warn(msg.error.message);

        // set node status
        setNodeStatus('warning');
      }

      // handle object response
      else if(response && typeof response === 'object') {
        // capture headers
        if(response && typeof response.headers === 'object') {
          msg.headers = response.headers;
        }

        // capture status
        if(response && response.status) {
          msg.status = response.status;
        }

        // handle non 2xx status
        if(msg.status > 299) {
          processError(response);
          return;
        }

        // if response.data
        if(response.hasOwnProperty('data')) {

          var data = response.data;

          // if empty response
          if(data === '' || data === '{}') {

            // determine if empty respose is from delete
            if(response.status && response.status === 204) {
              // set msg.error to null
              msg.error = null;
            } else {
              // set error message
              msg.error.message = 'response is empty';

              // show warning in debug window
              node.warn(msg.error.message);

              // set node status
              setNodeStatus('warning');
            }
          }

          // if response.data is string
          else if(typeof data === 'string') {
            // attempt parsing of json
            try {
              data = JSON.parse(data);
            }
            catch(err) {
              // set error message
              msg.error.message = 'json data not found in response';

              // show warning in debug window
              node.warn(msg.error.message);

              // set node status
              setNodeStatus('warning');

              // set msg.topic
              msg.topic = node.resource + '.' + node.method;

              // send message
              node.send(msg);
              return;
            }

            // abstract away items container for array response
            if(data && data.hasOwnProperty('items') && data.items instanceof Array) {
              msg.payload = data.items;
            } else {
              msg.payload = data;
            }

            // set msg.error to null
            msg.error = null;
          }
        }

        // else, response.data does not exist...
        else {
          // set error message
          msg.error.message = 'response has no content';

          // show warning in debug window
          node.warn(msg.error.message);

          // set node status
          setNodeStatus('warning');
        }
      }

      // set msg.topic
      msg.topic = node.resource + '.' + node.method;

      // send msg
      node.send(msg);
    }

    // api validation error
    function processError(msg, error) {
      // extend msg object
      msg.payload = {};
      msg.error = {};
      msg.status = 500;

      // handle undefined error
      if(typeof error === 'undefined') {
        // set error message
        msg.error.message = 'unknown error';

        // show warning in debug window
        node.warn(msg.error.message);

        // set node status
        setNodeStatus('error');
      }

      // handle string error
      else if(error && typeof error === 'string') {

        // set error message
        msg.error.message = error;

        // show warning in debug window
        node.warn(msg.error.message);

        // set node status
        setNodeStatus('error');
      }

      // handle object response
      else if(error && typeof error === 'object') {
        // capture headers
        if(error && typeof error.headers === 'object') {
          msg.headers = error.headers;
        }

        // capture status
        if(error && error.status) {
          msg.status = error.status;
        }

        // check for error object from Spark API
        if(error && error.hasOwnProperty('data')) {

          var data = error.data;

          // if empty response
          if(data === '' || data === '{}') {

            // set error message
            msg.error.message = 'unknown error';

            // show warning in debug window
            node.warn(msg.error.message);

            // set node status
            setNodeStatus('error');
          }

          // if error.data is string
          else if(typeof data === 'string') {
            // atempt parsing of json
            try {
              var data = JSON.parse(data);
            }
            catch(err) {
              // set error message
              msg.error.message = 'unknown error';

              // show warning in debug window
              node.warn(msg.error.message);

              // set node status
              setNodeStatus('error');

              // set msg.topic
              msg.topic = node.resource + '.' + node.method;

              // send message
              node.send(msg);
              return;
            }

            // msg.error.message
            if(data.hasOwnProperty('message')) {
              msg.error.message = data.message;
            } else {
              // define errors that do not generate message
              switch(msg.status) {
                case 400:
                  // set error message
                  msg.error.message = '400 (request invalid) response received';
                  break;
                case 401:
                  // set error message
                  msg.error.message = '401 (request unauthorized) response received';
                  break;
                case 403:
                  // set error message
                  msg.error.message = '403 (request not allowed) response received';
                  break;
                case 404:
                  // set error message
                  msg.error.message = '404 (request unauthorized) response received';
                  break;
                case 429:
                  // set error message
                  msg.error.message = '429 (rate limiter hit) response received';
                  break;
                case 500:
                  // set error message
                  msg.error.message = '500 (something went wrong on server) response received';
                  break;
                case 501:
                  // set error message
                  msg.error.message = '501 response received';
                  break;
                case 502:
                  // set error message
                  msg.error.message = '502 response received';
                  break;
                case 503:
                  // set error message
                  msg.error.message = '503 (server is overloaded) response received';
                  break;
                default:
                  // set error message
                  msg.error.message = msg.status + ' response received';
                  break;
              }
            }

            // msg.error.description
            if(data.hasOwnProperty('errors') && data.errors instanceof Array) {
              if(data.errors.length > 0 && data.errors[0].hasOwnProperty('description')) {
                msg.error.description = data.errors[0].description;
              }
            }

            // msg.error.trackingId
            if(data.hasOwnProperty('trackingId')) {
              msg.error.trackingId = data.trackingId;
            }

            // show warning in debug window
            node.warn(msg.error.message);

            // set node status
            setNodeStatus('error');
          }
        }

        // else error.data does not exist
        else {
          // set error message
          msg.error.message = 'unknown error';

          // show warning in debug window
          node.warn(msg.error.message);

          // set node status
          setNodeStatus('error');
        }
      }

      // set msg.topic
      msg.topic = node.resource + '.' + node.method;

      // send message
      node.send(msg);
    }

    // start node if profileConfig is defined
    if(node.profileConfig) {

      // create client
      createClient(node.apiUrl, function(err) {
        if(err) {
          // show warning in debug window
          node.warn('invalid input');

          // set node status
          setNodeStatus('input_error');

          return;
        } else {

          // input event
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
                  // show warning in debug window
                  node.warn('invalid input');

                  // set node status
                  setNodeStatus('input_error');

                  return;
                }
              }
              catch(err) {
                // show warning in debug window
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
              // show warning in debug window
              node.warn('invalid input');

              // set node status
              setNodeStatus('input_error');

              return;
            }

            // Send Spark API Request
            reqPing();
            sendRequest(msg, node.resource, node.method, params, opts, node.profileConfig.credentials.token, processResponse, processError);
          });
        }
      });
    }
  }

  RED.nodes.registerType('Spark API', SparkApiNode);

  RED.httpAdmin.get('/swagger-client-web.js', function(req, res) {
    var clientPath = path.resolve(__dirname, './swagger-client-web.js');
    fs.readFile(clientPath, function(err, data) {
      if(err) {
        res.set('Content-Type', 'text/javascript').send('{ "error": "' + err.message + '", "message": "Error reading swagger-client-web.js" }');
      } else {
        res.set('Content-Type', 'text/javascript').send(data);
      }
    });
  });

  RED.httpAdmin.get('/api/cisco_spark_v1.json', function(req, res) {
    var apiPath = path.resolve(__dirname, './api/cisco_spark_v1.json');
    fs.readFile(apiPath, function(err, data) {
      if(err) {
        res.set('Content-Type', 'text/javascript').send('{ "error": "' + err.message + '", "message": "Error reading api/cisco_spark_v1.json" }');
      } else {
        res.set('Content-Type', 'text/javascript').send(data);
      }
    });
  });
};
