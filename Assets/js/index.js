// global variables
let apiKey = "d91f911bcf2c0f925fb6535547a5ddc9";
let savedSearches = [];

const createSearchHistoryEntry = (cityName) => {
  const searchHistoryEntry = $("<p>");
  searchHistoryEntry.addClass("past-search");
  searchHistoryEntry.text(cityName);
  return searchHistoryEntry;
};

const createSearchHistoryContainer = (searchHistoryEntry) => {
  const searchEntryContainer = $("<div>");
  searchEntryContainer.addClass("past-search-container");
  searchEntryContainer.append(searchHistoryEntry);
  return searchEntryContainer;
};

const appendSearchHistoryToContainer = (searchHistoryContainer) => {
  const searchHistoryContainerEl = $("#search-history-container");
  searchHistoryContainerEl.append(searchHistoryContainer);
};

const updateSavedSearches = (cityName) => {
  const previousSavedSearches = localStorage.getItem("savedSearches");
  savedSearches = previousSavedSearches
    ? JSON.parse(previousSavedSearches)
    : [];
  savedSearches.push(cityName);
  localStorage.setItem("savedSearches", JSON.stringify(savedSearches));
};

const resetSearchInput = () => {
  $("#search-input").val("");
};

// make list of previously searched cities
var searchHistoryList = (cityName) => {
  $(".past-search:contains(" + cityName + ")").remove();
  const searchHistoryEntry = createSearchHistoryEntry(cityName);
  const searchHistoryContainer =
    createSearchHistoryContainer(searchHistoryEntry);
  appendSearchHistoryToContainer(searchHistoryContainer);
  updateSavedSearches(cityName);
  resetSearchInput();
};

const getSavedSearchHistory = () => localStorage.getItem("savedSearches");

const parseSavedSearchHistory = (savedSearchHistory) =>
  savedSearchHistory ? JSON.parse(savedSearchHistory) : false;

// load saved search history entries into search history container
var loadSearchHistory = () => {
  const savedSearchHistory = getSavedSearchHistory();
  const parsedSavedSearchHistory = parseSavedSearchHistory(savedSearchHistory);
  if (!parsedSavedSearchHistory) {
    return false;
  }
  parsedSavedSearchHistory.forEach(searchHistoryList);
};

var currentWeatherSection = async function (cityName) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
    );
    const { coord } = await response.json();
    const oneCallResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`
    );
    const weatherData = await oneCallResponse.json();

    searchHistoryList(cityName);

    const currentWeatherContainer = $("#current-weather-container");
    currentWeatherContainer.addClass("current-weather-container");

    const currentTitle = $("#current-title");
    const currentDay = moment().format("M/D/YYYY");
    currentTitle.text(`${cityName} (${currentDay})`);

    const currentIcon = $("#current-weather-icon");
    currentIcon.addClass("current-weather-icon");
    const currentIconCode = weatherData.current.weather[0].icon;
    currentIcon.attr(
      "src",
      `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`
    );

    const currentTemperature = $("#current-temperature");
    currentTemperature.text(`Temperature: ${weatherData.current.temp} \u00B0F`);

    const currentHumidity = $("#current-humidity");
    currentHumidity.text(`Humidity: ${weatherData.current.humidity}%`);

    const currentWindSpeed = $("#current-wind-speed");
    currentWindSpeed.text(`Wind Speed: ${weatherData.current.wind_speed} MPH`);

    const currentUvIndex = $("#current-uv-index");
    currentUvIndex.text("UV Index: ");
    const currentNumber = $("#current-number");
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
      "We could not find the city you searched for. Try searching for a valid city."
    );
  }
};

const fiveDayForecastSection = async (cityName) => {
  const weatherResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
  );
  const weatherData = await weatherResponse.json();

  const cityLon = weatherData.coord.lon;
  const cityLat = weatherData.coord.lat;

  const forecastResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`
  );
  const forecastData = await forecastResponse.json();

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

const handleFormSubmit = (cityName) => {
  if (!cityName) {
    alert("Please enter name of city.");
    return;
  }
  currentWeatherSection(cityName);
  fiveDayForecastSection(cityName);
};

$("#search-form").on("submit", (event) => {
  event.preventDefault();
  handleFormSubmit($("#search-input").val());
});

$("#search-history-container").on("click", "p", function () {
  handleFormSubmit($(this).text());
  $(this).remove();
});

loadSearchHistory();
