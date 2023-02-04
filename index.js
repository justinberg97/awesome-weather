var apiKey = "879ab931ba9c327586dda3cbb343f7c6";
var savedSearch = [];


const searchHistoryList = cityName => {
    $(`.past-search:contains("${cityName}")`).remove();

    const searchHistoryEntry = $("<p>").addClass("previous-search-city").text(cityName);
    const searchEntryContainer = $("<div>").addClass("previous-search-container").append(searchHistoryEntry);

    const searchHistoryContainerEl = $("#search-history-container");
    searchHistoryContainerEl.append(searchEntryContainer);

    let savedSearches = [];
    if (savedSearches.length > 0) {
        const previousSavedSearches = localStorage.getItem("savedSearches");
        savedSearches = JSON.parse(previousSavedSearches) || [];
    }

    // Add city name to array of saved searches
    savedSearches.push(cityName);
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

    // Reset search input
    $("#search-input").val("");
};
var loadSearchHistory = function() {
    var savedSearchHistory = localStorage.getItem("savedSearches");
    if (!savedSearchHistory) {
      return false;
    }
    savedSearchHistory = JSON.parse(savedSearchHistory);
  
    savedSearchHistory.forEach(function(cityName) {
      searchHistoryList(cityName);
    });
  };
  const currentWeatherSection = async (cityName) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`);
      const currentWeather = await response.json();
  
      const { lon: cityLon, lat: cityLat } = currentWeather.coord;
  
      const oneCallResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`);
      const oneCallData = await oneCallResponse.json();
  
      searchHistoryList(cityName);
      const currentWeatherContainer = $("#current-weather-container");
      currentWeatherContainer.addClass("current-weather-container");
      
      const currentTitle = $("#current-title");
      const currentDay = moment().format("M/D/YYYY");
      currentTitle.text(`${cityName} (${currentDay})`);
      const currentIcon = $("#current-weather-icon");
      currentIcon.addClass("current-weather-icon");
      const currentIconCode = oneCallData.current.weather[0].icon;
      currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);
  
      const currentTemperature = $("#current-temperature");
      currentTemperature.text(`Temperature: ${oneCallData.current.temp} \u00B0F`);
  
      const currentHumidity = $("#current-humidity");
      currentHumidity.text(`Humidity: ${oneCallData.current.humidity}%`);
  
      const currentWindSpeed = $("#current-wind-speed");
      currentWindSpeed.text(`Wind Speed: ${oneCallData.current.wind_speed} MPH`);
  
      const currentUvIndex = $("#current-uv-index");
      currentUvIndex.text("UV Index: ");
      const currentNumber = $("#current-number");
      currentNumber.text(oneCallData.current.uvi);
  
      if (oneCallData.current.uvi <= 2) {
        currentNumber.addClass("favorable");
      } else if (oneCallData.current.uvi >= 3 && oneCallData.current.uvi <= 7) {
        currentNumber.addClass("moderate");
      } else {
        currentNumber.addClass("severe");
      }
    } catch (err) {
      $("#search-input").val("");
      alert("Sorry, no luck, try again!");
    }
  };
  

  



















