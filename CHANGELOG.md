#### 2.0.5: Maintenance Release

  - Fixed issues with existing API Nodes not loading node form parameters on page refresh.
  - Attempt to fix why nodes are not showing on palette when viewing on nodered.org.
  - Changed references from httpAdmin to httpNode.
  - Fixed issue with webhook node nott showing form elements once a profile is created when webhook node is first node to be initialized.

#### 2.0.4: Maintenance Release

  - Fixed issue #1. Custom httpAdminRoot or httpNodeRoot in settings will now work.
  - Fixed potential race condition between page loading and swagger file being parsed.
  - Tweaked webhook cleanup functions.

#### 2.0.2: Maintenance Release

  - updated api node handling of empty responses

#### 2.0.1: Maintenance Release

  - updated error handling of api node
  - updated swagger definitions

#### 2.0.0: Major Release

  - updated all node inline documentation and label formats
  - api node now sends array responses as individual sequential messages
  - parse node rebuilt to allow more than 1 property to be parsed from payload
  - updated README.md to include updated documentation around parse and api node

#### 1.1.1: Maintenance Release

  - updated README.md typos

#### 1.1.0: Feature Release

  - added msg.topic to api node output that contains api resource and method
  - simplified parser node
  - updated swagger definition files to include new APIs for people, organizations, licenses, and roles

#### 1.0.4: Maintenance Release

  - added msg.topic to parser node output that contains the parser

#### 1.0.3: Maintenance Release

  - updated documentation and corrected typos
  - added parser node

#### 1.0.2: Maintenance Release

  - reduced file sizes
  - changed timing of form population loading after node-red restart and browser refresh
  - added additional help text to auth config node
  - added this CHANGLOG.md file...

#### 1.0.1: Maintenance Release

  - updated node labels to "api" and "webhook"
  - updated node category to "cisco_spark"

#### 1.0.0: Initial Release
