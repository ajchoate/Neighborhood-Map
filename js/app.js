// NOTE:
// Code for basic functionality based on Udacity's course on Google Maps APIs.
//
// Declare global variables
var map;
var blueDot = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
var greenDot = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
var yellowDot = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";

// MODEL
var Model = {
	// Create arrays containing location data for markers.
	libraries: [
		{name: "Katy Geissert Civic Center Library", city: "Torrance, CA", location: {lat: 33.840031, lng: -118.342999}, markerColor: blueDot},
		{name: "North Torrance Library", city: "Torrance, CA", location: {lat: 33.874640, lng: -118.336021}, markerColor: blueDot},
		{name: "Gardena Mayme Dear Library", city: "Gardena, CA", location: {lat: 33.886322, lng: -118.308514}, markerColor: blueDot},
		{name: "Masao W. Satow Library", city: "Gardena, CA", location: {lat: 33.902994, lng: -118.326710}, markerColor: blueDot}
	],
	restaurants: [
		{name: "Chicken Maison", city: "Gardena, CA", location: {lat: 33.887408, lng: -118.326100}, markerColor: greenDot},
		{name: "Aloha Pizza", city: "Gardena, CA", location: {lat: 33.872930, lng: -118.303572}, markerColor: greenDot},
		{name: "Angara Indian Restaurant", city: "Torrance, CA", location: {lat: 33.838044, lng: -118.320943}, markerColor: greenDot},
		{name: "Fritto Misto", city: "Hermosa Beach, CA", location: {lat: 33.863874, lng: -118.398011}, markerColor: greenDot},
		{name: "Mendocino Farms", city: "El Segundo, CA", location: {lat: 33.903178, lng: -118.395354}, markerColor: greenDot}
	],
	// New blank array for all markers.
	markers: []
};

