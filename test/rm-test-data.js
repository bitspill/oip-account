var rimraf = require('rimraf');

try {
	rimraf(__dirname + "/../localStorage", function(){})
	rimraf(__dirname + "/../db.json", function(){})
} catch (e) {}