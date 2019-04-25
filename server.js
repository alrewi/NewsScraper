var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

//CORRECT THIS
var PORT = 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

//CORRECT THIS?
mongoose.connect("mongodb://localhost/onionScraperDB", { useNewUrlParser: true });

//.headline for the headline of the article
//document.querySelectorAll(".js_entry-link")
app.get("/scrape", function(req, res) {
  axios.get("https://local.theonion.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    var result = {};
    //Figure out how to grab the right pieces from the response
    $("h1.headline").each(function(i, element) {
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Check the comments model to make sure this works
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({_id: req.params.id})
  .populate("comments")
  .then(function(dbArticle){
    res.json(dbArticle);
  })
  .catch(function(err){
    res.json(err);
  });
});

//Check the comments model to make sure this works
app.post("/articles/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(function(dbComment) {
      return db.Article.findOneAndUpdate({_id: req.params.id}, { comments: dbComment._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
