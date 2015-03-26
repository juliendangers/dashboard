'use strict';

module.exports = function (logger) {
  var env = require('common-env')(logger);

  return env.getOrElseAll({
    jira: {
      user: '',
      password: '',
      host: 'compagny.atlassian.net',
      port: 443
    },
    mongodb: {
      host: '127.0.0.1',
      port: 27017,
      database: {
        default: 'dashboard-rd'
      }
    },
    host: '127.0.0.1',
    port: 8080
  });
};
