# node-red-contrib-spark

![](/images/flow01.jpg)

### Install

**Via Source:**
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

**Via NPM Repository:**
```bash
# from your node-red installation directory
npm install node-red-contrib-spark
```

## API Node

The Spark API Node sends REST queries via messages received by the input connector in the `msg.payload object`. Results of the API call are provided at the output in the `msg.payload` object.

#### Module Input

The Spark API request is passed as a JSON object in `msg.payload`. The `msg.payload` object can be an empty object or contain optional path, query-string, or body variables provided using `"key": "value"` object parameters. Depending on the particular API method, the `"key": "value"` properties are defined in either the `msg.payload` object or the `msg.payload.body` object.

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

## Webhook Node

The Spark Webhook Node is triggered when a resource event is matched. When the node is deployed, it automatically creates the associated Cisco Spark Webhook. When the Node is removed, the Webhook reference is automatically removed in the Spark API.

**Example Output**

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

## License
MIT License
Copyright (c) 2016 Nicholas Marus <nmarus@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
