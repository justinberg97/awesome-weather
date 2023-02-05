// global variables
let apiKey = "d91f911bcf2c0f925fb6535547a5ddc9";
let savedSearches = [];

var createSearchHistoryEntry = (cityName) => {
  var searchHistoryEntry = $("<p>");
  searchHistoryEntry.addClass("past-search");
  searchHistoryEntry.text(cityName);
  return searchHistoryEntry;
};

var createSearchHistoryContainer = (searchHistoryEntry) => {
  var searchEntryContainer = $("<div>");
  searchEntryContainer.addClass("past-search-container");
  searchEntryContainer.append(searchHistoryEntry);
  return searchEntryContainer;
};

var appendSearchHistoryToContainer = (searchHistoryContainer) => {
  var searchHistoryContainerEl = $("#previous-history-container");
  searchHistoryContainerEl.append(searchHistoryContainer);
};

var updateSavedSearches = (cityName) => {
  var previousSavedSearches = localStorage.getItem("savedSearches");
  savedSearches = previousSavedSearches
    ? JSON.parse(previousSavedSearches)
    : [];
  savedSearches.push(cityName);
  localStorage.setItem("savedSearches", JSON.stringify(savedSearches));
};

var resetSearchInput = () => {
  $("#search-input").val("");
};

// make list of previously searched cities
var searchHistoryList = (cityName) => {
  $(".past-search:contains(" + cityName + ")").remove();
  var searchHistoryEntry = createSearchHistoryEntry(cityName);
  var searchHistoryContainer =
    createSearchHistoryContainer(searchHistoryEntry);
  appendSearchHistoryToContainer(searchHistoryContainer);
  updateSavedSearches(cityName);
  resetSearchInput();
};

var getSavedSearchHistory = () => localStorage.getItem("savedSearches");

var parseSavedSearchHistory = (savedSearchHistory) =>
  savedSearchHistory ? JSON.parse(savedSearchHistory) : false;

// load saved search history entries into search history container
var loadSearchHistory = () => {
  var savedSearchHistory = getSavedSearchHistory();
  var parsedSavedSearchHistory = parseSavedSearchHistory(savedSearchHistory);
  if (!parsedSavedSearchHistory) {
    return false;
  }
  parsedSavedSearchHistory.forEach(searchHistoryList);
};

var todayWeatherSection = async function (cityName) {
  try {
    var response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
    );
    var { coord } = await response.json();
    var oneCallResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`
    );
    var weatherData = await oneCallResponse.json();

    searchHistoryList(cityName);

    var currentWeatherContainer = $("#today-weather-container");
    currentWeatherContainer.addClass("today-weather-container");

    var currentTitle = $("#current-title");
    var currentDay = moment().format("M/D/YYYY");
    currentTitle.text(`${cityName} (${currentDay})`);

    var currentIcon = $("#current-weather-icon");
    currentIcon.addClass("current-weather-icon");
    var currentIconCode = weatherData.current.weather[0].icon;
    currentIcon.attr(
      "src",
      `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`
    );

    var currentTemperature = $("#current-temperature");
    currentTemperature.text(`Temperature: ${weatherData.current.temp} \u00B0F`);

    var currentHumidity = $("#current-humidity");
    currentHumidity.text(`Humidity: ${weatherData.current.humidity}%`);

    var currentWindSpeed = $("#current-wind-speed");
    currentWindSpeed.text(`Wind Speed: ${weatherData.current.wind_speed} MPH`);

    var currentUvIndex = $("#current-uv-index");
    currentUvIndex.text("UV Index: ");
    var currentNumber = $("#current-number");
    currentNumber.text(weatherData.current.uvi);

    if (weatherData.current.uvi <= 2) {
      currentNumber.addClass("favorable");
    } else if (weatherData.current.uvi >= 3 && weatherData.current.uvi <= 7) {
      currentNumber.addClass("moderate");
    } else {
      currentNumber.addClass("severe");
    }
  } catch (err) {
    $("#search-input").val("");
    alert(
      "No luck, try again!."
    );
  }
};

var fiveDayForecastSection = async (cityName) => {
  var weatherResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
  );
  var weatherData = await weatherResponse.json();

  var cityLon = weatherData.coord.lon;
  var cityLat = weatherData.coord.lat;

  var forecastResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`
  );
  var forecastData = await forecastResponse.json();

  console.log(forecastData);

  $("#future-forecast-title").text("5-Day Forecast:");

  for (let i = 1; i <= 5; i++) {
    $(".future-card").addClass("future-card-details");
    $("#future-date-" + i).text(moment().add(i, "d").format("M/D/YYYY"));

    $("#future-icon-" + i)
      .addClass("future-icon")
      .attr(
        "src",
        `https://openweathermap.org/img/wn/${forecastData.daily[i].weather[0].icon}@2x.png`
      );

    $("#future-temp-" + i).text(
      `Temp: ${forecastData.daily[i].temp.day} \u00B0F`
    );

    $("#future-humidity-" + i).text(
      `Humidity: ${forecastData.daily[i].humidity}%`
    );
  }
};

var handleFormSubmit = (cityName) => {
  if (!cityName) {
    alert("Please enter name of city.");
    return;
  }
  todayWeatherSection(cityName);
  fiveDayForecastSection(cityName);
};

$("#search-form").on("submit", (event) => {
  event.preventDefault();
  handleFormSubmit($("#search-input").val());
});

$("#previous-history-container").on("click", "p", function () {
  handleFormSubmit($(this).text());
  $(this).remove();
});

loadSearchHistory();
