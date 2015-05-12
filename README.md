# numtel:pg [![Build Status](https://travis-ci.org/numtel/meteor-pg.svg?branch=master)](https://travis-ci.org/numtel/meteor-pg)

Reactive PostgreSQL for Meteor

Provides Meteor integration of the [`pg-live-select` NPM module](https://github.com/numtel/pg-live-select), bringing reactive `SELECT` statement result sets from PostgreSQL >= 9.3.

> If you do not have PostgreSQL server already installed, you may use [the numtel:pg-server Meteor Package](https://github.com/numtel/meteor-pg-server) to bundle the PostgreSQL server directly to your Meteor application.

* [How to publish joined queries that update efficiently](https://github.com/numtel/meteor-pg/wiki/Publishing-Efficient-Joined-Queries)
* [Leaderboard example modified to use PostgreSQL](https://github.com/numtel/meteor-pg-leaderboard)
* [Reactive MySQL for Meteor](https://github.com/numtel/meteor-mysql)

## Server Implements

This package provides the `LivePg` class as defined in the [`pg-live-select` NPM package](https://github.com/numtel/pg-live-select).

Also exposed on the server is the `pg` object as defined in the [`node-postgres` NPM package](https://github.com/brianc/node-postgres) (useful for other operations like `INSERT` and `UPDATE`).

### `LivePg.prototype.select()`

In this Meteor package, the `SelectHandle` object returned by the `select()` method is modified to act as a cursor that can be published.

```javascript
var liveDb = new LivePg(CONNECTION_STRING, CHANNEL);

Meteor.publish('allPlayers', function(){
  return liveDb.select('SELECT * FROM players ORDER BY score DESC');
});
```

## Client/Server Implements

### `PgSubscription([connection,] name, [args...])`

Constructor for subscribing to a published select statement. No extra call to `Meteor.subscribe()` is required. Specify the name of the subscription along with any arguments.

The first argument, `connection`, is optional. If connecting to a different Meteor server, pass the DDP connection object in this first argument. If not specified, the first argument becomes the name of the subscription (string) and the default Meteor server connection will be used.

The prototype inherits from `Array` and is extended with the following methods:

Name | Description
-----|--------------------------
`change([args...])` | Change the subscription's arguments. Publication name and connection are preserved.
`addEventListener(eventName, listener)` | Bind a listener function to this subscription
`removeEventListener(eventName)` | Remove listener functions from an event queue
`dispatchEvent(eventName, [args...])` | Call the listeners for a given event, returns boolean
`depend()` | Call from inside of a Template helper function to ensure reactive updates
`reactive()` | Same as `depend()` except returns self
`changed()`| Signal new data in the subscription
`ready()` | Return boolean value corresponding to subscription fully loaded
`stop()` | Stop updates for this subscription

**Notes:**

* `changed()` is automatically called when the query updates and is most likely to only be called manually from a method stub on the client.
* Event listener methods are similar to native methods. For example, if an event listener returns `false` exactly, it will halt listeners of the same event that have been added previously. A few differences do exist though to make usage easier in this context:
  * The event name may also contain an identifier suffix using dot namespacing (e.g. `update.myEvent`) to allow removing/dispatching only a subset of listeners.
  * `removeEventListener()` and `dispatchEvent()` both refer to listeners by name only. Regular expessions allowed.
  * `useCapture` argument is not available.

#### Event Types

Name | Listener Arguments | Description
-----|-------------------|-----------------------
`update` | `diff, data` | New change, before data update
`updated` | `diff, data` | New change, after data update
`reset` | `msg` | Subscription reset (most likely due to code-push), before update

## Closing connections between hot code-pushes

With Meteor's hot code-push feature, new triggers and functions on database server are created with each restart. In order to remove old items, a handler to your application process's `SIGTERM` signal event must be added that calls the `cleanup()` method on each `LivePg` instance in your application. Also, a handler for `SIGINT` can be used to close connections on exit.

On the server-side of your application, add event handlers like this:

```javascript

var liveDb = new LivePg(CONNECTION_STRING, CHANNEL);

var closeAndExit = function() {
  // Call process.exit() as callback
  liveDb.cleanup(process.exit);
};

// Close connections on hot code push
process.on('SIGTERM', closeAndExit);
// Close connections on exit (ctrl + c)
process.on('SIGINT', closeAndExit);
```

## Tests / Benchmarks

The test suite does not require a separate Postgres server installation as it uses [the `numtel:pg-server` package](https://github.com/numtel/meteor-pg-server) to run the tests.

The database connection settings must be configured in `test/settings/local.json`.

The database specified should be an empty database with no tables because the tests will create and delete tables as needed.

```bash
# Install Meteor
$ curl -L https://install.meteor.com/ | /bin/sh

# Clone Repository
$ git clone https://github.com/numtel/meteor-pg.git
$ cd meteor-pg

# Optionally, configure port and data dir in test/settings/test.pg.json.
# If changing port, keep port value updated in test/index.es6 as well.

# Test database will be created in dbtest directory.

# Run test server
$ meteor test-packages ./

```

## License

MIT
