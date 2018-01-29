/**
* Draws a barchart which shows the amount of 
* votes every block received, sorted. Some of the
* has been copied from https://bl.ocks.org/mbostock/1389927
*
* @param data = The data, read from the csv file.
* @param regionArray = Array with all of the regions.
* @param partyNamesMap = An array with all of the names of the political parties.
* @param partyColors = The color for each party.
* @param blockColors = An array that contains the colors for each block.
*/  
function barchart2(data, regionArray, partyNamesMap, partyColors, blockColors){

  self.data = data;

  // Margins, top, left, bottom, right .
  var m = [50, 10, 10, 230];

  var barchartDiv = $("#bar2");
 
  var  w = barchartDiv.width() - m[1] - m[3],
       h = barchartDiv.height() -  m[0] - m[2]; 

  var format = d3.format(",.0f");

  var x = d3.scale.linear().range([0, w]),
      y = d3.scale.ordinal().rangeRoundBands([0, h], .1);

  var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h),
      yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

  var svg1 = d3.select("#bar2").append("svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
      .append("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")"); 

  // Initialize tooltip.
  // Taken from: http://bl.ocks.org/biovisualize/1016860
  var tooltip = d3.select("body")
                  .append("div")
                  .style("position", "absolute");

  var YEAR = "Year=2014";

  // Get the nr of political parties.
  var nrPoliticalParties = regionArray[0].values.length;

  //var blockNames = ["Rödgröna", "Alliansen", "Övriga"];
  
  // Used to check which block a party belongs to.
  var redBlock = ["Socialdemokraterna", "Vänsterpartiet", "Miljöpartiet"];
  var blueBlock = ["Moderaterna", "Folkpartiet", "Centerpartiet", "Kristdemokraterna"];
  var theRest = ["Sverigedemokraterna", "övriga partier", "ej röstande", "ogiltiga valsedlar"];

  var blockMap = 
  [
    {block: "Rödgröna", parties: redBlock},
    {block: "Alliansen", parties: blueBlock},
    {block: "Övriga", parties: theRest}
  ];

  // Set the preliminary domains.
  x.domain([0, 70]); 

  var prepareDomain = [];
  blockMap.forEach(function(d){
    prepareDomain.push(d.block);
    y.domain(prepareDomain);
  })

  // Draw the axes.
  draw("");

  /**
  * Draws the barchart.
  *
  * @param percentagesData = An array with objects, which contain the information
  *                          percentages, block names and which parties that belongs
  *                          to the same block.
  */  
  function draw(percentagesData){

    var bar = svg1.selectAll("g.bar")
        .data(percentagesData)
        .enter().append("g")
        .attr("class", "bar")
        // Transforms/translates downwards to each row, for each block.
        .attr("transform", function(d, i) { 
          return "translate(0," + y(percentagesData[i].block) + ")";
        });

    // Draws the bars.
    bar.append("rect")
        .attr("width", function(d, i) { 
          return  x(percentagesData[i].percentage);            
        })
        .attr("height", y.rangeBand())
        .style("fill", function(d,i) { 
          return blockColors[percentagesData[i].block]; 
        })      
        .on("mouseover", function(d) {
            return tooltip.style("visibility", "visible");
        })
        // Display the parties that belong to the block when the cursor is hovered above.
        .on("mousemove", function(d, i) {

          if((d.block) === percentagesData[i].block){
            tooltip.html(percentagesData[i].parties);
          }

          return tooltip.style("top", (d3.event.pageY-10)+"px")
                        .style("left",(d3.event.pageX+10)+"px")                        
                        .style("font-weight", "bold")
                        .style("font-size", "20px");
        })
        .on("mouseout", function(d) {
            return tooltip.style("visibility", "hidden");  
        });
        
    // Drawing the percentage at the end of the bars.
    bar.append("text")
        .attr("class", "value")
        .attr("x", function(d, i) { 
          return x(percentagesData[i].percentage); 
        })
        .attr("y", y.rangeBand() / 2)
        .attr("dx", function(d) { 
          return -3;
        })                                 
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function(d, i) { 

          // Don't display the value zero.
          if(percentagesData[i].percentage > 0){
            // Round to one decimal.
            var percentageValue = Math.round( percentagesData[i].percentage * 10 ) / 10;
            return percentageValue + "%";
          }else{
            return "";
          }
        })
        .style("font-weight", "bold")
        .style("font-size", "21px");

    // Adding the x-axis.
    svg1.append("g")
        .style("font-weight", "bold")
        .style("font-size", "18px")
        .attr("class", "x axis")
        // Grey color.
        .style("fill", function(d,i) { return "#808080"; })
        .call(xAxis);

    // Adding the y-axis.
    svg1.append("g")
        .attr("class", "y axis")
        .style("font-weight", "bold")
        .style("font-size", "21px")
        .transition()
        .duration(450)
        .call(yAxis);
    }

    /**
    * Calculates the percentages for each block and prepares
    * the data necessary for the draw method.
    *
    * @param chosenRegionStats = An object that contains the information for the selected region.
    */  
    function calculateBlocks(chosenRegionStats){
        
      var redPercentage = bluePercentage = theRestPercentage = 0;
      //var abbrevsSorted = [];
      var nrBlocks = 3;      

      // Calculate the percentage for each block.
      for(var idx = 0; idx < nrPoliticalParties; idx++){ 

        var hasAddedPercentage = false;   
        
        // If the party belongs to the red block.
        if(!hasAddedPercentage){
          for(idu in redBlock){
            if(chosenRegionStats[idx].party === redBlock[idu]){
              redPercentage += chosenRegionStats[idx][YEAR];
              // The percentage value has been added, skip the other for loops below.
              hasAddedPercentage = true;
              // If the party's percentage has been added, break the loop.
              break;  
            }
          }
        }        

        // If the party belongs to the blue block.
        if(!hasAddedPercentage){
          for(idu in blueBlock){
            if(chosenRegionStats[idx].party === blueBlock[idu]){
              bluePercentage += chosenRegionStats[idx][YEAR];
              hasAddedPercentage = true;  
              break;
            }      
          }
        }

        // If the party belongs to the rest.
        if(!hasAddedPercentage){
          for(idu in theRest){
            if(chosenRegionStats[idx].party === theRest[idu]){
              theRestPercentage += chosenRegionStats[idx][YEAR];
              hasAddedPercentage = true;  
              break;
            }      
          }   
        }
      } 

      // Save the information.
      var percentagesData = 
      [
        {block: "Rödgröna", percentage: redPercentage, parties: redBlock},
        {block: "Alliansen", percentage: bluePercentage, parties: blueBlock},
        {block: "Övriga", percentage: theRestPercentage, parties: theRest}
      ];

      // Sort by the largest percentage value.
      percentagesData = percentagesData.slice(0).sort(function(a, b) {
        return b.percentage - a.percentage;
      });
      

      // Set the domain for the y-axis.
      y.domain(percentagesData.map(function(d){
        return d.block;
      }));

      // Clear the previous domain.
      svg1.select(".y.axis").remove();

      // Draw the new the y-axis.
      svg1.select(".y.axis")
          .call(yAxis);

      // Clear domain for the x-axis.
      svg1.select(".x.axis").remove();  

      // Set the scale domain for the x-axis.
      x.domain([0, percentagesData[0].percentage]);

      // Draw the new x-axis.
      svg1.select(".x.axis")
          .call(xAxis);

      // Draw the updated barchart.
      draw(percentagesData);
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

      // Go through each region.
      for(idx = 0; idx < regionArray.length; idx++){

        var tempRegion = regionArray[idx].key;

        // Check if it's the selected region and save it.
        if(tempRegion.includes(selectedRegionString)) {          
          chosenRegionObject = regionArray[idx];
          regionArrayIndex = idx;
        }
      } 

      // Clear previous drawings.
      svg1.selectAll("g.bar").remove();

      // Save the information about the percentage of the votes
      // for each party, in the chosen region.
      var chosenRegionStats = chosenRegionObject.values;
      
      // Calculate the block percentages for the selected region.
      calculateBlocks(chosenRegionStats); 
    }
}