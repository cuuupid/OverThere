/*
* OverThere
* Copyright Priansh Shah
*/

var UI = require('ui'); //sets up UI for usage
var ajax = require("ajax"); //ajax for communication
var Settings = require("settings");
var Accel = require("ui/accel");
var Vibe = require('ui/vibe');
Accel.init();

var destination;

//var uber = require("uber");
// these are the require statements that let us use these

/* THIS IS FOR US TO RESET FAVORITES */
//Settings.data('destination',{name:"Home",location:"Home"});
var lat = 0; //latitude
var long = 0;  //longitude

var locList = []; 
//list of locations
//it's an array that will work like an array of arrays
//this is because each index is {title:x, subtitle:y}
//so it is an array of arrays; the arrays inside are really formatted menu items; so locList can be turned into a menu really easily


var errorHandler; //errorCode log num
//this is not really used too often

var main = new UI.Card({
  title: 'OverThere',
  subtitle: 'Downloading nearby locations...',
  body: 'The first iteration of this assembly only supports nearby restaurants.'
}); //card for graphics and UI for downloader
//the pebble functions using cards as pages and menus as menus
//the card is basically a white window with a <h1> title, <h2> subtitle, and <p> body
//syntax: 
/*

var cardName = new UI.Card({
  title: 'Title',
  subtitle: 'Subtitle',
  body: 'Body'
});

*/


main.show();
//this puts main in front, you can use hide to put it away

var cat = ""; //category

var resultsJson; //results list
//this will be used by ajax when it fetches the data

var categories = [
  {
    title:"Reset",
    subtitle:"If the app has stopped working"
  },
  {
    title:"Favorites"
  },
  {
    title:"Destination"
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
];
//this is like locList, it's basically a menu of categories but it's an array rn

var catList = new UI.Menu({
  sections: [{
    title: 'Choose a category:',
    items: categories
  }]
}); //list of categories
//this is how you create a menu
//sections are basically sections of the menu. the section name appears on a bar across the top of the section. when you scroll into another
//section it shows the other section's name
//syntax:
/*


var menuName = new UI.Menu({
  sections:[
    {
      title: 'section title',
      items: arrayOfCategories
    }
  ]
});


*/



catList.show();
main.hide();
catList.show(); //show categories
//this basically puts catList on top, puts away Main, and puts catList back on top just in case

var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8"; //url
//this is the base of the url; first there's the api for nearby search in http format
//next let's look at "json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8"
//first you should notice the json, this is the return type which can also be xml
//the ? indicates that the parameters of the api are being input
//key= indicates that this is our api key. we are allowed a certain number of requests per month by google. the key is unique to us for this app
//to add more parameters you go &&param=value


var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
}; //location configuration settings
//geolocation api in pebble follows w3c standards for a geoloc api, the location options are basically a set of things to follow
//first enableHighAccuracy traces us to a precise latitude and longitude
//timeout allows the request to go on for a certain amount of time on any one part before dying out
//right now timeout is set to 10000 so it waits 10seconds before exiting


function addToUrl(x){
  url+="&&" + x; //add x and format for api
  console.log('URL is now: ' + url); //log for debugger
} //add a param
//this is a method I made that adds the input to the url and logs the url
//usage: addToUrl("paramName=paramValue");
//it automates the && which is great

function checkLatLong(pos){
  var templat = pos.coords.latitude;
  console.log('Lat:' + pos.coords.latitude);
  var templong = pos.coords.longitude; 
  if(Math.abs(destination.lat-templat)<(0.00009) && Math.abs(destination.long-templong)<(0.00009)){
    var successCard = new UI.Card({title:"You're here!"}); successCard.show();
  }
  else {
    var failureCard = new UI.Card({title:"You're not here yet, false alarm!"}); failureCard.show();
  }
  //handle error if it failed
} 


var errorPage = new UI.Card(
{
  title: "Error" + errorHandler,
  subtitle:"There was an error processing your request.",
  body:"Please try again. If the problem persists please contact us at hellopriansh@gmail.com with the error # in the subject."
}); //error handling 
//not really used right now

