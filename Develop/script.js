// Had to comment out Geo location due to Github complaining.
//  Variables
// let initial = true;

// Run Function on document ready
$('document').ready(() => {
  let clientCity = '';

  $('#btnSubmit').on('click', controllerFunc);
  $('#citySearch').keypress((e) => {
    if (e.which === 13) {
      submitInput();
      e.preventDefault();
    }
  });

  $('#searchHistory').on('click', historyClick);

  if (localStorage.getItem('citylist') !== null) {
    let lastAdd = getLocalStorage();
    submitInput(lastAdd[0]);
    displayHistoryList();
  } else {
    submitInput('Berkeley');
  }
  // Commented out due to Github blocking my Geo API.
  // if (initial) {
  //   submitInput();
  //  } else {
  // let lastAdd = getLocalStorage();
  // submitInput(lastAdd[0]);
  // }
});

function historyClick(e) {
  if (e.target.innerText !== null) {
    submitInput(e.target.innerText);
  }
}

// async function initGeo() {
//   let data = '';
//   await $.ajax({
//     method: 'GET',
//     url: 'http://ip-api.com/json/',
//   }).then((res) => {
//     data = res.city;
//   });
//   return data;
// }

function controllerFunc(e) {
  e.preventDefault();
  submitInput();
}

// Submit City Function
async function submitInput(cityName = '') {
  // if (initial) {
  //   cityName = await initGeo();
  // }
  console.log(cityName);
  let regSpace = new RegExp(/^ /);
  // Will hold weather data
  let weatherObj = {};
  // Get text from input -> if no argument passed
  if (cityName === '') {
    cityName = $('#citySearch').val();
  }

  if (cityName !== '' && /\S/.test(cityName)) {
    // Remove spaces from the begining
    while (regSpace.exec(cityName) !== null) {
      cityName = cityName.substr(1);
      console.log(cityName);
    }

    // Get coordinates
    let cityCoordinatesString = await getCoordstring(cityName);
    // Get Weather Details as -> Object
    weatherObj = await getWeather(cityCoordinatesString.mainQString);

    // Send Name and Weather Object
    setDisplay(cityCoordinatesString.trueName, weatherObj);
    // initial = false;
  } else {
    console.log(`Empty`);
  }
}
async function getCoordstring(city) {
  let mainQString = ``,
    trueName = '';
  let cordinatesUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=1a0eaaf9b7dc51f4a1835f73728c07a2`;

  await $.ajax({
    method: 'GET',
    url: cordinatesUrl,
  })
    .then((data) => {
      mainQString = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&units=imperial&exclude=minutely,hourly&appid=1a0eaaf9b7dc51f4a1835f73728c07a2`;
      trueName = data.name;
    })
    .fail(() => {
      console.log(`Failed getting coordinates.`);
      alert(`Invalid name ${city}`);
    });

  // Return an object containing the string and the "correct" name
  return { mainQString, trueName };
}

async function getWeather(qString) {
  // Will store response from API
  let response = null;

  // Get OneCall API Response.
  try {
    await $.ajax({
      method: 'GET',
      url: qString,
    })
      .then((data) => {
        response = data;
      })
      .fail();
  } catch (err) {
    alert(err.responseJSON.message.toUpperCase());
    console.log(err);
  }

  return response !== null ? response : false;
}

function setDisplay(name, { current, daily }) {
  // Set Icon corresponding to current conditions
  let iconUrl = `http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;

  $('#cityDate').html(
    `
    ${name} ${moment().format('[(]MM[/]DD[/]YYYY[)]')}
    <i>
        <img src='${iconUrl}' alt='${current.weather[0].main}' />
    </i>
    `
  );

  $('#temperature span').text(current.temp);
  $('#humidity span').text(current.humidity);
  $('#windSpeed span').text(current.wind_speed);
  $('#uvIndex span').text(current.uvi);
  if (current.uvi > 8) {
    $('#uvIndex span').css('background-color', 'red');
  } else if (current.uvi > 6) {
    $('#uvIndex span').css('background-color', 'orange');
    $('#uvIndex span').css('color', 'black');
  } else if (current.uvi > 3) {
    $('#uvIndex span').css('background-color', 'green');
    $('#uvIndex span').css('color', 'white');
  } else if (current.uvi > 0) {
    $('#uvIndex span').css('background-color', '#33808D');
  }

  let cardList = ``;

  // Build List
  for (let i = 0; i < 5; i++) {
    cardList += `
    <li class="card">
        <p>${moment(daily[i].dt * 1000).format('M[/]DD[/]YYYY')}</p>
        <img src='http://openweathermap.org/img/wn/${
          daily[i].weather[0].icon
        }@2x.png' alt='${daily[i].weather[0].main}'/>
        <p>Temp: <span>${daily[i].temp.day}</span> °F</p>
        <p>Humidity: <span>${daily[i].humidity}</span>%</p>
    </li>
    `;
  }

  // Append List
  $('#forecastList').html(cardList);

  // Push City Name to Localstorage + history list
  setStorageAndDisplay(name);
}

function setStorageAndDisplay(cityName) {
  // Adds name to array.
  let arr = [];

  if (getLocalStorage() !== null && getLocalStorage().length > 0) {
    arr = [...new Set(getLocalStorage())];
    if (arr.indexOf(cityName) !== -1) {
      arr.splice(arr.indexOf(cityName), 1);
    }
  }

  arr.push(cityName);

  // Send array of city names to localstorage
  localStorage.setItem('citylist', JSON.stringify(arr));

  // Display array of
  displayHistoryList();
}
// Returns null if nothing in storage
function getLocalStorage() {
  // Returns an array of city names or null
  return localStorage.getItem('citylist') !== null
    ? JSON.parse(localStorage.getItem('citylist'))
    : null;
}

function displayHistoryList() {
  let historyList = getLocalStorage();

  // Clean Previous List

  $('#searchHistory').empty();

  // Append List
  historyList.forEach((element) => {
    $('#searchHistory').append(`<li><button>${element}</button></li>`);
  });
}
