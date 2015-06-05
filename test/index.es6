// numtel:pg
// MIT License, ben@latenightsketches.com
// test/index.es6

var PORT = 54321 // From test/settings/test.pg.json

var CONN_STR = Meteor.settings.connStr ||
  'postgres://' // Using numtel:pg-server to run tests
  + process.env.USER + ':' // Default user is same as system user
  + 'numtel'               // From defaultpw file in NPM package
  + '@localhost:' + PORT   // Port as specified in .pg.json file (default: 5432)
  + '/postgres'           // Default database

var CHANNEL = Meteor.settings.channel || 'test_channel'

// Configure publications
var liveDb = new LivePg(CONN_STR, CHANNEL);

Meteor.startup(function(){
  insertSampleData();

  Meteor.publish('errorRaising', function(){
    return liveDb.select('SELECT * FROM not_existing ORDER BY score DESC');
  });

  Meteor.publish('allPlayers', function(limit){
    if(typeof limit !== 'undefined') {
      check(limit, Number);
    }

    return liveDb.select(
      'SELECT * FROM players ORDER BY score DESC' +
        (typeof limit === 'number' ? ' LIMIT ' + limit : '')
    );
  });

  Meteor.publish('playerScore', function(name){
    check(name, String);
    
    return liveDb.select(
      `SELECT id, score FROM players WHERE name = $1`, [ name ],
      {
        'players': function(row){
          return row.name === name;
        }
      }
    );
  });

  Meteor.methods({
    'setScore': function(id, value){
      check(id, Number);
      check(value, Number);

      return querySequence(CONN_STR, [ [
        'UPDATE players SET score = $1 WHERE id = $2', [ value, id ]
      ] ]);
    },
    'insPlayer': function(name, score){
      check(name, String);
      check(score, Number);

      return querySequence(CONN_STR, [ [
        'INSERT INTO players (name, score) VALUES ($1, $2)',
        [ name, score ]
      ] ]);
    },
    'delPlayer': function(name){
      check(name, String);

      return querySequence(CONN_STR,
        [ [ 'DELETE FROM players WHERE name = $1', [ name ] ] ]);
    },
  });

});

var insertSampleData = function(){
  querySequence(CONN_STR, [
    `DROP TABLE IF EXISTS players`,
    `CREATE TABLE players
    (
      id serial NOT NULL,
      name character varying(50),
      score integer NOT NULL,
      CONSTRAINT players_pkey PRIMARY KEY (id)
    )
    WITH (
      OIDS=FALSE
    )`,
    `INSERT INTO players (name, score) VALUES
      ('Kepler', 40),('Leibniz',50),('Maxwell',60),('Planck',70)`
  ]);
};

