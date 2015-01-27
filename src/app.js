/*
* OverThere
* Copyright Pending
* Written by Priansh Shah, Andrew Jones, and Lucas Ochoa for the Connected Challenge Hack A Team online hackathon
*/

var UI = require('ui'); //sets up UI for usage
var ajax = require("ajax");
var lat = 0;
var long = 0; 
var main = new UI.Card({
  title: 'OverThere',
  subtitle: 'Downloading nearby locations...',
  body: 'The first iteration of this assembly only supports nearby restaurants.'
}); //card for graphics and UI for downloader
main.show();
var cat = "";

var categories = [
  {
    title: "ATM",
    subtitle: "atm"
  },
  {
    title:"Bakery",
    subtitle:"bakery"
  },
  {
    title: "Bank",
    subtitle:"bank"
  },
  {
    title:"Bar/Club",
    subtitle:"bar|club"
  },
  {
    title:"Beauty",
    subtitle:"beauty_salon"
  },
  {
    title:"Books",
    subtitle:"book_store|library"
  },
  {
    title:"Cafe",
    subtitle:"cafe"
  },
  {
    title:"Recreation",
    subtitle:"campground"
  },
  {
    title:"Cars",
    subtitle:"car_dealer|car_rental|car_repair|car_wash"
  },
  {
    title:"Casino",
    subtitle:"casino"
  },
  {
    title:"Clothing",
    subtitle:"clothing_store"
  },
  {
    title:"General Store",
    subtitle:"convenience_store"
  },
  {
    title:"Dining/Food",
    subtitle:"meal_delivery|meal_takeaway|restaurant"
  },
  {
    title:"Emergency",
    subtitle:"fire_station|police|hospital"
  },
  {
    title:"Government",
    subtitle:"bank|city_hall|embassy|courthouse|post_office|local_government_office|lawyer"
  },
  {
    title:"Health",
    subtitle:"dentist|doctor|hospital|health|insurance agency"
  },
  {
    title:"Hotels",
    subtitle:"lodging"
  },
  {
    title:"Schools",
    subtitle:"school"
  }
];

var catList = new UI.Menu({
  sections: [{
    title: 'Choose a category:',
    items: categories
  }]
});

catList.show();
main.hide();
catList.show();
var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8";

var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 0
};
function addToUrl(x){
  url+="&&" + x; //add x and format for api
  console.log('URL is now: ' + url); //log for debugger
}

function setLatLong(pos){
  lat = pos.coords.latitude;
  console.log('Lat:' + pos.coords.latitude);
  long = pos.coords.longitude;
  addToUrl("location=" + lat + "," + long+"");
  rankBy("distance", true);
} //sets up lat and long, logs lat for debugging

function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
}//handles errors 

console.log("got before selection candidate");//CAT HANDLER

catList.on('select', function(event) {
  console.log("Selected item");
     cat=categories[event.itemIndex].subtitle;
  console.log(cat);
    console.log(categories[event.itemIndex].subtitle);
  navigator.geolocation.getCurrentPosition(setLatLong, locationError, locationOptions); //async func to get lat/long coords
console.log("began nav");
});

console.log("SKIPPED OVER?!");
function rankBy(rank, open){
  addToUrl("rankby=" + rank);
  addToUrl("type=" + cat);
  if(open){
    addToUrl("opennow");}
  ajax({url: url, type: 'json'},
  function(json) {
      // Convert temperature
    var locList = [
      {
        title:""
      }
    ];
    var index =0;
    for(var loc in json.results){
      locList.unshift({title:"x",subtitle:"x"}); console.log(locList[index].title);
      index++;
    }
    for(var x in locList){
      locList[x.itemIndex].title=json.results[x.itemIndex].name;
      console.log(locList[x.itemIndex].title);
    }
    locList.reverse();
    console.log(locList[0] + " " + locList[1]);
    var resultsJson = new UI.Menu({
      sections: [{
      title:'Results',
      items: locList
      }]
    });
resultsJson.show();
  },
  function(error) {
    console.log('Ajax failed: ' + error);
  }
);

console.log("almost to the end");
}
