var mocha = require("mocha"),
  assert = require("chai").assert,
  ig = require("./index");

var nock = require("nock");
var api = nock("https://www.instagram.com")
  .persist()
  .get("/explore/tags/nrkvalg")
  .replyWithFile(200, __dirname + "/fixtures/tagPage.html")
  .get(/\/p\/\w+/)
  .replyWithFile(200, __dirname + "/fixtures/postPage.html")
  .get(/\/explore\/locations\/\d+/)
  .replyWithFile(200, __dirname + "/fixtures/locationPage.html");

describe("instagram-scraper", function() {
  it("should throw error when called with missing tag argument", function(done) {
    ig.scrapeTag()
      .then(function(result) {
        assert.fail("Promise should be rejected");
        done();
      })
      .catch(function(err) {
        assert.typeOf(err, "error");
        done();
      });
  });

  it("should return object containing count, total and media", function(done) {
    ig.scrapeTag("veranda").then(function(result) {
      assert.isAtLeast(result.count, 1);
      assert.isAtLeast(result.total, 1);
      assert.equal(result.media.length, result.count);
      done();
    });
  });

  it("should throw error when called with missing code argument", function(done) {
    ig.scrapeTag()
      .then(function(result) {
        assert.fail("Promise should be rejected");
        done();
      })
      .catch(function(err) {
        assert.typeOf(err, "error");
        done();
      });
  });
});
