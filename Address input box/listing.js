const mapboxToken = 'pk.eyJ1IjoidmVkaXRiZWxhZGlhIiwiYSI6ImNsZ2Q5ZmFzcDBsbTczZm8waHZ0dHNjdXcifQ.gCw4tf3znD_ZQTS4mpoEQQ'; // Replace with your MapBox access token

function getGeoCoordinates(address) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}`;
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to retrieve coordinates.');
      }
      return response.json();
    })
    .then(data => {
      const coordinates = data.features[0].center;
      return coordinates;
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

const route = {
  stops: [],
};

function createRoute() {
  const route = {
    stops: [],
  };

  const addresses = document.getElementById('addresses').value.split('\n');
  const promises = addresses.map(address => getGeoCoordinates(address));

  Promise.all(promises).then(coordinates => {
    route.stops = coordinates;
    console.log(route);
    
    alert("Redirecting to the MAP! Happy dilevery");
    // redirect to the new page
    window.location.href = "http://10.100.11.247:9966/";
  });
}
