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
      // TODO look up how this is different from then
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          // add the search value to the history array
          // TODO look up the history array
          history.push(searchValue);
          // save a string version of the array to the local storage
          window.localStorage.setItem("history", JSON.stringify(history));
          // Call the makeRow function passing in the searchValue
          makeRow(searchValue);
        }
        
        // clear any old content
        // We do this for the "today" div, so there's only one date showing at a time
        $("#today").empty();

        // create html content for current weather
        // this creates an h3 header with the card-title class and the text of the data, and the date
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        
        var card = $("<div>").addClass("card");
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        var cardBody = $("<div>").addClass("card-body");
        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#today").append(card);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?appid=600327cb1a9160fea2ab005509d1dc6d&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
