# node-red-contrib-spark

[Node-RED](http://nodered.org) Nodes to integrate with the [Cisco Spark API](https://developer.ciscospark.com).

![](https://github.com/nmarus/node-red-contrib-spark/raw/master/images/flow01.jpg)

### Nodes

* **api** - This Node receives queries on the input that are then sent to the Spark API. The results are provided at the output.
* **webhook** - This Node creates, removes, and manages the Webhook features of the Spark API. Once deployed, and subsequently triggered, the contents of the notification will be sent to the output of this Node.
* **parser** - This is a utility Node that accepts input from the output of either the Api or Webhook Node. This acts similarly to the `map` functionality provided in many programming languages and additionally provides options when dealing with input that is in the form of a collection (array of objects).
* **auth** - This is a Config Node that holds the credential Bearer Token for the Spark API. Once initially defined, either under the Api or Webhook Node, it will be available to select on all other Api and Webhook Nodes that are created. You can define multiple Auth profiles so as to work with different Spark Accounts or Bots within the same flow.

### Install

The simplest installation method is done via Node-RED itself. In the "Manage Palette" menu dropdown, search for this module by name. Alternate methods are outlined below.

**Via the node-red-admin CLI tool:**

```bash
# install node-red-admin if needed
npm install -g node-red-admin

# authenticate if your Node-RED administration has been secured
node-red-admin login

# install the module
node-red-admin install node-red-contrib-spark
```

**Via source:**
```bash
# clone repo
git clone https://github.com/nmarus/node-red-contrib-spark
cd node-red-contrib-spark

# get submodule
git submodule init
git submodule update

# from your node-red installation directory
npm install /path/to/node-red-contrib-spark
```

**Via NPM repository:**
```bash
# from your node-red installation directory
npm install node-red-contrib-spark
```

## API Node

The Spark API Node sends REST queries via messages received by the input connector in the `msg.payload` object. Results of the API call are provided at the output in the `msg.payload` object.

![](https://github.com/nmarus/node-red-contrib-spark/raw/master/images/api-node.jpg)

#### Module Input

The Spark API request is passed as a JSON object in `msg.payload`. The `msg.payload` object can be an empty object `{}` or contain optional path, query-string, or body variables provided using `"key": "value"` object parameters. Depending on the particular API method, the `"key": "value"` properties are defined in either the `msg.payload` object or the `msg.payload.body` object.

#### Module Output

By convention the output from the Spark API call will have a `msg.payload` property containing the results of the API call in JSON format. The format of this JSON object will be the same as documented at [developer.ciscospark.com](https://developer.ciscospark.com) for the responses from the API call.

Additionally the following are defined as part of the msg object:

* `msg.status` : http return code
* `msg.error` : error object (will evaluate to `null` when no error is present)
  * `msg.error.message` : error message
  * `msg.error.description` : error description (only available for certain errors)
  * `msg.error.trackingId` : tracking id (only available for certain errors)
* `msg.headers` - response headers object
* `msg._msgid` - unique identifier

**Example: Get Person by Email**

The following object would be sent in the `msg.payload` input to a Spark API Node setup for `People.getPeople`:

```json
{
  "email": "person@example.com"
}
```

**Example: Get Rooms by Type**

The following object would be sent in the `msg.payload` input to a Spark API Node setup for `Rooms.getRooms`:

```json
{
  "body": {
    "type": "group"
  }
}
```

**Example: Update a Room Title**

The following object would be sent in the `msg.payload` input to a Spark API Node setup for `Rooms.updateRoom`:

```json
{
  "roomId": "someSparkRoomIdString",
  "body": {
    "title": "My Renamed Room"
  }
}
```

**Example: Create a New Message**

The following object would be sent in the `msg.payload` input to a Spark API Node setup for `Messages.createMessage`:

```json
{
  "body": {
    "roomId": "someSparkRoomIdString",
    "text": "Hello World!"
  }
}
```

**Example: Add Person by Email to a Room**

The following object would be sent in the `msg.payload` input to a Spark API Node setup for `Memberships.createMembership`:

```json
{
  "body": {
    "roomId": "someSparkRoomIdString",
    "personEmail": "person@emaple.com"
  }
}
```

#### Configuration Options

* **Profile** - The Spark credential profile to use with this Node.
* **Resource** - The Spark resources for the API action.
* **Method** - The specific method available to the selected Spark resource.

## Webhook Node

The Spark Webhook Node is triggered when a resource event is matched. When the Node is deployed, it automatically creates the associated Cisco Spark Webhook. When the Node is removed, the Webhook reference is automatically removed in the Spark API.

![](https://github.com/nmarus/node-red-contrib-spark/raw/master/images/webhook-node.jpg)

**Example Output : `msg.payload`**

```json
{
    "id": "Y2lzY29zcGFyazovL3VzL1dFQkhPT0svNzJkYzlhNTctYmY4MC00OTdjLWFhM2MtNjMyYzUyOThkMTFk",
    "name": "Test",
    "targetUrl": "http://myhost.com:3000/spark388d9fffca49b8",
    "resource": "messages",
    "event": "created",
    "ownedBy": "creator",
    "created": "2016-10-23T19:50:23.484Z",
    "data": {
        "id": "Y2lzY29zcGFyazovL3VzL01FU1NBR0UvZjgyOGM3YTAtOTk1OS0xMWU2LTk5ODYtYzc4MTAwYzIyYTJm",
        "roomId": "Y2lzY29zcGFyazovL3VzL1JPT00vNjNhYzQ3MzAtOTUzYy0xMWU2LWEwZmQtNDcxNWExOWY2ZDJi",
        "roomType": "group",
        "personId": "Y2lzY29zcGFyazovL3VzL1BFT1BMRS8zYzNlZmYxOS04Njg1LTQ2OTEtODViOS1lZjRmMTViZDk2ZDQ",
        "personEmail": "nmarus@gmail.com",
        "created": "2016-10-23T19:50:37.594Z"
    }
}
```

#### Configuration Options

* **Profile** - The Spark credential profile to use with this Node.
* **Resource** - The Spark resource to bind a Webhook to.
* **Event** - The specific event of the resource selected.
* **Host** - The base URL that is used to build the Webhook in the Spark API. This should be reachable from the internet and follow the format of `http(s)://domain.tld:<port>`. The Webhook Node will dynamicly publish webroutes under this URL as `/spark<node-uuid>`. *Note that the Webhook is automatically created in the Spark API after deploying and automatically removed if the Node is deleted and the flow re-deployed*

## Parser Node

The Spark Parse Node allows parsing of messages received from either the Webhook or API Node. The parsed value is placed in the `msg.payload` of the first output. The value of the "parse" field is delivered in `msg.topic` for use with supporting functions like `join`. The original `msg.payload` is passed through to the second output.

The output specifies how the `msg.payload` is formatted. Options are:
  <ul>
    <li>original - The original value of the property without modifying data
    type.</li>
    <li>object - The original value of the property placed into an object with
    the object key being the parser value, or optionally the topic if
    specified.</li>
  </ul>
</p>

If the parser input receives an array, each element of the array is parsed individually. The results are returned as multiple sequential messages to the output with each msg having a `msg.payload` and `msg.topic` property.

![](https://github.com/nmarus/node-red-contrib-spark/raw/master/images/parser-node.jpg)

#### Configuration Options

* **Parse** - The object property to parse from the input.
* **Output** - The selector on how to handle parsed output:
    * **the individual property value** - Outputs the original value of the property without modifying data type.
    * **a key/value object** - Outputs the original value of the property placed into an object with the object key being the parser value, or optionally the topic if specified.
* **Topic** - By default, the value of "parse" is used as msg.topic. This can be overridden here if needed.

## License

MIT License Copyright (c) 2016 Nicholas Marus

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
