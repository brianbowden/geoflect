var _ = require('underscore');

var formatGuidForUrl = function(guid) {
  return guid.replace(/[\s&\/\\#,+()$~%.\-_'":*?<>{}]/g,'');
}

module.exports = { 'formatGuidForUrl': formatGuidForUrl }