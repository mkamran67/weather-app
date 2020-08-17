//  1. Search listener or History Click listener -> Run()
//  2. Parse Search input
//  3. Check if City is valid not empty.
//  4. Load relevent City Weather information

//  Variables

// Run Function on document ready
$('document').ready(() => {
  $('#btnSubmit').on('click', submitInput);
});

// Submit City Function
async function submitInput(e, cityName = '') {
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
  } else {
    console.log(`Empty`);
  }

  // If not Empty or Space
  if (cityName !== '' && regSpace.test(cityName) === true) {
    // Get coordinates
    let cityCoordinatesString = await getCoordstring(cityName);

    weatherObj = await getWeather(cityCoordinatesString.mainQString);

    setDisplay(cityCoordinatesString.trueName, weatherObj);
  } else {
    console.log(`Empty`);
  }
}
async function getCoordstring(city) {
  console.log(`coooordinates`);

  let mainQString = ``,
    trueName = '';
  let cordinatesUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=1a0eaaf9b7dc51f4a1835f73728c07a2`;

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

function setDisplay(name, weatherObj) {
  // Set Main Information
  $('#cityDate').text(`${name} ${moment().format('DD MM YYYY')}`);
}

function setLocalStorage(cityName) {
  // Adds name to array.
  let temp = [];

  if (getLocalStorage() !== null) {
    temp = getLocalStorage();
    // Check for duplicates
    // TODO:
    // if(temp.indexOf(cityName) !== -1){
    // }
  }

  temp.push(cityName);

  localStorage.setItem('citylist', JSON.stringify(temp));
}
// Returns null if nothing in storage
function getLocalStorage() {
  // Returns an array of city names or null
  return localStorage.getItem('citylist') !== null
    ? JSON.parse(localStorage.getItem('citylist'))
    : null;
}
