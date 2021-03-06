/* eslint-env node */

'use strict';

require('expectations');
require('../tools/text-utils');
require('./helpers/feature-emulation.helpers');
require('./helpers/jscrewit-feature.helpers');
require('./helpers/matcher.helpers');
var postrequire = require('postrequire');

global.reloadJScrewIt =
function (stubs)
{
    var newJScrewIt = postrequire('..', stubs);
    return newJScrewIt;
};

var JScrewIt = require('..');
module.exports = JScrewIt;
