// global variables
var apiKey = "1b18ce13c84e21faafb19c931bb29331";
var savedSearches = [];

// make list of previously searched cities
var searchHistoryList = function(cityName) {
    $('.past-search:contains("' + cityName + '")').remove();

    // create entry with city name
    var searchHistoryEntry = $("<p>");
    searchHistoryEntry.addClass("past-search");
    searchHistoryEntry.text(cityName);

    // create container for entry
    var searchEntryContainer = $("<div>");
    searchEntryContainer.addClass("past-search-container");

    // append entry to container
    searchEntryContainer.append(searchHistoryEntry);

    // append entry container to search history container
    var searchHistoryContainerEl = $("#search-history-container");
    searchHistoryContainerEl.append(searchEntryContainer);

    if (savedSearches.length > 0){
        // update savedSearches array with previously saved searches
        var previousSavedSearches = localStorage.getItem("savedSearches");
        savedSearches = JSON.parse(previousSavedSearches);
    }

    // add city name to array of saved searches
    savedSearches.push(cityName);
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

    // reset search input
    $("#search-input").val("");

};

// load saved search history entries into search history container
var loadSearchHistory = function() {
    // get saved search history
    var savedSearchHistory = localStorage.getItem("savedSearches");

    // return false if there is no previous saved searches
    if (!savedSearchHistory) {
        return false;
    }

    // turn saved search history string into array
    savedSearchHistory = JSON.parse(savedSearchHistory);

    // go through savedSearchHistory array and make entry for each item in the list
    for (var i = 0; i < savedSearchHistory.length; i++) {
        searchHistoryList(savedSearchHistory[i]);
    }
};

var currentWeatherSection = function(cityName) {
    // get and use data from open weather current weather api end point
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        // get response and turn it into objects
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            // get city's longitude and latitude
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
                // get response from one call api and turn it into objects
                .then(function(response) {
                    return response.json();
                })
                // get data from response and apply them to the current weather section
                .then(function(response){
                    searchHistoryList(cityName);

                    // add current weather container with border to page
                    var currentWeatherContainer = $("#current-weather-container");
                    currentWeatherContainer.addClass("current-weather-container");

                    // add city name, date, and weather icon to current weather section title
                    var currentTitle = $("#current-title");
                    var currentDay = moment().format("M/D/YYYY");
                    currentTitle.text(`${cityName} (${currentDay})`);
                    var currentIcon = $("#current-weather-icon");
                    currentIcon.addClass("current-weather-icon");
                    var currentIconCode = response.current.weather[0].icon;
                    currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);

                    // add current temperature to page
                    var currentTemperature = $("#current-temperature");
                    currentTemperature.text("Temperature: " + response.current.temp + " \u00B0F");

                    // add current humidity to page
                    var currentHumidity = $("#current-humidity");
                    currentHumidity.text("Humidity: " + response.current.humidity + "%");

                    // add current wind speed to page
                    var currentWindSpeed = $("#current-wind-speed");
                    currentWindSpeed.text("Wind Speed: " + response.current.wind_speed + " MPH");

                    // add uv index to page
                    var currentUvIndex = $("#current-uv-index");
                    currentUvIndex.text("UV Index: ");
                    var currentNumber = $("#current-number");
                    currentNumber.text(response.current.uvi);

                    // add appropriate background color to current uv index number
                    if (response.current.uvi <= 2) {
                        currentNumber.addClass("favorable");
                    } else if (response.current.uvi >= 3 && response.current.uvi <= 7) {
                        currentNumber.addClass("moderate");
                    } else {
                        currentNumber.addClass("severe");
                    }
                })
        })
        .catch(function(err) {
            // reset search input
            $("#search-input").val("");

            // alert user that there was an error
            alert("We could not find the city you searched for. Try searching for a valid city.");
        });
};

