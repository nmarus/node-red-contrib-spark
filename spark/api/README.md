# Webex Teams API

#### Cisco Webex Teams API version 1 Swagger Definition File.

File version v1.2.6

*Note: This is a generated README file. For details on the data types in the examples, reference the developer docs [here](https://developer.webex.com).*

## API Methods

### People

Query, Create, Update, and Delete Spark Users.

#### people.getPeople(queryObject)

Search people by email address or display name. Returns array of Person objects.

**Example queryObject:**

```json
{
  "id": "id string",
  "email": "email string",
  "displayName": "displayName string"
}
```

#### people.addPerson(queryObject)

Create a Person for a given organization. Returns Person object. Only an admin can create a new user account.

**Example queryObject:**

```json
{
  "body": {
    "emails": ["emails string", "emails string"],
    "displayName": "displayName string",
    "firstName": "firstName string",
    "lastName": "lastName string",
    "avatar": "avatar string",
    "orgId": "orgId string",
    "roles": ["roles string", "roles string"],
    "licenses": ["licenses string", "licenses string"]
  }
}
```

#### people.getPerson(queryObject)

Shows details for a person by ID. Returns Person object.

**Example queryObject:**

```json
{
  "personId": "personId string"
}
```

#### people.updatePerson(queryObject)

Update details for a person by ID. Returns Person object. Only an admin can update person details.

**Example queryObject:**

```json
{
  "body": {
    "emails": ["emails string", "emails string"],
    "displayName": "displayName string",
    "firstName": "firstName string",
    "lastName": "lastName string",
    "avatar": "avatar string",
    "orgId": "orgId string",
    "roles": ["roles string", "roles string"],
    "licenses": ["licenses string", "licenses string"]
  },
  "personId": "personId string"
}
```

#### people.deletePerson(queryObject)

Delete a Person by ID. Only an admin can remove a person.

**Example queryObject:**

```json
{
  "personId": "personId string"
}
```

#### people.getMe(queryObject)

Get the authenticated user. Returns a Person object.

**Example queryObject:**

```json
{}
```

### Rooms

Query, Create, Update, and Delete Spark Rooms.

#### rooms.getRooms(queryObject)

Get Rooms of which authenticated user belongs. Returns array of Room objects. Optionally filter by Team ID or Room type. Room type can either be 'group' or 'direct'.

**Example queryObject:**

```json
{
  "teamId": "teamId string",
  "type": "type string"
}
```

#### rooms.createRoom(queryObject)

Create a room. Returns Room object. The authenticated user is automatically added as a member of the room. See the Memberships API to learn how to add more people to the room.

**Example queryObject:**

```json
{
  "body": {
    "title": "title string",
    "teamId": "teamId string"
  }
}
```

#### rooms.getRoom(queryObject)

Shows details for a specific Room by ID. Returns Room object by ID Query.

**Example queryObject:**

```json
{
  "roomId": "roomId string"
}
```

#### rooms.updateRoom(queryObject)

Update a Room by ID. Returns Room object.

**Example queryObject:**

```json
{
  "body": {
    "title": "title string"
  },
  "roomId": "roomId string"
}
```

#### rooms.deleteRoom(queryObject)

Delete a room, by ID.

**Example queryObject:**

```json
{
  "roomId": "roomId string"
}
```

### Memberships

Query, Create, Update, and Delete Spark Room Memberships.

#### memberships.getMemberships(queryObject)

Get all room memberships. Returns array of Membership objects. By default, lists memberships for rooms to which the authenticated user belongs. Optionally can be targeted at a specific Room ID. Optionally can be filtered by either personId or personEmail.

**Example queryObject:**

```json
{
  "roomId": "roomId string",
  "personId": "personId string",
  "personEmail": "personEmail string"
}
```

#### memberships.createMembership(queryObject)

Create a Room Membership in a Room by ID. Specifcy the membership target by Person ID or Email. Returns Membership object.

**Example queryObject:**

```json
{
  "body": {
    "roomId": "roomId string",
    "personId": "personId string",
    "personEmail": "personEmail string",
    "isModerator": "true"
  }
}
```

#### memberships.getMembership(queryObject)

Get details for a membership by ID. Returns Membership object.

**Example queryObject:**

```json
{
  "membershipId": "membershipId string"
}
```

#### memberships.updateMembership(queryObject)

Update a Membership by ID. Returns Membership object.

**Example queryObject:**

```json
{
  "body": {
    "isModerator": "true"
  },
  "membershipId": "membershipId string"
}
```

#### memberships.deleteMembership(queryObject)

Delete a membership by ID.

**Example queryObject:**

```json
{
  "membershipId": "membershipId string"
}
```

### Messages

Query, Create, and Delete Spark Messages.

#### messages.getMessages(queryObject)

Get all messages in a room by ID. Returns array of Message objects.

**Example queryObject:**

```json
{
  "roomId": "roomId string",
  "mentionedPeople": "mentionedPeople string",
  "before": "before string",
  "beforeMessage": "beforeMessage string"
}
```

#### messages.createMessage(queryObject)

Create a Message. Returns Message object. Optionally, specify the message as text or markdown and include an attachment.

**Example queryObject:**

```json
{
  "body": {
    "roomId": "roomId string",
    "toPersonId": "toPersonId string",
    "toPersonEmail": "toPersonEmail string",
    "text": "text string",
    "markdown": "markdown string",
    "html": "html string",
    "files": "files string"
  }
}
```

#### messages.getMessage(queryObject)

Get a Message by ID. Returns Message object.

**Example queryObject:**

```json
{
  "messageId": "messageId string"
}
```

#### messages.deleteMessage(queryObject)

Deletes a message by ID.

**Example queryObject:**

```json
{
  "messageId": "messageId string"
}
```

### Teams

Query, Create, Update, and Delete Spark Teams.

#### teams.getTeams(queryObject)

Get Teams to which the authenticated user belongs. Returns array of Team objects.

**Example queryObject:**

```json
{}
```

#### teams.createTeam(queryObject)

Create a Team. Returns Team object. The authenticated user is automatically added as a member of the team. See the Team Memberships API to learn how to add more people to the team.

**Example queryObject:**

```json
{
  "body": {
    "name": "name string"
  }
}
```

#### teams.getTeam(queryObject)

Get Team by ID. Returns Team object.

**Example queryObject:**

```json
{
  "teamId": "teamId string"
}
```

#### teams.updateTeam(queryObject)

Update a Team by ID. Returns Team object.

**Example queryObject:**

```json
{
  "body": {
    "name": "name string"
  },
  "teamId": "teamId string"
}
```

#### teams.deleteTeam(queryObject)

Delete a team by ID.

**Example queryObject:**

```json
{
  "teamId": "teamId string"
}
```

### TeamMemberships

Query, Create, Update, and Delete Spark Team Memberships.

#### teamMemberships.getTeamMemberships(queryObject)

Get Team Memberships by ID. Returns array of TeamMembership objects. If Team ID is not specified, lists memberships for teams to which the authenticated user belongs.

**Example queryObject:**

```json
{
  "teamId": "teamId string"
}
```

#### teamMemberships.createTeamMembership(queryObject)

Create a Team Membership by Person ID or email address. Returns TeamMembership object. Optionally make membership a moderator.

**Example queryObject:**

```json
{
  "body": {
    "teamId": "teamId string",
    "personId": "personId string",
    "personEmail": "personEmail string",
    "isModerator": "true"
  }
}
```

#### teamMemberships.getTeamMembership(queryObject)

Get Team Memberships. Returns TeamMembership object.

**Example queryObject:**

```json
{
  "membershipId": "membershipId string"
}
```

#### teamMemberships.updateTeamMembership(queryObject)

UUpdate a Team Membership by ID. Returns TeamMembership object.

**Example queryObject:**

```json
{
  "body": {
    "isModerator": "true"
  },
  "membershipId": "membershipId string"
}
```

#### teamMemberships.deleteTeamMembership(queryObject)

Delete a Team Membership by ID.

**Example queryObject:**

```json
{
  "membershipId": "membershipId string"
}
```

### Webhooks

Query, Create, Update, and Delete Spark Webhooks.

#### webhooks.getWebhooks(queryObject)

Get Webhooks. Returns an array of Webhook objects.

**Example queryObject:**

```json
{}
```

#### webhooks.createWebhook(queryObject)

Create a webhook. Returns a Webhook object.

**Example queryObject:**

```json
{
  "body": {
    "name": "name string",
    "targetUrl": "targetUrl string",
    "resource": "resource string",
    "event": "event string",
    "filter": "filter string",
    "secret": "secret string"
  }
}
```

#### webhooks.getWebhook(queryObject)

Get Webhook by ID. Returns a Webhook object.

**Example queryObject:**

```json
{
  "webhookId": "webhookId string"
}
```

#### webhooks.updateWebhook(queryObject)

Update a webhook by ID. Returns a Webhook object.

**Example queryObject:**

```json
{
  "body": {
    "name": "name string",
    "targetUrl": "targetUrl string"
  },
  "webhookId": "webhookId string"
}
```

#### webhooks.deleteWebhook(queryObject)

Delete a Webhook by ID.

**Example queryObject:**

```json
{
  "webhookId": "webhookId string"
}
```

### Organizations

Query Organizations.

#### organizations.getOrganizations(queryObject)

Get Organizations for authenticated User. Returns array of Organization objects.

**Example queryObject:**

```json
{}
```

#### organizations.getOrganization(queryObject)

Get Organization by ID. Returns Organization object.

**Example queryObject:**

```json
{
  "orgId": "orgId string"
}
```

### Licenses

Query Licenses.

#### licenses.getLicenses(queryObject)

Get Licenses. Returns array of License objects.

**Example queryObject:**

```json
{}
```

#### licenses.getLicense(queryObject)

Get License by ID. Returns License object.

**Example queryObject:**

```json
{
  "licenseId": "licenseId string"
}
```

### Roles

Query Roles.

#### roles.getRoles(queryObject)

Get Roles. Returns an array of Role objects.

**Example queryObject:**

```json
{}
```

#### roles.getRole(queryObject)

Get Role by ID. Returns Role object.

**Example queryObject:**

```json
{
  "roleId": "roleId string"
}
```

### Contents

Retrieve Files.

#### contents.getContent(queryObject)

Get File contents by ID. Returns binary of file.

**Example queryObject:**

```json
{
  "contentId": "contentId string"
}
```

## API Models

#### Person

- `id` : **[string]** Person ID.
- `emails` : **[array]** Person email array.
- `displayName` : **[string]** Person display name.
- `nickName` : **[string]** Person nickname.
- `firstName` : **[string]** Person first name.
- `lastName` : **[string]** Person last name.
- `avatar` : **[string]** Person avatar URL.
- `orgId` : **[string]** Person organization ID.
- `roles` : **[array]** Person roles.
- `licenses` : **[array]** Person licenses.
- `created` : **[string]** Person creation date/time.
- `timeZone` : **[string]** Person time zone.
- `lastActivity` : **[string]** Person last active date/time.
- `status` : **[string]** Person presence status (active or inactive).
- `type` : **[string]** Person type (person or bot).


#### Room

- `id` : **[string]** Room ID.
- `title` : **[string]** Room title.
- `type` : **[string]** Room type (group or direct).
- `isLocked` : **[boolean]** Room is moderated.
- `teamId` : **[string]** Room Team ID.
- `creatorId` : **[string]** Room creator Person ID.
- `lastActivity` : **[string]** Room last activity date/time.
- `created` : **[string]** Room creation date/time.


#### Membership

- `id` : **[string]** Membership ID.
- `roomId` : **[string]** Room ID.
- `personId` : **[string]** Person ID.
- `personEmail` : **[string]** Person email.
- `personDisplayName` : **[string]** Person display name.
- `isModerator` : **[boolean]** Membership is moderator.
- `isMonitor` : **[boolean]** Membership is monitor.
- `created` : **[string]** Membership creation date/time.


#### Message

- `id` : **[string]** Message ID.
- `roomId` : **[string]** Room ID.
- `roomType` : **[string]** Room type (group or direct).
- `toPersonId` : **[string]** Person ID (for type=direct).
- `toPersonEmail` : **[string]** Person email (for type=direct).
- `text` : **[string]** Message in plain text format.
- `markdown` : **[string]** Message in markdown format.
- `html` : **[string]** Message in html format.
- `files` : **[array]** File URL array.
- `personId` : **[string]** Person ID.
- `personEmail` : **[string]** Person Email.
- `created` : **[string]** Message creation date/time.
- `mentionedPeople` : **[array]** Person ID array.


#### Team

- `id` : **[string]** Team ID.
- `name` : **[string]** Team Name.
- `creatorId` : **[string]** Team creator ID.
- `created` : **[string]** Team creation date/time.


#### TeamMembership

- `id` : **[string]** Team Membership ID.
- `teamId` : **[string]** Team ID.
- `personId` : **[string]** Person ID.
- `personEmail` : **[string]** Person email.
- `personDisplayName` : **[string]** Person display name.
- `isModerator` : **[boolean]** Team Membership is moderator.
- `created` : **[string]** Team Membership creation date/time.


#### Webhook

- `id` : **[string]** Webhook ID.
- `name` : **[string]** Webhook name.
- `targetUrl` : **[string]** Webhook target URL.
- `resource` : **[string]** Webhook resource.
- `event` : **[string]** Webhook event.
- `orgId` : **[string]** Webhook organization ID.
- `createdBy` : **[string]** Webhook created by Person ID.
- `appId` : **[string]** Webhook application ID.
- `ownedBy` : **[string]** Webhook owner Person ID.
- `filter` : **[string]** Webhook filter.
- `status` : **[string]** Webhook status.
- `secret` : **[string]** Webhook secret.
- `created` : **[string]** Webhook creation date/time.


#### Organization

- `id` : **[string]** Organization ID.
- `displayName` : **[string]** Organization Display Name.
- `created` : **[string]** Organization creation date/time.


#### License

- `id` : **[string]** License ID.
- `name` : **[string]** License Display Name.
- `totalUnits` : **[string]** License quantity total.
- `consumedUnits` : **[string]** License quantity consumed.


#### Role

- `id` : **[string]** Role ID.
- `name` : **[string]** Role Display Name.
