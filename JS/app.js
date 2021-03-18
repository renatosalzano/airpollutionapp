//AIR POLLUTION APP
//RENATO SALZANO
//STAR2IMPACT PROJECT

'use strict'

//VAR
const search = document.querySelector('#search');
const gps = document.querySelector('#gps');
const token = (process.env.API_KEY);

let statusBar = document.querySelector('.statusBar');
let screen = document.querySelector('.screen');
let header = document.querySelector('.header')
let searchBar = document.querySelector('.searchBar');
let cardBox = document.querySelector('.cardBox');
let resultBox;
let inputList;
let datalist;
let inputValue;

//GET REQUEST TO ALLOW POSITION
window.addEventListener('load', () => {
  const status = document.querySelector('#status');

  if(!navigator.geolocation) {
    gps.style.color = 'gray'
  } else {
    gps.classList.add('pending')
    navigator.geolocation.getCurrentPosition(success,error);
  }

  function success() {
    gps.classList.add('success')
    status.textContent = '';

  }

  function error() {
    gps.classList.add('err')
    status.textContent = 'Geolocation is not supported by your browser';
    statusBar.classList.add('err');
    statusBar.classList.add('collapse');
  }
});

gps.addEventListener('click', () => {

  const status = document.querySelector('#status');

  if(!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by your browser';
    statusBar.classList.add('err');
    statusBar.classList.add('collapse');
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }

  //IF USER ALLOW POSITION
  function success(position) {
    status.textContent = '';
    if(gps.classList.contains('err')) {
      gps.classList.remove('err');
    }
    gps.classList.add('success')

    const lat  = position.coords.latitude;
    const long = position.coords.longitude;
    
    getData(lat, long);
  }

  function error() {
    status.textContent = 'Unable to retrieve your location';
    gps.classList.add('err')
    statusBar.classList.add('err');
  }
});

let input = document.input.city

search.addEventListener('click', () => {

  const api = `https://api.waqi.info/search/?token=${token}&keyword=${input.value}`

  if(input.value == '') {
    input.placeholder = 'Please, type something'
  }else{

  fetch(api)
    .then(response => {
      return response.json();
    })
    .then(data => {
      const _data = data.data;
      console.log(_data)

      //fix
      let patt = new RegExp(/[,|;| |-]/gi)
      inputValue = input.value.replace(patt, '').toLowerCase();
      console.log(inputValue)
          
      //for(let i = 0; i < _data.length; i++) { console.log(_data[i].station.name.replace(patt, ' ').toLowerCase()) }
          
      let testing = "\\b" +inputValue+ "\\b";
         
      let regValue = new RegExp(inputValue)
      let regValueFix = new RegExp(testing, 'gi')

      //Frist filter
      let result = _data.filter(_data => 
      regValue.test(_data.station.name.replace(patt, '').toLowerCase()));

      //Sec filter input word by word
      let resultFix = result.filter(result => 
      regValueFix.test(result.station.name.replace(patt, ' ').toLowerCase()));

      if(resultFix.length == 0) {
        //if array is empty restore frist result
        resultFix = result;
      }
      processResult(resultFix);
          
    });
  };
});

function processResult(result) {

  if(result.length > 1) {
    //console.log('array')
    console.log(result)
    createList(inputValue);
    datalist = document.querySelector('.datalist')

    for(let i = 0; i < result.length; i++) {
      
      let option = document.createElement('span')
      option.classList.add('option')
              
      option.innerHTML = result[i].station.name;
      datalist.appendChild(option);

      option.onclick = () => {
      //console.log(result[i].station.geo[0], result[i].station.geo[1])

      getData(result[i].station.geo[0], result[i].station.geo[1]);
      resultBox.remove();
      search.classList.remove('hidden');
      searchBar.value = result[i].station.name.split(', ')[0];
                  
      }
    }

  }else if(result.length == 1){
    //console.log('one result')
    getData(result[0].station.geo[0], result[0].station.geo[1]);
  }else{
    //console.log('no results')
    screen.classList.add('upper');
    header.classList.add('headerUp');
    cardBox.innerHTML = `Sorry, it seems there are no results for "${input.value}" `;
    cardBox.classList.add('noResult');
  }

}



