var uberUrl = "https://www.api.uber.com/v1/products?";
function getCars(lat, long) {
  ajax(
  {
    url:uberUrl+"latitude="+lat+"&longitude="+long,
    type: 'json'
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
  }
);
}