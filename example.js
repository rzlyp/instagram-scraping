let ig = require("./index");

ig.scrapeTag('veranda').then(result => {
    console.dir(result);
});
ig.scrapeUserPage('jcvrnd19').then(result => {
    console.dir(result);
});