function createList(result) {
  
  resultBox = document.createElement('div');
  inputList = document.createElement('input');
  datalist = document.createElement('div');
  let closeBtn = document.createElement('div');

  inputList.value = result
  inputList.classList.add('barStyle');
  inputList.classList.add('open');
  datalist.classList.add('datalist');
  resultBox.classList.add('resultBox')
  resultBox.classList.add('shadow');
  search.classList.add('hidden');
  closeBtn.classList.add('closeBtn');
  closeBtn.innerHTML = '<span class="iconify" data-icon="mdi:close" data-inline="false"></span>'
  
  inputList.setAttribute('type', 'text');
  searchBar.insertAdjacentElement('afterend',resultBox);
  resultBox.appendChild(inputList);
  resultBox.appendChild(closeBtn);
  inputList.insertAdjacentElement('afterend',datalist);

  inputList.onclick = () => {
    inputList.classList.toggle('open');
    resultBox.classList.toggle('shadow');
    datalist.classList.toggle('close');
  }
  inputList.oninput = () => {
    if(inputList.value == '') {
      if(search.classList.contains('hidden')) {
        search.classList.remove('hidden');
      }
      resultBox.remove();
      searchBar.value = '';
    }
  }
  window.addEventListener('click', function(e){   
    if (!resultBox.contains(e.target)){
      if(inputList.classList.contains('open')){
        //close list
        inputList.click();
      }
    }
  });
  closeBtn.onclick = () => {
    //remove result
    search.classList.remove('hidden')
    resultBox.remove();
  };

}
function getData(lat, long) {
  const api = `https://api.waqi.info/feed/geo:${lat};${long}/?token=${token}`;

  fetch(api)
        .then(response => {
          return response.json();
      })
        .then(data => {
        console.log(data.data)
        const _data = data.data;
        let city = _data.city.name.split(', ')[0];
        let station = _data.city.name.split(', ')[1];
        let aqiNum = _data.aqi;
        //pollution var
        let pm25;
        let pm10;
        let no2;
        let o3;
        
        try {
          pm25 = _data.iaqi.pm25.v;
        }catch (err) {
          pm25 = 0;
        }
        try {
          pm10 = _data.iaqi.pm10.v;
        }catch (err) {
          pm10 = 0;
        }
        try {
          no2 = _data.iaqi.no2.v;
        }catch (err) {
          no2 = 0;
        }
        try {
          o3 = _data.iaqi.o3.v;
        }catch (err) {
          o3 = 0;
        }
        
        if(city == undefined) {city = station};
        if(station == undefined) {station = ''};
        //console.log(city, station, aqiNum, pm25, pm10, no2, o3);
        showResult(city, station, aqiNum, pm25, pm10, no2, o3)
      });
}
function showResult(city, station, aqiNum, pm25, pm10, no2, o3) {
  if(cardBox.classList.contains('noResult')) {
    cardBox.classList.remove('noResult');
  }
  screen.classList.add('upper');
  header.classList.add('headerUp');
  //create card
  cardBox.innerHTML = `<span class='city alertBG'>${city}</span>
  <span class='station alertBG'>${station}</span>
  <div class="aqi alertBG">
  <span class='aqiNum'>${aqiNum}</span><span class='aqiNam'>AQI</span>
  </div>
  <span class="alert alertBG"></span>
  <div class="tips"></div>
  <span class="gtitle">MAIN POLLUTANTS</span>
  <div class="graph">
  <div class="grid">
  <div class="bar4 bar"></div>
  <div class="bar3 bar"></div>
  <div class="bar2 bar"></div>
  <div class="bar1 bar"></div>
  <div class="bar0 bar"></div>
  </div>
  
  <span class="pm25 ps">PM2.5</span>
  <span class="pm25g gbox"></span>
  <span class="pm10 ps">PM10</span>
  <span class="pm10g gbox"></span>
  <span class="no2 ps">NO<sub>2</sub></span>
  <span class="no2g gbox"></span>
  <span class="o3 ps">O<sub>3</sub></span>
  <span class="o3g gbox"></span>
  </div>`;

  //ALERT BG COLOR
  let alertBg = document.querySelectorAll('.alertBG');
  let alert = document.querySelector('.alert');
  let aqiNumber = aqiNum;
  let tips = document.querySelector('.tips');
  for(let i = 0; i < alertBg.length; i++) {
  switch(true) {
    case aqiNumber <= 50:
      alertBg[i].classList.add('good');
      alert.innerHTML = 'Good';
      tips.innerHTML = 'Air quality is considered satisfactory, and air pollution poses little or no risk.'
    break;
    case aqiNumber > 50 && aqiNumber < 100:
      alertBg[i].classList.add('moderate');
      alert.innerHTML = 'Moderate'
      tips.innerHTML = 'Air quality is acceptable.<br> However, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.'
    break;
    case aqiNumber > 100 && aqiNumber < 150:
      alertBg[i].classList.add('bitUnhealthy');
      alert.innerHTML = 'Unhealthy for Sensitive Groups'
      tips.innerHTML = 'Members of sensitive groups may experience health effects.<br> The general public is not likely to be affected.'
    break;
    case aqiNumber > 150 && aqiNumber < 200:
      alertBg[i].classList.add('unhealthy');
      alert.innerHTML = 'Unhealthy'
      tips.innerHTML = 'Everyone may begin to experience health effects.<br>Members of sensitive groups may experience more serious health effects'
    break;
    case aqiNumber > 200 && aqiNumber < 300:
      alertBg[i].classList.add('veryUnhealthy');
      alert.innerHTML = 'Very Unhealthy'
      tips.innerHTML = 'Health warnings of emergency conditions.<br>The entire population is more likely to be affected.'
    break;
    case aqiNumber >= 300:
      alertBg[i].classList.add('hazard');
      alert.innerHTML = 'Hazardous'
      tips.innerHTML = 'Health alert: everyone may experience more serious health effects'
    break;
  }
  }
  //GRAPH--------------------------------------
  

  let pm10g = document.querySelector('.pm10g');
  let pm25g = document.querySelector('.pm25g');
  let no2g = document.querySelector('.no2g');
  let o3g = document.querySelector('.o3g');

  //pm10
  switch(true) {
    //good
    case pm10 == 0:
      pm10g.style.setProperty('--h', '0%')
    break;
    case pm10 > 0 && pm10 <= 50:
      pm10g.style.setProperty('--h', '16%')
      pm10g.style.setProperty('--color', 'rgb(108, 153, 24)')
    break;
    //moderate
    case pm10 > 50 && pm10 <= 100:
      pm10g.style.setProperty('--h', '32%')
      pm10g.style.setProperty('--color', 'rgb(25, 174, 219)')
    break;
    //bit unh
    case pm10 > 100 && pm10 <= 250:
      pm10g.style.setProperty('--h', '48%')
      pm10g.style.setProperty('--color', 'rgb(235, 157, 12)')
    break;
    //unh
    case pm10 > 250 && pm10 <= 350:
      pm10g.style.setProperty('--h', '65%')
      pm10g.style.setProperty('--color', 'rgb(221, 10, 10)')
    break;
    //very unh
    case pm10 > 350 && pm10 <= 430:
      pm10g.style.setProperty('--h', '75%')
      pm10g.style.setProperty('--color', 'rgb(153, 25, 25)')
    break;
    //hazard
    case pm10 >= 430:
      pm10g.style.setProperty('--h', '100%')
      pm10g.style.setProperty('--color', 'rgb(153, 25, 25)')
    break;
  }
  //pm25
  switch(true) {
    case pm25 == 0:
      pm25g.style.setProperty('--h', '0%')
    break;
    //good
    case pm25 > 0 && pm25 <= 30:
      pm25g.style.setProperty('--h', '16%')
      pm25g.style.setProperty('--color', 'rgb(108, 153, 24)')
    break;
    //moderate
    case pm25 > 30 && pm25 <= 60:
      pm25g.style.setProperty('--h', '32%')
      pm25g.style.setProperty('--color', 'rgb(25, 174, 219)')
    break;
    //bit unh
    case pm25 > 60 && pm25 <= 90:
      pm25g.style.setProperty('--h', '48%')
      pm25g.style.setProperty('--color', 'rgb(235, 157, 12)')
    break;
    //unh
    case pm25 > 90 && pm25 <= 120:
      pm25g.style.setProperty('--h', '65%')
      pm25g.style.setProperty('--color', 'rgb(221, 10, 10)')
    break;
    //very unh
    case pm25 > 120 && pm25 <= 250:
      pm25g.style.setProperty('--h', '75%')
      pm25g.style.setProperty('--color', 'rgb(153, 25, 25)')
    break;
    //hazard
    case pm25 >= 250:
      pm25g.style.setProperty('--h', '100%')
      pm25g.style.setProperty('--color', 'rgb(153, 25, 25)')
    break;
  }
  //no2
  switch(true) {
    case no2 == 0:
      no2g.style.setProperty('--h', '0%')
    break;
    //good
    case no2 > 0 && no2 <= 40:
      no2g.style.setProperty('--h', '16%')
      no2g.style.setProperty('--color', 'rgb(108, 153, 24)')
    break;
    //moderate
    case no2 > 40 && no2 <= 80:
      no2g.style.setProperty('--h', '32%')
      no2g.style.setProperty('--color', 'rgb(25, 174, 219)')
    break;
    //bit unh
    case no2 > 80 && no2 <= 180:
      no2g.style.setProperty('--h', '48%')
      no2g.style.setProperty('--color', 'rgb(235, 157, 12)')
    break;
    //unh
    case no2 > 180 && no2 <= 280:
      no2g.style.setProperty('--h', '65%')
      no2g.style.setProperty('--color', 'rgb(221, 10, 10)')
    break;
    //very unh
    case no2 > 280 && no2 <= 400:
      no2g.style.setProperty('--h', '75%')
      no2g.style.setProperty('--color', 'rgb(153, 25, 25)')
    break;
    //hazard
    case no2 >= 400:
      no2g.style.setProperty('--h', '100%')
      no2g.style.setProperty('--color', 'rgb(153, 25, 25)')
    break;
  }
  //o3
  switch(true) {
    case o3 == 0:
      o3g.style.setProperty('--h', '0%')
    break;
    //good
    case o3 > 0 && o3 <= 50:
      o3g.style.setProperty('--h', '16%')
      o3g.style.setProperty('--color', 'rgb(108, 153, 24)')
    break;
    //moderate
    case o3 > 50 && o3 <= 100:
      o3g.style.setProperty('--h', '32%')
      o3g.style.setProperty('--color', 'rgb(25, 174, 219)')
    break;
    //bit unh
    case o3 > 100 && o3 <= 170:
      o3g.style.setProperty('--h', '48%')
      o3g.style.setProperty('--color', 'rgb(235, 157, 12)')
    break;
    //unh
    case o3 > 170 && o3 <= 210:
      o3g.style.setProperty('--h', '65%')
      o3g.style.setProperty('--color', 'rgb(221, 10, 10)')
    break;
    //very unh
    case o3 > 210 && o3 <= 750:
      o3g.style.setProperty('--h', '75%')
      o3g.style.setProperty('--color', 'rgb(153, 25, 25)')
    break;
    //hazard
    case o3 >= 750:
      o3g.style.setProperty('--h', '100%')
      o3g.style.setProperty('--color', 'rgb(153, 25, 25)')
    break;
  }
  


}

searchBar.addEventListener("keydown", function (evt) {
  if (evt.defaultPrevented) {
    return;
  }

  switch (evt.key) {
    
    case "Enter":
      search.click();
      break;

    default:
      return;
  }
  evt.preventDefault();
}, true);