// VIEW MODEL
var ViewModel = {
	// Function to make markers & send first Foursquare API request to find Venue ID.
	markerInitialize: function(array, i, infowindow) {
		var position = array[i].location;
		var title = array[i].name;
		var markerColor = array[i].markerColor;
		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			icon: markerColor,
			animation: google.maps.Animation.DROP,
			id: i
		});
		
		Model.markers.push(marker);
		marker.addListener("mouseover", function() {
			this.setIcon(yellowDot);
		});
		marker.addListener("mouseout", function() {
			this.setIcon(array[0].markerColor);
		});
		var placeVenueId;
		var foursquareUrl = "https://api.foursquare.com/v2/venues/search";
		var foursquareClientID = "OJOUQBMEJRWJFNRB03FJRXRSRUBQ0VB5HB3GKOJXGIPUWLSX";
		var foursquareClientSecret = "ZCWKJR5AR2YGRW1YV01MNSFXN03WOSVUWRAD4OJQMSQZTSV2";
		var foursquareVersion = "20180101";
	    $.ajax({
	      	url: foursquareUrl,
	      	dataType: "json",
	      	data: {
	      		ll: array[i].location.lat + "," + array[i].location.lng,
	      		client_id: foursquareClientID,
	      		client_secret: foursquareClientSecret,
	      		query: array[i].name,
	      		v: foursquareVersion
	      	},
	      	success: function(data) {
	      		placeVenueId = data.response.venues[0].id;
				marker.addListener("click", function() {
					window.setTimeout(function() {
						marker.setAnimation(google.maps.Animation.BOUNCE);
					}, 800);
					ViewModel.populateInfoWindow(this, infowindow, placeVenueId);
				});
	      	},
	      	error: function(data) {
	      		alert("Error: " + data.statusText);
	    	}
	    });
	},
	// Function to populate information in a marker's info window using Foursquare Venue Details.
	populateInfoWindow: function(marker, infowindow, venueId) {
		var placeTitle, placeAddress, placeUrl, placeCategory, placePhoto;
		if (infowindow.marker != marker) {
			// Clear data from any previously open info windows.
			infowindow.setContent("");
			// Link info window to marker that was just passed in.
			infowindow.marker = marker;
			infowindow.addListener("closeclick", function() {
				infowindow.marker = null;
				marker.setAnimation(null);
			});
			// Send Get request to Foursquare's Venue Details API.
			var foursquareUrl = "https://api.foursquare.com/v2/venues/" + venueId;
			var foursquareClientID = "OJOUQBMEJRWJFNRB03FJRXRSRUBQ0VB5HB3GKOJXGIPUWLSX";
			var foursquareClientSecret = "ZCWKJR5AR2YGRW1YV01MNSFXN03WOSVUWRAD4OJQMSQZTSV2";
			var foursquareVersion = "20180101";
		 	$.ajax({
		 	   	url: foursquareUrl,
		 	  	dataType: "json",
		 	  	data: {
	 		 		client_id: foursquareClientID,
	 	    		client_secret: foursquareClientSecret,
	 	    		v: foursquareVersion
	 	    	},
	 	    	success: function(data) {
	 	    		console.log(data);
	 	    		placeTitle = data.response.venue.name;
					placeAddress = data.response.venue.location.formattedAddress;
		      		placeUrl = data.response.venue.url;
		      		placeCategory = data.response.venue.categories[0].pluralName;
		      		placePhoto = data.response.venue.bestPhoto.suffix;
	 	    		infowindow.setContent("<div class='infoWindow'><h3>" + placeTitle + "</h3><p>" + placeAddress + "</p>" +
	 	    			"<p><a href='" + placeUrl + "'>" + placeUrl + "</a></p><p>Category: " + placeCategory +
	 	    			"</p><img alt='Best Photo' src='https://igx.4sqi.net/img/general/width150" + placePhoto + "'></div>");
	 	    		// Reposition map bounds to fit info window.
	 	    		var bounds = new google.maps.LatLngBounds();
					for (var i = 0; i < Model.markers.length; i++) {
						Model.markers[i].setMap(map);
						bounds.extend(Model.markers[i].position);
					}
	 	    	},
	 	    	error: function(data) {
	 	    		// Create alert if API request fails.
	 		 		alert("Error: " + data.statusText);
	 	  		}
		 	});
			infowindow.open(map, marker);
		}
	},
	// Function to allow places list items to trigger the click event and open info window.
	clickMarker: function(marker) {
		google.maps.event.trigger(marker, "click");
		// On mobile devices, make clicking the button close the sidebar.
		if (window.innerWidth < 450) {
			ViewModel.closeSidebar();
		}
	},
	// Function within ViewModel that populates all markers & info windows on map.
	populateMap: function() {
		var largeInfowindow = new google.maps.InfoWindow();
		// Function passing in location arrays from Model to create markers & pull API data.
		// For loop iterates through each item in designated array.
		function createMarkers(array) {
			for (var i = 0; i < array.length; i++) {
				ViewModel.markerInitialize(array, i, largeInfowindow);
			}
		}
		createMarkers(Model.libraries);
		createMarkers(Model.restaurants);
		// Call addVisibility function to create observable isVisible property for each location.
		ViewModel.addVisibility();
	},
	// Create observable version of Model.markers array in the ViewModel.
	places: ko.observableArray(Model.markers),
	// Function creates an observable isVisible property in each location object.
	addVisibility: function() {
		for (var i = 0; i < ViewModel.places().length; i++) {
			ViewModel.places()[i].isVisible = ko.observable(true);
		}
	},
	// Function binds to Show Places button and makes markers appear.
	showPlaces: function() {
		// On mobile devices, make clicking the button close the sidebar.
		if (window.innerWidth < 450) {
			ViewModel.closeSidebar();
		}
		var bounds = new google.maps.LatLngBounds();
		// Toggle list item & marker visibility to true.
		for (var i = 0; i < ViewModel.places().length; i++) {
			var a = ViewModel.places()[i];
			// Makes marker visible.
			a.setVisible(true);
			// Makes list item visible.
			a.isVisible(true);
			// Reposition window to fit marker bounds.
			bounds.extend(a.position);
		}
		map.fitBounds(bounds);
	},
	// Function binds to Hide Places button and makes markers disappear.
	hidePlaces: function() {
		// Toggle list item & marker visibility to false.
		for (var i = 0; i < ViewModel.places().length; i++) {
			var a = ViewModel.places()[i];
			// Hides marker.
			a.setVisible(false);
			// Hides list item.
			a.isVisible(false);
		}
		// On mobile devices, make clicking the button close the sidebar.
		if (window.innerWidth < 450) {
			ViewModel.closeSidebar();
		}
	},
	// Function that takes data from input text box and filters list of places.
	filter: ko.observable(""),
	filterPlaces: function() {
		var filter = ViewModel.filter().toUpperCase();
	    // Loop through all list items, and hide those who don't match the search query
	    for (var i = 0; i < ViewModel.places().length; i++) {
	        var a = ViewModel.places()[i];
	        if (a.title.toUpperCase().indexOf(filter) > -1) {
	            // Makes marker visible if it matches the filter input.
	            a.setVisible(true);
	            // Makes list item visible if it matches the filter.
	            a.isVisible(true);
	        } else {
	        	// Hides marker if it does not match the filter input.
	            a.setVisible(false);
	            // Hides list item if it does not match the filter.
	            a.isVisible(false);
	        }
	    }
	},
	openSidebar: function() {
		document.getElementById("sidebar").style.width = "400px";
		document.getElementById("map").style.left = "400px";
	},
	closeSidebar: function() {
		document.getElementById("sidebar").style.width = "0px";
		document.getElementById("map").style.left = "0px";
	},
	mapsError: function() {
		alert("Google Maps failed to load");
	}
};

// Initialize map using latitude & longitude coordinates and call ViewModel function.
function initMap() {
	map = new google.maps.Map(document.getElementById("map"), {
		center: {lat: 33.835915, lng:-118.340295},
		zoom: 12
	});

	ViewModel.populateMap();
	ko.applyBindings(ViewModel);
}