// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by gembas-individual-module.js.
import { name as packageName } from "meteor/gembas-individual-module";

// Write your tests here!
// Here is an example.
Tinytest.add('gembas-individual-module - example', function (test) {
  test.equal(packageName, "gembas-individual-module");
});
