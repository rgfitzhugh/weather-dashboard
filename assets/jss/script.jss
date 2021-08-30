const myApiKey = "394163c97084d03ccf47705efb2c0e7b";
const apiSite = "https://api.openweathermap.org/"

var searchButtonEl = document.querySelector("#search-button");
var citiesSearchedEl = document.querySelector("#cities-searched");
var citiesSearched = [];

var addCitySearchedButton = function(cityName)
{
    var buttonEl = document.createElement("button");
    buttonEl.innerHTML = cityName;
    buttonEl.classList.add("btn","btn-sm","btn-block",);
    var citiesSearchedEl = document.querySelector("#cities-searched");
    citiesSearchedEl.appendChild(buttonEl);
}

var addCitySearched = function(cityName)
{
    if (!citiesSearched.includes(cityName))
    {
        citiesSearched.push(cityName);
        addCitySearchedButton(cityName);
        saveCitiesSearched();
    }
}
var rwfc = function(cityName)
{
    weatherInfo = JSON.parse(localStorage.getItem("weather"));
    renderWeatherForCity(weatherInfo, cityName);
    addCitySearched(cityName);
}

var getWeatherIconUrl = function(wIcon)
{
    return "https://openweathermap.org/img/wn/" + wIcon + ".png";
}

var getUviColorClass = function(uvi)
{
    var colorIndex = Math.min(Math.floor(uvi), 11);
    return "uv-" + colorIndex;
}

var renderWeatherForForecast = function(day, weather, now, forecastEl)
{
    forecastEl.style.display = "block";

    for (var i = 0; i < forecastEl.children.length; i++)
    {   
        var className = forecastEl.children[i].className;
        var fieldIndex = className.indexOf("fiveday-");
        if (fieldIndex >= 0)
        {
            fieldIndex += "fiveday-".length;
            var fieldType = className.slice(fieldIndex, fieldIndex+4);
// 5-day forcast weather information
            switch(fieldType)
            {
                case "date": 
                    var theDate = now.plus({days: day});
                    forecastEl.children[i].textContent = theDate.toLocaleString();
                break;
                case "weat": 
                    var wIconUrl = getWeatherIconUrl(weather.weather[0].icon);
                    forecastEl.children[i].src = wIconUrl;
                break;
                case "temp": 
                    forecastEl.children[i].getElementsByTagName("span")[0].textContent = weather.temp.day;
                break;
                case "wind":
                    forecastEl.children[i].getElementsByTagName("span")[0].textContent = weather.wind_speed;
                break;
                case "humi":
                    forecastEl.children[i].getElementsByTagName("span")[0].textContent = weather.humidity;
                break;
                default: // should never get here
                    alert("class is: " + className);
            }
        }
    }    
}

var renderWeatherForCity = function(weatherInfo, cityName)
{
    var now = luxon.DateTime.now();

   //Current Weather
    var currentWeather = weatherInfo.current;
    var cityDatePEl = document.querySelector("#city-date p")
    cityDatePEl.textContent =    cityName + " (" + now.toLocaleString() + ")";
    var wIconUrl = getWeatherIconUrl(currentWeather.weather[0].icon);
    document.querySelector("#weather-icon").src = wIconUrl;
    document.querySelector("#city-temp").textContent = currentWeather.temp;
    document.querySelector("#city-wind").textContent = currentWeather.wind_speed;
    document.querySelector("#city-humid").textContent = currentWeather.humidity;

    //color assigned to the UV index based on returned information
    var uviEl = document.querySelector("#city-uvindex");
    uviEl.textContent = currentWeather.uvi;
    uviEl.classList.remove("uv-0","uv-1","uv-2","uv-3","uv-4","uv-5","uv-6","uv-7","uv-8","uv-9","uv-10","uv-11");
    uviEl.classList.add(getUviColorClass(currentWeather.uvi));


    //5 day forecast
    var forecasts = document.getElementById("forecast-container").getElementsByTagName('div');
    
    for (var i = 0; i < forecasts.length; i++)
    {
        renderWeatherForForecast(i+1, weatherInfo.daily[i], now, forecasts[i]);
    }
}

var getWeatherForCity = function(cityName)
{
    var apiUrl = apiSite + "geo/1.0/direct?q=" + cityName + "&limit=1&appid=" + myApiKey;

    
    fetch(apiUrl).then(function(response)
    {
        if (response.ok)
        {
            return response.json();
         }
        else
        {
            throw Error("City Not Found");
        }
    })
    .then(function (data)
    {
        if (data.length > 0)
        {
            var oneCallUrl = "https://api.openweathermap.org/data/2.5/onecall?lat="
                    + data[0].lat
                    + "&lon="
                    + data[0].lon
                    + "&exclude=minutely,hourly,alerts&units=imperial&appid="
                    + myApiKey;
        
            return fetch(oneCallUrl);
        }
        else 
        {
            throw Error("Error: City Not Found");
        }    
    })
    .then(function (response) {
        if (response.ok)
        {
            return response.json();
        }
        else
        {
            throw Error("Can't Get Weather Data");
        }
    })
    .then(function(data) {
        renderWeatherForCity(data, cityName);
        addCitySearched(cityName);
    })
    .catch(function(error)
    {
        document.querySelector("#city-name").value = "Invalid City";
        console.log(error);
    });
}

// button click to search city
var searchClickHandler = function(event)
{
    event.preventDefault();
    
    var cityName = document.querySelector("#city-name").value.trim();
    getWeatherForCity(cityName);
}

var renderCitiesSearched = function()
{
    for (var i = 0; i < citiesSearched.length; i++)
    {
        addCitySearchedButton(citiesSearched[i]);
    }
}

var saveCitiesSearched = function()
{
    localStorage.setItem("citiesSearched", JSON.stringify(citiesSearched));
}

var loadCitiesSearched = function()
{
    citiesSearched = JSON.parse(localStorage.getItem("citiesSearched"));
    if (citiesSearched)
    {
        renderCitiesSearched();
    }
    else
    {
        citiesSearched = [];
    }
}

// Button click for previously searched city
var cityClickHandler = function(event)
{
    var cityName = event.target.textContent;
    getWeatherForCity(cityName);
}

searchButtonEl.addEventListener("click", searchClickHandler);
citiesSearchedEl.addEventListener("click", cityClickHandler);

loadCitiesSearched();