function setLatLong(pos){
  lat = pos.coords.latitude;
  console.log('Lat:' + pos.coords.latitude);
  long = pos.coords.longitude;
  addToUrl("location=" + lat + "," + long+"");
  if(lat !== null && long!==null && lat!== undefined && long!==undefined)
  {  rankBy("distance", true); errorPage.hide(); }
  
  else
  {
    navigator.geolocation.getCurrentPosition(setLatLong, locationError, locationOptions);
    errorHandler = 555;
    errorPage.show();
    errorPage.title="Error 555";
    errorPage.hide();
    errorPage.show();
  } 
  //handle error if it failed
} 
//sets up lat and long, logs lat for debugging
//this is a function callback that occurs when the asynchronous function of geolocation api is called
//it occurs asynchronously so to solve issues and remove need for callback I just put the thread in here
//this'll be executed with the parameter pos, an object given by the geoloc api








function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
}//handles errors 
//logs that it was unable to get the location for reason err


console.log("got before selection candidate");//CAT HANDLER debug thing


function setDestination(destination){
  console.log("Setting Destination");
  var tempDest = destination;
  Settings.data('destination',tempDest);
  var successDest = new UI.Card({
    title:"Success",
    subtitle:"Destination set",
    body:"You have successfully set the destination to " + tempDest.name
  });
  console.log(JSON.stringify(Settings.data('destination')));
  successDest.show();
}

function addToFavorites(x,y){
  console.log("Adding to favorites, "+x);
  var favList = JSON.parse(Settings.data('favorites'));
  console.log("Parsed favorites to get " + JSON.stringify(favList));
  favList[0]={title:x,subtitle:y};
  favList.unshift({title:"Clear"});
  Settings.data('favorites',JSON.stringify(favList));
  var successFav = new UI.Card({
    title:"Success",
    subtitle:"Favorited",
    body:"You have successfully favorited " + x,
    scrollable:true
  });
  successFav.show();
}




function makeFavorites(){
      var favoritesMenu = new UI.Menu({
  sections:[{
    title:"Favorites",
    items:JSON.parse(Settings.data('favorites'))
  }  
  ]
}
);
  favoritesMenu.show();
  favoritesMenu.on('select', function(e){
    if((JSON.parse(Settings.data('favorites')))[e.itemIndex].title == "Clear"){
      Settings.data('favorites',null);
      favoritesMenu.hide();
    }
    else{
    var descriptCard = new UI.Card({
      title:(JSON.parse(Settings.data('favorites')))[e.itemIndex].title,
      body:(JSON.parse(Settings.data('favorites')))[e.itemIndex].subtitle
    });
      descriptCard.show();}
  });
}




function getJSON(url){
  ajax(
  {
    url:url,
    type: 'json'
  },
    function(data){
      console.log(data.information);
      var mycard =new UI.Card({title:data.information});mycard.show();
    },
    function(error){
      console.log("there was an error, "+error);
      var failure = new UI.Card({title:error}); failure.show();
  }
  );
}

getJSON("192.168.2.11");

function getRating(x,placeTitle,placeSubtitle){
  var detailsUrl = "https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8&placeid=";
  detailsUrl+=x;
  console.log(detailsUrl);
  ajax(
  {
    url:detailsUrl,
    type: 'json'
  },
  function(data) {
    console.log("THE RATING IS "+data.result.rating);
    var rating = data.result.rating;  
    if(rating === undefined || rating===null || rating<=0){
        rating = getAverageRating(x,placeTitle,placeSubtitle);
      }
    else{
      rating = rating.toFixed(2);
      var information = new UI.Card(
      {
        title: placeTitle,
        subtitle:rating+"/5",
        body:placeSubtitle,
        scrollable:true
      });
      console.log("info shown");
      information.show();}
  },
  function(error) {
    console.log('The ajax request failed: ' + error);
  }
);
}

