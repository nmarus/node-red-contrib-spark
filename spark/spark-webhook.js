module.exports = function(RED) {
  'use strict';
  var bodyParser = require('body-parser');
  var jsonParser = bodyParser.json();
  var request = require('request');
  var path = require('path');
  var fs = require('fs');
  var _ = require('lodash');

  function SparkWebhookNode(n) {
    RED.nodes.createNode(this, n);

    var node = this;

    var httpNodeRoot;

    if(RED.settings.httpNodeRoot) {
      httpNodeRoot = RED.settings.httpNodeRoot;
    } else {
      httpNodeRoot = '/';
    }

    var webhookReq = {
      url: 'https://api.ciscospark.com/v1/webhooks/',
      json: true
    };

    node.profileConfig = RED.nodes.getNode(n.profileConfig);

    node.name = n.name || 'webhhook';
    node.resource = n.resource;
    node.event = n.event;
    node.host = n.host;

    node.basename = 'node_red_contrib_spark_' + node.id.replace(/\./g, '');

    node.pathname = httpNodeRoot + node.basename;
    node.webhookTarget = node.host + node.pathname;

    node.webhookId = n.webhookId || null;
    node.webhookObj = n.webhookObj || null;

    node.reqCount = 0;
    node.reqReceiving = false;

    // set default status
    node.status({
      fill: 'blue',
      shape: 'ring',
      text: 'Spark Webhook: ready'
    });

    // remove webhooks
    node.removeWebhooks = function(callback) {

      // if spark api token and webhook id are defined...
      if(node.profileConfig.credentials && node.profileConfig.credentials.token) {

        // clone module request template
        var _webhookReq = _.clone(webhookReq);

        // set credentials for request object
        _webhookReq.auth = { bearer: node.profileConfig.credentials.token };

        // send request to delete webhook
        request.get(_webhookReq, function(err, res) {
          // if request error...
          if(err) {
            node.log('error: ' + err.message);
            if(callback) callback(err);
          }

          // else, if webhooks returned...
          else if(res && res.body && res.body.items && res.body.items instanceof Array && node.webhookTarget) {
            _.forEach(res.body.items, function(webhook) {
              if(webhook.targetUrl == node.webhookTarget) {
                node.removeWebhook(webhook.id);
                node.log('Removed existing webhook for: ' + webhook.targetUrl);
              }
            });
            if(callback) callback(null);
          }

          // else...
          else {
            if(callback) callback(null);
          }

        });
      } else {
        if(callback) callback(null);
      }
    };

    // remove a webhook
    node.removeWebhook = function(id) {
      var webhookId = node.webhookId;

      if(typeof id !== 'undefined') {
        webhookId = id;
      }

      // if spark api token and webhook id are defined...
      if(node.profileConfig.credentials && node.profileConfig.credentials.token && webhookId) {

        // clone module request template
        var _webhookReq = _.clone(webhookReq);

        // set credentials for request object
        _webhookReq.auth = { bearer: node.profileConfig.credentials.token };

        // set delete url for request object
        _webhookReq.url = _webhookReq.url + webhookId;

        // send request to delete webhook
        request.delete(_webhookReq, function(err, res) {
          // if request error...
          if(err) {
            node.log('error: ' + err.message);
          }

          // else, if response ok or webhook not found...
          else if(res && res.statusCode && (res.statusCode == 204 || res.statusCode == 404)) {
            if(typeof id !== 'undefined') {
              node.webhookId = null;
              node.webhookObj = null;
            }
          }

          // else, response not ok...
          else {
            var statusCode = res && res.statusCode && res.statusCode > 1 ? res.statusCode : 500;
            var errorMsg = 'response code "' + res.statusCode + '" received removing webhook for "' + node.name + '"';
            node.log('error: ' + errorMsg);
          }

        });
      }
    };

    // create new webhook
    node.createWebhook = function() {

      // if spark api token and webhook target are defined...
      if(node.profileConfig.credentials && node.profileConfig.credentials.token && node.webhookTarget) {

        // clone module request template
        var _webhookReq = _.clone(webhookReq);

        // set credentials for request object
        _webhookReq.auth = { bearer: node.profileConfig.credentials.token };

        // set body for request object
        _webhookReq.body = {
          name: 'NODE-RED:' + node.id,
          targetUrl: node.webhookTarget,
          resource: node.resource,
          event: 'all'
        };

        // send request to add a webhook
        request.post(_webhookReq, function(err, res) {
          // if request error...
          if(err) {
            node.warn('error: ' + err.message);
          }

          // else, if response ok...
          else if(res && res.statusCode && res.statusCode == 200 && typeof res.body === 'object') {
            node.webhookObj = res.body;
            node.webhookId = res.body.id;
            node.log('Created webhook for: ' + node.webhookTarget);
          }

          // else, response not ok...
          else {
            var statusCode = res && res.statusCode && res.statusCode > 1 ? res.statusCode : 500;
            var errorMsg = 'response code "' + res.statusCode + '" received adding webhook for "' + node.name + '"';
            node.error('error: ' + errorMsg);
          }

        });
      }

      // else, spark api token not defined...
      else {
        var errorMsg = 'api token or webhookTarget not defined';
        node.error('error: ' + errorMsg);
      }
    };

    // indicate traffic via status
    node.reqPing = function() {
      // increment request counter
      node.reqCount++;

      var timeout;

      var online = {
        fill: 'blue',
        shape: 'ring',
        text: 'Spark Webhook: online (' + node.reqCount + ')'
      };

      var recieving = {
        fill: 'blue',
        shape: 'dot',
        text: 'Spark Webhook: online (' + node.reqCount + ')'
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

    node.processError = function(err, req, res, next) {
      node.log(err);
      res.sendStatus(500);
    };

    node.processRequest = function(req, res, next) {
      var msg = {};
      msg.payload = {};
      msg.error = null;

      // if req and res
      if(req && res) {

        // if properties in body are valid...
        if(typeof req.body === 'object' && req.body.resource && req.body.event) {

          // if webhook matches resource and event
          if(req.body.resource === node.resource && req.body.event === node.event) {

            // attach headers to msg
            msg.headers = req.headers;

            // attach message body
            msg.payload = req.body;

            // ping the metric counter
            node.reqPing();

            // send msg
            node.send(msg);
          }
        }

        // send 200 OK
        res.status(200).send('OK');
      }

      // else next
      else if(typeof next === 'function') {
        node.log('error: could not process request');
        next();
      }

      // else
      else {
        node.log('error: could not process request');
      }
    };

    // cleanup node on deploy
    node.on('close',function() {
      var node = this;

      // remove route
      RED.httpNode._router.stack.forEach(function(route,i,routes) {
        if (route.route && route.route.path.match(/^\/node_red_contrib_spark_.*/)) {
          routes.splice(i,1);
          node.log('Removed existing route for: ' + node.pathname);
        }
      });

      // remove webhook
      node.removeWebhook();
    });

    // create route for this node
    RED.httpNode.post('/' + node.basename, jsonParser, node.processRequest, node.processError);
    node.log('Created new route for: ' + node.pathname);

    // remove webhooks with same Target Url and then create a new one...
    node.removeWebhooks(function(err) {
      // create webhook
      node.createWebhook();
    });

  }

  if(RED.settings.httpNodeRoot !== false) {
    RED.httpNode.get('/webhook/cisco_spark_v1.json', function(req, res) {
      var swaggerPath = path.resolve(__dirname, './webhook/cisco_spark_v1.json');
      fs.readFile(swaggerPath, function(err, data) {
        if(err) {
          res.set('Content-Type', 'text/javascript').send('{ "error": "' + err.message + '", "message": "Error reading webhook/cisco_spark_v1.json" }');
        } else {
          res.set('Content-Type', 'text/javascript').send(data);
        }
      });
    });

  } else {
    this.warn('httpNodeRoot is disabled in node-red settings');
  }

  RED.nodes.registerType('Spark Webhook', SparkWebhookNode);
};
