var bc1, bc2, map1;

var YEAR = "Year=2014";

var partyNamesMap = 
{
	"Moderaterna":"Moderaterna", 
	"Folkpartiet":"Liberalerna",
	"Centerpartiet":"Centerpartiet", 
	"Kristdemokraterna":"Kristdemokraterna",	
	"Socialdemokraterna":"Socialdemokraterna",
	"Vänsterpartiet":"Vänsterpartiet", 
	"Miljöpartiet":"Miljöpartiet", 
	"Sverigedemokraterna":"Sverigedemokraterna",  
	"övriga partier":"Övriga partier", 
	"ej röstande":"Ej röstande", 
	"ogiltiga valsedlar":"Ogiltiga valsedlar"
};

var partyColors = 
{
	"Moderaterna":"#52bdec", 
	"Folkpartiet":"#3399FF",
	"Centerpartiet":"#009933", 
	"Kristdemokraterna":"#000077",	
	"Socialdemokraterna":"#ff2020",
	"Vänsterpartiet":"#c80000", 
	"Miljöpartiet":"#83CF39", 
	"Sverigedemokraterna":"#DDDD00",  
	"övriga partier":"#A9A9A9", 
	"ej röstande":"#000000", 
	"ogiltiga valsedlar":"#696969"
};

var blockColors = 
{
	"Rödgröna":"#ff2020",
	"Alliansen":"#52bdec",  
	"Övriga":"#A9A9A9", 
};

// Read the comma separated file.
d3.csv("data/Swedish_Election_2014.csv", function(error, data){

	var citiesArray = [];

	// Convert the percentages to numeric values.
	data.forEach(function(d) { 

		if(d[YEAR] > 0){
		  d[YEAR] = +d[YEAR];
		}else{
		  // Get rid of junk data.
		  d[YEAR] = 0;
		}
	});

	// Sort the data by the percentages.
	data.sort(function(a, b) { return b[YEAR] - a[YEAR]; });

	// Collect all the entries with the same key (city)
	// and get all of the information for each city.
	citiesArray = d3.nest()
	              .key(function(d){
	                return d.region;
	              })
	              .entries(data);

	citiesArray.keys = _.values(citiesArray);

	// Create and send the data to all of the modules.
	bc1 = new barchart1(data, citiesArray, partyNamesMap, partyColors);
	bc2 = new barchart2(data, citiesArray, partyNamesMap, partyColors, blockColors);
	map1 = new map(data, citiesArray, blockColors);
});

/**
* Calls all of the highlight functions in each js-file.
* Called when the search bar's button has been clicked on.
*/  
function selectComponents() {

	// Getting the text from the search bar.
	var searchedRegionString = document.getElementById("searchbar").value;

	bc1.showSelectedRegionStats(searchedRegionString);
    bc2.showSelectedRegionStats(searchedRegionString);
    map1.highlightSelectedRegion(searchedRegionString);
}




