var loggly = require('loggly');
var client = loggly.createClient({
  token: '19d77c53-74b4-44da-804c-f3af4a77631a',
  subdomain: 'elemyntic',
  auth:  {
    username: 'bicx',
    password: process.env.LOGGLY_PS
  },
  tags: ["NodeJS"],
  json: true
});

var log = function(logEntry, tag) {
  debugger;
  client.log(logEntry, tag);
  console.log(logEntry, tag);
};

if (require.main === module) {
  log({lolzerskates: "Hello World from Node.js! This is a test."});
}

module.exports = { 'log': log };