/*
* OverThere
* Copyright Pending
* Written by Priansh Shah, Andrew Jones, and Lucas Ochoa for the Connected Challenge Hack A Team online hackathon
*/

var UI = require('ui'); //sets up UI for usage
var ajax = require("ajax"); //ajax for communication
var lat = 0; //latitude
var long = 0;  //longitude
var locList = []; //list of locations
var errorHandler; //errorCode log num
var main = new UI.Card({
  title: 'OverThere',
  subtitle: 'Downloading nearby locations...',
  body: 'The first iteration of this assembly only supports nearby restaurants.'
}); //card for graphics and UI for downloader
main.show();
var cat = ""; //category
var resultsJson; //results list
var categories = [
  {
    title:"Reset",
    subtitle:"If the app has stopped working"
  },
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
]; //NOTE THIS SHOULD GO IN A SERVER NOW.

var catList = new UI.Menu({
  sections: [{
    title: 'Choose a category:',
    items: categories
  }]
}); //list of categories

catList.show();
main.hide();
catList.show(); //show categories
var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8"; //url

var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 0
}; //location configuration settings

function addToUrl(x){
  url+="&&" + x; //add x and format for api
  console.log('URL is now: ' + url); //log for debugger
} //add a param

var errorPage = new UI.Card(
{
  title: "Error" + errorHandler,
  subtitle:"There was an error processing your request.",
  body:"Please try again. If the problem persists please contact us at hellopriansh@gmail.com with the error # in the subject."
}); //error handling 

function setLatLong(pos){
  lat = pos.coords.latitude;
  console.log('Lat:' + pos.coords.latitude);
  long = pos.coords.longitude;
  addToUrl("location=" + lat + "," + long+"");
  if(lat !== null && long!==null && lat!== undefined && long!==undefined)
  {  rankBy("distance", true); errorPage.hide();}
  else{
    navigator.geolocation.getCurrentPosition(setLatLong, locationError, locationOptions);
    errorHandler = 555;
    errorPage.show();
    errorPage.title="Error 555";
    errorPage.hide();
    errorPage.show();
  } //handle error
} //sets up lat and long, logs lat for debugging

function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
}//handles errors 

console.log("got before selection candidate");//CAT HANDLER debug thing

function resetApp(){
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8";
    catList.show();
    console.log("reset");
} //reset

catList.on('select', function(event) {
  console.log("Selected item");
  if(categories[event.itemIndex].title=="Reset"){
    resetApp();
  }
  else{
     cat=categories[event.itemIndex].subtitle;
  console.log(cat);
    console.log(categories[event.itemIndex].subtitle);
  navigator.geolocation.getCurrentPosition(setLatLong, locationError, locationOptions); //async func to get lat/long coords
    console.log("began nav");}
}); //when selecting a category, either reset or set category

console.log("SKIPPED OVER?!");
function rankBy(rank, open){
  addToUrl("rankby=" + rank);
  addToUrl("type=" + cat);
  if(open){
    addToUrl("opennow");}
  ajax({url: url, type: 'json'},
  function(json) {
      // Convert temperature
locList=[];
    var index =0;
    for(var i=0; i<json.results.length; i++){
      locList.unshift({title:"x",subtitle:"x"}); console.log(locList[index].title);
      index++;
    }
    for(var j = 0; j<locList.length; j++){
      locList[j].title=json.results[j].name;
      locList[j].subtitle=json.results[j].vicinity;
      console.log(locList[j].title + " " + locList[j].subtitle);
      index++;
    }
    locList.unshift({title:"Reset", subtitle:"If the results are blatantly wrong"});
    console.log(locList[0] + " " + locList[1]);
    resultsJson = new UI.Menu({
      sections: [{
      title:'Results',
      items: locList
      }]
    });
resultsJson.show();
    
resultsJson.on('select', function(event) {
  if(locList[event.itemIndex].title=="Reset"){
    resetApp();
    console.log("reset");
  }
  console.log("RESULTS CLICK HANDLER ON");
});
  },
  function(error) {
    console.log('Ajax failed: ' + error);
  }
);
  
//the above basically makes arrays of Json datas and then gets the data and sets the data and displays it too
  
//needs damn cleaning and spilliting into multiple files but meh 
  
  
console.log("almost to the end"); //morre debug shit for async qualitative timing 
}