function getAverageRating(x,placeTitle,placeSubtitle){
  var detailsUrl = "https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8&placeid=";
  detailsUrl+=x;
  console.log(detailsUrl);
  ajax(
  {
    url:detailsUrl,
    type: 'json'
  },
  function(data) {
    var sum = 0;
    if(data.result.reviews !==undefined){
    for(var i = 0;i<data.result.reviews.length;i++)
      sum+=data.result.reviews[i].aspects[0].rating;
    if(data.result.reviews.length>0){
      sum /= data.result.reviews.length;
    sum = sum.toFixed(2);
      sum = "" + sum + "/5";
    }
   else{
     sum = "No Rating";}}
    else{sum = "No Rating";}
    console.log("THE RATING AVERAGE IS "+sum);
    var information = new UI.Card(
      {
        title: placeTitle,
        subtitle:sum,
        body:placeSubtitle,
        scrollable:true
      });
      console.log("info shown");
      information.show();
  },
  function(error) {
    console.log('The ajax request failed: ' + error);
  }
);
}
//Premium feature maybe? Charge luike $40 and log it
function getReviews(x,placeTitle,placeSubtitle){
  var reviewsUrl = "https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8&placeid=";
  reviewsUrl+=x;
  console.log(reviewsUrl);
  ajax(
  {
    url:reviewsUrl,
    type: 'json'
  },
    function(data) {
		var reviewData = [];
		var tempReview = "";
		if (data.result.reviews !== undefined) {
			for (var i = 0; i < data.result.reviews.length; i++) {
				tempReview = data.result.reviews[i].text;
				if (tempReview.length >= 1003) {
					tempReview = tempReview.substring(0, 1001) + "...";
				}
				reviewData.unshift(tempReview);
				console.log(reviewData[i]);
			}
		}
		var processedReviews = [];
		processedReviews.unshift({
			title : "No other reviews"
		});

		for (var j = 0; j < reviewData.length; j++) {
			processedReviews.unshift({
				title : reviewData[j],
				subtitle : data.result.reviews[j].aspects[0].rating + "/5"
			});
			console.log(reviewData[j]);
			console.log(processedReviews[j].title);
		}
		var reviewsMenu = new UI.Menu({
				sections : [{
						title : "Reviews",
						items : processedReviews
					}
				]
			});
		reviewsMenu.show();
			reviewsMenu.on('select', function (event) {
			var review = reviewData[reviewData.length -1- event.itemIndex];
			console.log(review);
			var subtitle = processedReviews[processedReviews.length -2 - event.itemIndex].subtitle;
			console.log(subtitle);
			var reviewCard = new UI.Card({
					title : subtitle,
					body : review,
					scrollable : true
				});
			reviewCard.show();
		});
  },
  function(error) {
    console.log('The ajax request failed: ' + error);
  }
);
}

function resetApp(){
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8";
    catList.show();
    console.log("reset");
} //reset
//this resets categories :D working on a back button function for this

catList.on('select', function(event) { //middle button press on an item, take event which is an object at that location of item
  resetApp();
  console.log("Selected item");
  if(categories[event.itemIndex].title=="Reset"){
    resetApp();
  }
  else if(categories[event.itemIndex].title=="Favorites"){
     if(Settings.data('favorites')!==null && Settings.data('favorites')!==undefined && Settings.data('favorites')!="None"){
      makeFavorites();
    }
    else{
      var noFavorites = new UI.Card({
        title:"Oops!",
        subtitle:"No favorites",
        body:"If you believe this is an error please contact the app developer."
      });
      noFavorites.show();
    }
  }
  else if(categories[event.itemIndex].title=="Destination"){
    console.log("Selected Destination");
     if(Settings.data('destination')===null || Settings.data('destination')===undefined || Settings.data('destination')=="None"){
       Settings.data('destination',{name:"Home",location:"Default!"}); console.log("Destination had no previous data.");
     }
    console.log(JSON.stringify(Settings.data('destination')));
    console.log(Settings.data('destination'));
    console.log("Parsing worked");
      var destCard = new UI.Card({
        title:Settings.data('destination').name,
        subtitle:Settings.data('destination').location
      });
    var checkInCard = new UI.Card({title:"Check In",body:"To check in, flick your wrist!"});
//    var destMenuList = [{title:Settings.data}]
    var destMenu = new UI.Menu({
      sections:[{
        items:[{title:Settings.data('destination').name},{title:"Clear"},{title:"Check In"}]
      }]
    });
    destMenu.show();
    destMenu.on('select',function(x){
      console.log("Clicked "+x.itemIndex);
      switch(x.itemIndex){
        case 0: destCard.show(); console.log("Destination clicked"); break;
        case 1: console.log("Resetting dest");Settings.data('destination',{name:"Home",location:"Home"}); destMenu.hide(); break;
        case 2: console.log("Checking In"); checkInCard.show(); break;
      }
    });
    console.log("Destination was pimped");
  }
  else if(categories[event.itemIndex].title=="Check In"){
      Vibe.vibrate('long');
  destination = Settings.data('destination');
  navigator.geolocation.getCurrentPosition(checkLatLong, locationError, locationOptions); //async func to get lat/long coords

  }
  else{
     cat=categories[event.itemIndex].subtitle;
  console.log(cat);
    console.log(categories[event.itemIndex].subtitle);
  navigator.geolocation.getCurrentPosition(setLatLong, locationError, locationOptions); //async func to get lat/long coords
    console.log("began nav");}
}); //when selecting a category, either reset or set category


