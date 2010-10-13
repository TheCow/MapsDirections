
/*
		Class:		createGoogleMapsDirectionsAPI
		Base Class: GoogleMapsAPI V3 Directions
		Author:		Liam Davenport
		Version:	1.0
		Date:		27/05/2010
*/
	
var createGoogleMapsDirectionsAPI = new Class({
	version: '1.0.0',
	Implements: [Options],

	// Set defualt objects
	options: {
		zoomLevel: 12, 															// Map zoom level
		mapType: google.maps.MapTypeId.ROADMAP,									// Map Type
		targetMapDiv: 'map_directions_canvas',									// Hold map div name
		directionsBar:'directions_results',										// Directions Panel
		postCodeButton: 'post_postcode',										// Hold post code button name
		postCodeInput: 'postcode',												// Hold postcode value
		mapWidth: '500px',														// Map Width
		mapHeight: '300px',														// Map Height
		centLatitude: 53.231531,												// Center Latitude on load if you know it
		centLongitude: -0.545625,												// Center Longitude on load if you know it
		travelMode: google.maps.DirectionsTravelMode.DRIVING,					// Travel mode map
		customImageMarkerURL: '/magazine/graphics/icons/maps/markers/letters/',	// Defualt image location for custom markers
		useCustomMarkers: true													// Use custome image markers
	},

	// ### Initialize objects ###
	initialize: function(options) {
		this.setOptions(options);										// Assign this to object setup
		this.geocoder = new google.maps.Geocoder();  					// Geocoder object  setup
		this.marked = new Array();										// Markers array variable
		this.map='';													// Map variable
		this.directionsDisplayRenderer = new google.maps.DirectionsRenderer();	// Directions Renderer
		this.directionsService = new google.maps.DirectionsService();	// Google directions web service
		
		// Load standard map with defualt center point
		if($defined(this.options.targetMapDiv)){
			this.loadMap(this.options.zoomLevel, this.options.mapType, this.options.centLatitude, this.options.centLongitude, this.options.targetMapDiv);
		}
		
		// Add click event to locate button on form
		$(this.options.postCodeButton).addEvent('click', function(evt){
			if($chk($(this.options.postCodeInput).get('value').toUpperCase())){
				// Use google geocoder to get lat lng of postcode entered
				this.googleGeoLocations($(this.options.postCodeInput).get('value').toUpperCase()+', UK');
			}
			// Stop form activating action
			evt.stop();
		}.bind(this));
	},
	
	// ### Load map and plot center point ###
	loadMap: function(zoom, maptypeID, lat, lng , targetDiv) {
	
		var customMarker='';
		if(this.options.useCustomMarkers){
			var customMarker = new google.maps.MarkerImage(this.options.customImageMarkerURL + 'marker0.png');
		}

		// Load in map options
		var mapOptions = {
			streetViewControl: true,
			zoom: zoom,
			center: new google.maps.LatLng(lat, lng),
			mapTypeId: maptypeID
		 };

		 //Set Height and width
		$(targetDiv).set('styles', {
			'height': this.options.mapHeight,
			'width': this.options.mapWidth
		});

		// Setup map with options
		this.map=new google.maps.Map($(targetDiv), mapOptions);

		// Put center point on map
		var markerCenter = new google.maps.Marker({
			position: new google.maps.LatLng(lat, lng),
			map: this.map,
			icon: customMarker,
			zoomLevel: this.options.zoomLevel
		});
		
		// Set directions for this map
		this.directionsDisplayRenderer.setMap(this.map);
		
		// Define the directions panel
		this.directionsDisplayRenderer.setPanel($(this.options.directionsBar));

		// Add marker to marked array
		this.marked.push(markerCenter);
	},
	
	// ### Use google geocoder to get lat lng of postcode ###
	googleGeoLocations: function(postcode){
	
		// Google geocoder object
		if (this.geocoder) {
			//use geocoder to transform postcode into long lat
			this.geocoder.geocode( { 'address': postcode}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					// Call getdirections function and pass the lat lng value
					this.getDirections(results[0].geometry.location);
				} else {
					// Error in post code
					alert("Geocode was not successful for the following reason: " + status);
				}
			}.bind(this));
		}
	},
	
	// ### Get Directions and show in seperate sidebar ###
	getDirections: function(lnglat){
		// Use default lat lng from class - this will be over written on page load with users postcode
		var startDirections = lnglat.lat() + ',' + lnglat.lng();
		// Use post code geocoded lat lng as end point
		var endDirections = this.options.centLatitude +','+ this.options.centLongitude;
	
		// Clear old markers
		this.marked.each(function (el, index){
			this.marked[index].setMap(null);
		}.bind(this));
		
		// Change icon to green A
		if($defined($$('.icon_directions'))){
			$$('.icon_directions')[0].set('src',this.options.customImageMarkerURL + 'markerA.png');
		}

		// Define directions options
		var outputDirections = {
			origin: startDirections,
			destination: endDirections,
			travelMode: this.options.travelMode
		};
		
		// Output directions start and end poins on map and show direction side bar
		this.directionsService.route(outputDirections, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				this.directionsDisplayRenderer.setDirections(response);
			}
		}.bind(this));
	}
		
});