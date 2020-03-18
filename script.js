// This makes sure all of the HTML runs before the javascript
$(document).ready(function() {
  // This creates an event listener for the search button. When it is clicked, the following call-back fucntion happens
  $("#search-button").on("click", function() {
    // this variable obtains the value in the search-value ID
    var searchValue = $("#search-value").val();

    // clear input box
    // This makes it so when values are rendered, they don't get rendered twice
    $("#search-value").val("");
    // This calls the searchWeather function, passing in the searchValue parameter 
    searchWeather(searchValue);
  });
// This creates an event listener for when you click on a previously searched city that is seen below thanks to local storage
  $(".history").on("click", "li", function() {
    // It calls the searchWeather function, passing in the name of the city
    searchWeather($(this).text());
  });
  // this makeRow function dynamically creates a list item that is appended to the unordered list with the history class
  // A "text" argument must be passed into this function, and it is this "text" which will be added to the list
  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }
  // This is the searchWeather function. It needs a "searchValue" arguemnet passed in
  function searchWeather(searchValue) {
    // It makes an ajax call to an api
    $.ajax({
      // It will be getting info from the api
      type: "GET",
      // this is the url used to connect to the api. The search will use whatever searchValue was passed into it
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
      // The data will be returned in a json format
      dataType: "json",
      // If successful, this function will run using the returned dara 
      // This is an alternative to "then(response) that specifies a successful call to the api"
      success: function(data) {
        // this checks if our searchValue exists in the history aray. If it doesn't, it will add it to the array
        if (history.indexOf(searchValue) === -1) {
          // add the search value to the history array
          history.push(searchValue);
          // save a string version of the array to the local storage
          window.localStorage.setItem("history", JSON.stringify(history));
          // Call the makeRow function passing in the searchValue, so the newly searched city will be printed with the other recently searched citites
          makeRow(searchValue);
        }
        
        // clear any old content
        // We do this for the "today" div, so there's only one date showing at a time
        $("#today").empty();

        // create html content for current weather
        // this creates an h3 html element with the card-title class and the text of the city name (specifically, returned from the api), and the date. 
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        // this creates a div element with the class "card"
        var card = $("<div>").addClass("card");
        // these create <p> elements with the card-text class and text matching the properties returned from the api
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        // This creats a card body div
        var cardBody = $("<div>").addClass("card-body");
        // This creates an image tag with the source depending on the icon image assosiated with the returned data
        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        // This adds the weather icon to the h3 card title
        title.append(img);
        // this adds that card title(which has the image icon) and the three properties to the full card body div.
        cardBody.append(title, temp, humid, wind);
        // The card body div is then appended to the card div. 
        card.append(cardBody);
        // and that card div, containing all of this stuff, finally gets appended to the div with ID "today" as seen in the HTML file
        $("#today").append(card);

        // call follow-up api endpoints
        // The following two functions are defined, passing in the searchValue and the latitude and longitute of the returned api
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      },
      // Our new feature, done in our project group
        // add error handling to the ajax GET call.  The function operates if an error ia returned by ajax.
        error: function(xhr, status, error){
          // xhr.status is the error code (400, etc.), and xhr.statusText is the description ('Bad Request', etc.)
          var errorMessage = xhr.status + ': ' + xhr.statusText
          var modalTitle = $('.modal-title');
          // render the error message to the modal title h5 element
          modalTitle.text('ERROR: ' + errorMessage);
          // activate Bootstrap modal dialog
          $('#myModal').modal('show')
        }
    });
  }
  // This function is for the 5 day forecast
  function getForecast(searchValue) {
    // first we use the ajax
    $.ajax({
      // we are "getting" data
      type: "GET",
      // our URL requires the searchValue 
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
      // the data is returned in json format
      dataType: "json",
      // when succesful, the returned data is called "data" and passed into the following function
      success: function(data) {
        // overwrite any existing content with title and empty row
        // This h4 header is appended to the ID "forecast" div from the HTML
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            // This creates a div which is a column the size of 2/12ths the screen
            var col = $("<div>").addClass("col-md-2");
            // This creates a card with a blue background and white text
            var card = $("<div>").addClass("card bg-primary text-white");
            // This div will be used for the temp and humidity text
            var body = $("<div>").addClass("card-body p-2");
            // this h5 will be used for the date text
            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
            // this img will be the weather icon picture associated with that data recieved from the api 
            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            // This bit of text describes the temperature for that data
            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            // This bit of text describes the humidity for that data
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            // the image, the texts describing the temp and humidity, and the date ate put in the body div, which is put in the card div, which is pul in the col div, 
            col.append(card.append(body.append(title, img, p1, p2)));
            // which is appended to the div with the "forecast" ID and "row" class
            $("#forecast .row").append(col);
          }
          // Becasue this is a for loop, it happends 5 times
        }
      }
    });
  }
  // this function takes in the latitude and logitute pulled from the api, based off of the city that was entered
  function getUVIndex(lat, lon) {
    // first we use an ajax
    $.ajax({
      // we are "getting" data
      type: "GET",
      // we put the latitude and logitude in the URL for this api which gets the ultraviolete index
      url: "https://api.openweathermap.org/data/2.5/uvi?appid=600327cb1a9160fea2ab005509d1dc6d&lat=" + lat + "&lon=" + lon,
      // we will return the data in a json format
      dataType: "json",
      // when succsful, this function will be run with the data returned from the API being refered to as "data"
      success: function(data) {
        // this variable creates a <p> element with the following text
        var uv = $("<p>").text("UV Index: ");
        // this variable creates a span element with the btn and btn-m classes, and the text of the returned data's value
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        // this if statement changes the color using bootstap classes 
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        // Then this information on the UV index is added to the "Today" section under the wind speed.
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];
// This checks to see if the history from the local storage exists by measuring if it is greater than 0. 
// If it is, we automatically run the search weather function with the last searched city
  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }
// and using the makerow function, all the other previously searched cities are rendered to the page under the search bar
  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