console.log("SKIPPED OVER?!");
//should be displayed if it got this far

function rankBy(rank, open){ //takes rank and whether or not the shop should be open rn
  addToUrl("rankby=" + rank); //rank by 
  addToUrl("types=" + cat); //type of cat
  if(open){
    addToUrl("opennow");}
  
  ajax
  (
    {
      url: "" + url + "", type: 'json'
    },
       //request json
  function(json) {
    //when get json
locList=[];
    //loclist is empty
    var index =0;
    for(var i=0; i<json.results.length; i++){
      locList.unshift({title:"x",subtitle:"x"}); console.log(locList[index].title);
      index++;
    }
    for(var j = 0; j<locList.length; j++){
      locList[j].title=json.results[j].name;
      locList[j].subtitle=json.results[j].vicinity;
      locList[j].value = json.results[j].place_id;
      locList[j].latLong = {lat:json.results[j].geometry.location.lat, long:json.results[j].geometry.location.lng};
      console.log(locList[j].title + " " + locList[j].subtitle);
      index++;
    }
    //basically copies it over (results)

    locList.unshift({title:"Reset", subtitle:"If the results are blatantly wrong"});
    //add reset
    
    console.log(locList[0] + " " + locList[1]);
    //log so its all good
    
    resultsJson = new UI.Menu({
      sections: [{
      title:'Results',
      items: locList
      }]
    });
    //make results menu
    
resultsJson.show();
    //show results
    
    
resultsJson.on('select', function(event) {
  var resultHandler = [
  {
    title:"An error has occurred"
  }
];
  if(locList[event.itemIndex].title=="Reset"){
    resetApp();
    console.log("reset");
  }
 
  //
  //
  //  OUR CODE TO HANDLE MAPS GOES HERE!!!
  //
  //
  //
  else{
  resultHandler[0].title = "Favorite";  
//  resultHandler.unshift({title:"Directions"});
 // resultHandler.unshift({title:"Reviews"});
  resultHandler.unshift({title:"Information"});
    resultHandler.unshift({title:"Go!"});
  var placeTitle=locList[event.itemIndex].title;
  var placeSubtitle=locList[event.itemIndex].subtitle;
    var place = locList[event.itemIndex].value;
    var placeLat = locList[event.itemIndex].latLong.lat;
    var placeLong = locList[event.itemIndex].latLong.long;
    console.log(placeLat+" "+placeLong);
    console.log("THE PLACE ID IS "+place);
  var resultInfo = new UI.Menu({
      sections: [{
      title:placeTitle,
      items: resultHandler
      }]
    });
  resultsJson.hide(); resultInfo.show();
  resultInfo.on('select', function(event){
    
    if(resultHandler[event.itemIndex].title=="Directions")
    {
      console.log("Directing");
      var directionUrl = "http://maps.googleapis.com/maps/api/directions/json?key=AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8";
      directionUrl+="&origin="+lat+","+long+"&destination=\""+placeSubtitle+"\"";
      console.log(directionUrl);
      ajax(
      {
        url: directionUrl,
        type:'json'
      },
        function(data){
          var directionList = [];
          console.log(directionUrl);
          var dir;
          for(var j = data.routes[0].legs[0].steps.length-1; j>=0; j--){
            dir = data.routes[0].legs[0].steps[j].html_instructions;
            dir = dir.replace(/<(?:.|\n)*?>/gm, '');
dir=dir.replace(/<br>/gi, "\n");
dir=dir.replace(/<p.*>/gi, "\n");
dir=dir.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 (Link->$1) ");
dir=dir.replace(/<(?:.|\s)*?>/g, "");
            directionList.unshift({title:dir});
            console.log(data.routes[0].legs[0].steps[j].html_instructions);
          }
          console.log("Done making array of directions");
          var directions = new UI.Menu({
            sections:[
            {
            title:"Directions",
            items:directionList
            }
            ]});
          directions.show();
          directions.on('select',function(event){
            var directionDesc = new UI.Card({
              body:directionList[event.itemIndex].title,
              scrollable:true
            });
            directionDesc.show();
          });
        },
        function(error){
					console.log("Ajax"+error);
        }
      );
    }
      
   
    
    
    if(resultHandler[event.itemIndex].title=="Information"){
      console.log("Information was clicked");
      getRating(place,placeTitle,placeSubtitle);
    
    }
    
    if(resultHandler[event.itemIndex].title=="Go!"){
      
      //ideas
      var destination = {name:placeTitle,location:placeSubtitle,lat:placeLat,long:placeLong};
      setDestination(destination);
      
    }    
    
    if(resultHandler[event.itemIndex].title=="Favorite"){
      console.log("Favoriting location "+ placeTitle);
      console.log(Settings.data('favorites'));
      if(Settings.data('favorites')!==null && Settings.data('favorites')!==undefined && Settings.data('favorites')!="None"){
        addToFavorites(placeTitle,placeSubtitle);
         console.log(JSON.stringify(Settings.data('favorites')));
      }
      else{
        Settings.data('favorites', JSON.stringify([{title:"Clear"},{title:placeTitle,subtitle:placeSubtitle}])); console.log(JSON.stringify(Settings.data('favorites')));
        var successFav = new UI.Card({
        title:"Success",
        subtitle:"Favorited",
        body:"You have successfully favorited " +placeTitle,
        scrollable:true
        });
        successFav.show();}
    }
    
 /*   if(resultHandler[event.itemIndex].title=="Transportation"){
      console.log("Cars clicked");
      var uberUrl = "https://www.api.uber.com/v1/products?";
      ajax(
      {
      url:uberUrl+"latitude="+lat+"&longitude="+long,
      type: 'json',
        headers:{
          'Authorization':"Token serverLolMyServer"
        },
        async:false
    },
    function(data) {
        var cars = [];
        for(var i = 0; i<data.products.length;i++){
          console.log(data.products[i].display_name);
          cars.unshift(data.products[i].display_name);
        }
    },
    function(error) {
      console.log("AJAX Failed because of error: " + error);
    });
  }*/
  /*  if(resultHandler[event.itemIndex].title=="Reviews"){
      console.log("Getting Reviews");
					resultInfo.hide();
      getReviews(place,placeTitle,placeSubtitle);
    
    }*/
  });
  
  }
  
  
    console.log("RESULTS CLICK HANDLER ON");
  
});
  },
  function(error) {
    console.log('Ajax failed: ' + error);
  }
);
  //when clicked or on error
  //AIzaSyBlCgWyM7rBfliWUQlXz8odY3KfmqYPUy8
//the above basically makes arrays of Json datas and then gets the data and sets the data and displays it too
  
//needs damn cleaning and spilliting into multiple files but meh 
//working on it (y)  
  
console.log("almost to the end"); //more debug shit for async timing 
  
  
  
}

Accel.on('tap', function(e){
  Vibe.vibrate('long');
  destination = Settings.data('destination');
  navigator.geolocation.getCurrentPosition(checkLatLong, locationError, locationOptions); //async func to get lat/long coords
});
