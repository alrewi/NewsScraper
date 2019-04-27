var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/onionScraperDB";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

var path = require('path');

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', '/public/index.html'));
});


//example: document.querySelectorAll(".headline")
app.get("/scrape", function(req, res) {
  axios.get("https://local.theonion.com/").then(function(response) {
    
    var $ = cheerio.load(response.data);
    var result = {};
    //Figure out how to grab the right pieces from the response
    // Don't know how to run another scrape to get article summary
    // and image which are not in an h1.headline
    // They are in .entry-summary and a <picture> 
    $("h1.headline").each(function(i, element) {
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

        
        
      console.log("result ---->", result);
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log("DB article--->", dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
      
    });
    // Want to scrape and then redirect to home page with 
    // scraped articles displaying, but
    // res.redirect("/"); here takes you all the way back  
    // no articles displaying
  });
});

app.get("/articles", function(req, res) {
  
  db.Article.find({})
    .then(function(dbArticle) {
      console.log("success!!")
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Not working
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({_id: req.params.id})
  .populate("comments")
  .then(function(data){
    var results = {
      article: data,
      comment: data.comments
    }
    res.json(data);
  })
  .catch(function(err){
    res.json(err);
  });
});

app.post("/articles/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(function(dbComment) {
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, { 
        $push: { 
          comments: dbComment._id 
        }
      }, { 
          new: true 
        });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Not working
app.delete("/comments/:commentid/:articleid", function (req, res) {
  console.log("removing a comment...");

  db.Article.update({
      _id: req.params.articleid
    }, {
      $pull: {
        comments: req.params.commentid
      }
    },
    function (error, deleted) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        console.log("comment removed from article");
        db.Note.findByIdAndRemove(req.params.commentid, function (err, removed) {
          if (err)
            res.send(err);
          else
            res.json({
              removed: 'Comment Deleted!'
            });

        });
      }
  }); 
}); 

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
