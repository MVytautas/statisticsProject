var geographies = [];
var geography = [];

$(document).ready(function() {
	promise = httpGet('http://development.analytics.euromonitor.com/Development/Dmitrij.Beseda/IndustryPresenter/PHP/Services/InflationGeography.php');
	promise.done(function(data){
		//console.log(data);
		geographies = data;

		var tbody = $('.countries tbody');

		for (var i = 0; i < geographies.length; i++) {
		    var id = geographies[i].GeographyId.toString();
			var name = geographies[i].GeographyName.toString();
			tbody
				.append($('<tr>')
					.append($("<td class='country'>")
						.append($("<a href='#' class='countrylink'>")
							.append(name)
								.append("<input type='hidden' value='" + id + "'/>"))));
		}
		openGeographyData(geographies[0].GeographyId.toString());
		$(".countrylink").click(function(){
			var id = $( this ).find('input').val();
			openGeographyData(id);
		});
	});
	promise.fail(function(error){
		alert(JSON.stringify(error));
	});
});

function drawChart()
{
	var chart = $('#chart');
	var years = $('#years');
	var inflation = $('#inflation');
	var polyLine = $('#polyLine');
	var circlePoints = $('#circlePoints');
	var yearsHtml = "";
	for (var i = 0; i < geography.length; i++) {
		var x = 90 + 80 * i;
		var g = "<text x="+ x +" y='425'>"+ geography[i].PeriodYear.toString() +"</text>";
		yearsHtml += g;
	}
	years.html(yearsHtml);

	var biggestValue = findBiggestInflationPoint();
	var lowestValue = findLowestInflationPoint();

	var inflationHtml = "";
	for (var i = 0; i < 11; i++) {
		var y = 15 + 40 * i;

		var difference = biggestValue - lowestValue;
		var value = biggestValue - (difference / 10) * i;

		var g = "<text x='80' y="+ y +">" + roundUp(value, 1000) +"</text>";
		inflationHtml += g;
	}
	inflation.html(inflationHtml);

	var points = "";
	var circlePointsHtml = "";
	for (var i = 0; i < geography.length; i++) {

		var difference = biggestValue - lowestValue;
		var currentGeoValue = geography[i].DataValues - lowestValue;
		var yValue = currentGeoValue / difference;
		var x = 90 + 80 * Number(geography[i].PeriodYear - 2010);
		var y = 400 - yValue * 400 + 10;
		//console.log('x = ' + x + ', y = ' + y);
		var g = "<circle cx="+ x +" cy="+ y +" r='4'></circle>";
		points += x + ',' + y + ' ';
		circlePointsHtml += g;
	}
	circlePoints.html(circlePointsHtml);
	polyLine.attr("points", points);
}

function roundUp(num, precision) {
  return Math.ceil(num * precision) / precision
}

function findBiggestInflationPoint()
{
	var biggestValue = 0;
	var lowestValue = 0;
	for(var i = 0; i < geography.length; i++)
	{
		var currentValue = Number(geography[i].DataValues); 
		if (currentValue > biggestValue )
		{
			biggestValue = currentValue;
		}

	}
	return biggestValue
}

function findLowestInflationPoint()
{
	var lowestValue = geography[0].DataValues;
	for(var i = 0; i < geography.length; i++)
	{
		var currentValue = Number(geography[i].DataValues); 
		if (currentValue < lowestValue )
		{
			lowestValue = currentValue;
		}

	}
	return lowestValue
}


function openGeographyData(GeographyId)
{
	//alert(GeographyId);
	console.log("getting data for: " + GeographyId);
	promise = httpGet('http://development.analytics.euromonitor.com/Development/Dmitrij.Beseda/IndustryPresenter/PHP/Services/InflationTimeLine.php?GeographyId=' + GeographyId);
	promise.done(function(data){
		//console.log(data);
		geography = data;
		drawChart();
	});
	promise.fail(function(error){
		alert(JSON.stringify(error));
	});
}

function httpGet(urlLink) {
	var promise = $.ajax({
	url: urlLink,
	type: 'GET',
	dataType: 'json',
	});
	return promise;
}