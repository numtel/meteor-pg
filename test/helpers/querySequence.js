var Future = Npm.require('fibers/future');
// Execute a sequence of queries on a node-pg database connection
// @param {object} connStr - Postgres connection string
// @param {boolean} debug - Print queries as they execute (optional)
// @param {[string]} queries - Queries to execute, in order
// @param {function} callback - Call when complete
querySequence = function(connStr, debug, queries, callback){
  var fut = new Future();
  if(debug instanceof Array){
    callback = queries;
    queries = debug;
    debug = false;
  }
  pg.connect(connStr, Meteor.bindEnvironment(function(error, client, done) {
    if(error) return fut['throw'](error);
    var results = [];
    var sequence = queries.map(function(queryStr, index, initQueries){
      return function(){
        debug && console.log('Query Sequence', index, queryStr);

        // Allow parameter array
        var params;
        if(queryStr instanceof Array) {
          params = queryStr[1];
          queryStr = queryStr[0];
        }

        client.query(queryStr, params,
          Meteor.bindEnvironment(function(err, rows){
            if(err) return fut['throw'](err);
            results.push(rows);
            if(index < sequence.length - 1){
              sequence[index + 1]();
            }else{
              done();
              fut['return'](results);
            }
          })
        );
      }
    });

    sequence[0]();
  }));
  return fut.wait();
};
