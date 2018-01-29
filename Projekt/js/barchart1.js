/**
* Draws a barchart which shows the amount of 
* votes every party received, sorted. Some of the
* has been copied from https://bl.ocks.org/mbostock/1389927
*
* @param data = The data, read from the csv file.
* @param regionArray = Array with all of the regions.
* @param partyNamesMap = An array with all of the names of the political parties.
* @param partyColors = The color for each party.
*/  
function barchart1(data, regionArray, partyNamesMap, partyColors){

  var YEAR = "Year=2014";
  var partiesAbbrevSortedArray = [];

  self.data = data;

  // Margins, top, left, bottom, right .
  var m = [50, 10, 10, 230];

  var barchartDiv = $("#bar1");
 
  var w = barchartDiv.width() - m[1] - m[3],
      h = barchartDiv.height() -  m[0] - m[2]; 

  var format = d3.format(",.0f");

  var x = d3.scale.linear().range([0, w]),
      y = d3.scale.ordinal().rangeRoundBands([0, h], .1);

  var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h),
      yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

  var svg2 = d3.select("#bar1").append("svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
      .append("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")"); 

  // Initialize tooltip.
  // Taken from: http://bl.ocks.org/biovisualize/1016860
  var tooltip = d3.select("body")
                  .append("div")
                  .style("position", "absolute");   
  
  // Get the nr of political parties.
  var nrPoliticalParties = regionArray[0].values.length;

  // Set the scale domain.
  x.domain([0, d3.max(data, function(d) { return d[YEAR]; })]);  

  // Set the domain for the y-axis.
  for(var idx = 0; idx < nrPoliticalParties; idx++){   
      // Get the party's name.
      var politicalPartyName = regionArray[0].values[idx].party;

      // Use the abbreviations for each party.
      partiesAbbrevSortedArray.push(partyNamesMap[politicalPartyName]);

      y.domain(partiesAbbrevSortedArray);
  }

  // Draw an empty barchart for the first time.
  draw("");

  /**
  * Draws the barchart.
  */  
  function draw(chosenRegionStats){
    // All of the code below draws the bar chart.
    var bar = svg2.selectAll("g.bar")
        .data(chosenRegionStats)
        .enter().append("g")
        .attr("class", "bar")
        // Transforms/translates downwards to each row, for each party.
        .attr("transform", function(d, i) { 
          //console.log(d.party); // varje parti, en i taget
          return "translate(0," + y(partiesAbbrevSortedArray[i]) + ")";
        });

    // Draws the bars.
    bar.append("rect")
        .attr("width", function(d) { 
          return  x(d[YEAR]);           
        })
        .attr("height", y.rangeBand())
        .style("fill", function(d,i) { 
          return partyColors[d.party]; 
        })
        .on("mouseover", function(d) {
            return tooltip.style("visibility", "visible");
        })
        // Display the percentage when the cursor is hovered above.
        .on("mousemove", function(d) {
            return tooltip.style("top", (d3.event.pageY-10)+"px")
                          .style("left",(d3.event.pageX+10)+"px")
                          .text( d[YEAR] + "%" )
                          .style("font-weight", "bold")
                          .style("font-size", "25px");
        })
        .on("mouseout", function(d) {
            return tooltip.style("visibility", "hidden");  
        })
        .transition()
        .duration(750);

    // Drawing the percentage at the end of the bars.
    bar.append("text")
        .attr("class", "value")
        .attr("x", function(d) { 
          return x(d[YEAR]); 
        })
        .attr("y", y.rangeBand() / 2)
        .attr("dx", function(d) { 
          return -3;
        })                                 
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function(d) { 
          // Don't display the value zero.
          if(d[YEAR] > 0){
            return d[YEAR] + "%";
          }else{
            return "";
          }

        })
        .style("font-weight", "bold")
        .style("font-size", "10px");

    // Adding the x-axis.
    svg2.append("g")
        .style("font-weight", "bold")
        .style("font-size", "18px")
        .attr("class", "x axis")
        // Grey color.
        .style("fill", function(d,i) { return "#808080"; })
        .call(xAxis);

    // Adding the y-axis.
    svg2.append("g")
        .attr("class", "y axis")
        //.style("font-weight", "bold")
        .style("font-size", "21px")
        .transition()
        .duration(450)
        .call(yAxis);
  }

  /**
  * Overrides the domains for the barchart.
  *
  * @param regionArrayIndex = The index of the selected region, 
  *                           for the array "regionArray".
  */  
  function overrideDomains(regionArrayIndex){
    
    // Clear the array from previously stored values.
    partiesAbbrevSortedArray.splice(0,partiesAbbrevSortedArray.length)

    // Set the domain for the y-axis.
    for(var idx = 0; idx < nrPoliticalParties; idx++){
        // Get the party's name.
        var politicalPartyName = regionArray[regionArrayIndex].values[idx].party;

        // Use the abbreviations for each party.
        partiesAbbrevSortedArray.push(partyNamesMap[politicalPartyName]);

        y.domain(partiesAbbrevSortedArray);
    }
    
    // Clear the y-domain.
    svg2.select(".y.axis").remove();

    // Change the y-axis.
    svg2.select(".y.axis")
        .call(yAxis);
  }
        
  /**
  * Draws the barchart for the selected region. 
  *
  * @param selectedRegionString = A string that contains the selected region's name.
  */  
  this.showSelectedRegionStats = function(selectedRegionString){

    // Get the information from the chosen region.
    // Will be used later when drawing the bar chart.
    var chosenRegionObject;
    var regionArrayIndex = 0;

    // Go through every region.
    for(idx = 0; idx < regionArray.length; idx++){

      var tempRegion = regionArray[idx].key;

      // Check if it's the selected region and save it.
      if(tempRegion.includes(selectedRegionString)) {
        
        chosenRegionObject = regionArray[idx];
        regionArrayIndex = idx;
      }
    } 

    // Clear previous drawings.
    svg2.selectAll("g.bar").remove();

    // Save the information about the percentage of the votes
    // for each party, in the chosen region.
    var chosenRegionStats = chosenRegionObject.values;

    // Set the new sorted domains for the axes.
    overrideDomains(regionArrayIndex);

    // Draw the chosen region's stats.
    draw(chosenRegionStats);
  }

}