var fiveDayForecastSection = function(cityName) {
    // get and use data from open weather current weather api end point
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        // get response and turn it into objects
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            // get city's longitude and latitude
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
                // get response from one call api and turn it into objects
                .then(function(response) {
                    return response.json();
                })
                .then(function(response) {
                    console.log(response);

                    // add 5 day forecast title
                    var futureForecastTitle = $("#future-forecast-title");
                    futureForecastTitle.text("5-Day Forecast:")

                    // using data from response, set up each day of 5 day forecast
                    for (var i = 1; i <= 5; i++) {
                        // add class to future cards to create card containers
                        var futureCard = $(".future-card");
                        futureCard.addClass("future-card-details");

                        // add date to 5 day forecast
                        var futureDate = $("#future-date-" + i);
                        date = moment().add(i, "d").format("M/D/YYYY");
                        futureDate.text(date);

                        // add icon to 5 day forecast
                        var futureIcon = $("#future-icon-" + i);
                        futureIcon.addClass("future-icon");
                        var futureIconCode = response.daily[i].weather[0].icon;
                        futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`);

                        // add temp to 5 day forecast
                        var futureTemp = $("#future-temp-" + i);
                        futureTemp.text("Temp: " + response.daily[i].temp.day + " \u00B0F");

                        // add humidity to 5 day forecast
                        var futureHumidity = $("#future-humidity-" + i);
                        futureHumidity.text("Humidity: " + response.daily[i].humidity + "%");
                    }
                })
        })
};

// called when the search form is submitted
$("#search-form").on("submit", function() {
    event.preventDefault();
    
    // get name of city searched
    var cityName = $("#search-input").val();

    if (cityName === "" || cityName == null) {
        //send alert if search input is empty when submitted
        alert("Please enter name of city.");
        event.preventDefault();
    } else {
        // if cityName is valid, add it to search history list and display its weather conditions
        currentWeatherSection(cityName);
        fiveDayForecastSection(cityName);
    }
});

// called when a search history entry is clicked
$("#search-history-container").on("click", "p", function() {
    // get text (city name) of entry and pass it as a parameter to display weather conditions
    var previousCityName = $(this).text();
    currentWeatherSection(previousCityName);
    fiveDayForecastSection(previousCityName);

    //
    var previousCityClicked = $(this);
    previousCityClicked.remove();
});

loadSearchHistory();


// var apiKey = "879ab931ba9c327586dda3cbb343f7c6";
// var savedSearch = [];


// const searchHistoryList = cityName => {
//     $(`.past-search:contains("${cityName}")`).remove();

//     const searchHistoryEntry = $("<p>").addClass("previous-search-city").text(cityName);
//     const searchEntryContainer = $("<div>").addClass("previous-search-container").append(searchHistoryEntry);

//     const searchHistoryContainerEl = $("#search-history-container");
//     searchHistoryContainerEl.append(searchEntryContainer);

//     let savedSearches = [];
//     if (savedSearches.length > 0) {
//         const previousSavedSearches = localStorage.getItem("savedSearches");
//         savedSearches = JSON.parse(previousSavedSearches) || [];
//     }

//     // Add city name to array of saved searches
//     savedSearches.push(cityName);
//     localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

//     // Reset search input
//     $("#search-input").val("");
// };
// var loadSearchHistory = function() {
//     var savedSearchHistory = localStorage.getItem("savedSearches");
//     if (!savedSearchHistory) {
//       return false;
//     }
//     savedSearchHistory = JSON.parse(savedSearchHistory);
  
//     savedSearchHistory.forEach(function(cityName) {
//       searchHistoryList(cityName);
//     });
//   };
//   const currentWeatherSection = async (cityName) => {
//     try {
//       const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`);
//       const currentWeather = await response.json();
  
//       const { lon: cityLon, lat: cityLat } = currentWeather.coord;
  
//       const oneCallResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`);
//       const oneCallData = await oneCallResponse.json();
  
//       searchHistoryList(cityName);
//       const currentWeatherContainer = $("#current-weather-container");
//       currentWeatherContainer.addClass("current-weather-container");
      
//       const currentTitle = $("#current-title");
//       const currentDay = moment().format("M/D/YYYY");
//       currentTitle.text(`${cityName} (${currentDay})`);
//       const currentIcon = $("#current-weather-icon");
//       currentIcon.addClass("current-weather-icon");
//       const currentIconCode = oneCallData.current.weather[0].icon;
//       currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);
  
//       const currentTemperature = $("#current-temperature");
//       currentTemperature.text(`Temperature: ${oneCallData.current.temp} \u00B0F`);
  
//       const currentHumidity = $("#current-humidity");
//       currentHumidity.text(`Humidity: ${oneCallData.current.humidity}%`);
  
//       const currentWindSpeed = $("#current-wind-speed");
//       currentWindSpeed.text(`Wind Speed: ${oneCallData.current.wind_speed} MPH`);
  
//       const currentUvIndex = $("#current-uv-index");
//       currentUvIndex.text("UV Index: ");
//       const currentNumber = $("#current-number");
//       currentNumber.text(oneCallData.current.uvi);
  
//       if (oneCallData.current.uvi <= 2) {
//         currentNumber.addClass("favorable");
//       } else if (oneCallData.current.uvi >= 3 && oneCallData.current.uvi <= 7) {
//         currentNumber.addClass("moderate");
//       } else {
//         currentNumber.addClass("severe");
//       }
//     } catch (err) {
//       $("#search-input").val("");
//       alert("Sorry, no luck, try again!");
//     }
//   };
//   const fiveDayForecastSection = cityName => {
//     const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;
//     fetch(url)
//       .then(response => response.json())
//       .then(response => {
//         const { lon: cityLon, lat: cityLat } = response.coord;
//         const oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`;
//         fetch(oneCallUrl)
//           .then(response => response.json())
//           .then(response => {
//             console.log(response);
            
//             const futureForecastTitle = $("#future-forecast-title");
//             futureForecastTitle.text("5-Day Forecast:");
  
//             for (let i = 1; i <= 5; i++) {
//               const futureCard = $(`.future-card:nth-child(${i})`);
//               futureCard.addClass("future-card-details");
  
//               const futureDate = $("#future-date-" + i);
//               const date = moment().add(i, "d").format("M/D/YYYY");
//               futureDate.text(date);
  
//               const futureIcon = $("#future-icon-" + i);
//               futureIcon.addClass("future-icon");
//               const futureIconCode = response.daily[i].weather[0].icon;
//               futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`);
  
//               const futureTemp = $("#future-temp-" + i);
//               futureTemp.text(`Temp: ${response.daily[i].temp.day} \u00B0F`);
  
//               const futureHumidity = $("#future-humidity-" + i);
//               futureHumidity.text(`Humidity: ${response.daily[i].humidity}%`);
//             }
//           });
//       });
//   };
  

//   $("#search-form").on("submit", function() {
//     event.preventDefault();
    
//     // get name of city searched
//     var cityName = $("#search-input").val();

//     if (cityName === "" || cityName == null) {
//         //send alert if search input is empty when submitted
//         alert("Please enter name of city.");
//         event.preventDefault();
//     } else {
//         // if cityName is valid, add it to search history list and display its weather conditions
//         currentWeatherSection(cityName);
//         fiveDayForecastSection(cityName);
//     }
// });

//   $("#search-history-container").on("click", "p", function() {
//     const previousCityName = $(this).text();
//     currentWeatherSection(previousCityName);
//     fiveDayForecastSection(previousCityName);

//     const previousCityClicked = $(this);
//     previousCityClicked.remove();
// });

// loadSearchHistory();

  
  

  



















