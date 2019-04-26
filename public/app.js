
$.getJSON("/articles", function(data) {

    for (var i = 0; i < data.length; i++) {
      // Find the right div and the correct path to the id, title, link in the response object
      var article = $('<div class="article"></div>');
      $(article).append("<h4 data-id='" + data[i]._id + "'>" + data[i].title + "</h4>");
      $(article).append("<a data-id='" + data[i]._id + "' class='btn btn-primary newComment'>Add a New Comment</a>");
      $(article).append("<a data-id='" + data[i]._id + "' class='btn btn-primary'>View All Comments</a>");
      $(article).append("<a href='" + data[i].link + "' target='_blank' class='btn btn-primary'>View Article</a>");
      $("#articles").append(article);
    }
  });
  
  
  // Whenever someone clicks an a tag
  $(document).on("click", "a.newComment", function() {
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the comment information to the page
      .then(function(data) {
        console.log(data);
        
        $("#comments").empty();
        // The title of the article
        $("#comments").append("<h5>" + data.title + "</h5>");
        // An input to enter a new comment title
        $("#comments").append("<input id='titleinput' class='form-control' name='title' placeholder='Comment Title'>");
        // A textarea to add a new comment body
        $("#comments").append("<textarea id='bodyinput' class='form-control' name='body' placeholder='Your Comment'></textarea>");
        // A button to submit a new comment, with the id of the article saved to it
        $("#comments").append("<button data-id='" + data._id + "' id='savecomment' class='btn btn-primary'>Save Comment</button>");
  
        // If there's a note in the article
        if (data.comments) {
          // Place the title of the comment in the title input
          $("#titleinput").val(data.comments.title);
          // Place the body of the comment in the body textarea
          $("#bodyinput").val(data.comments.body);
        }
      });
  });
  
  // When you click the savecomment button

  //NEED TO MAKE SURE WE'RE ADDING ANOTHER COMMENT, NOT REPLACING LIKE IN THE CLASS EXAMPLE!!!!
  $(document).on("click", "#savecomment", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#comments").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  