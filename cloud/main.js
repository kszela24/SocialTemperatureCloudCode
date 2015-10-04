
var tweet = Parse.Object.extend("Tweet");
var runningTally = Parse.Object.extend("runningTallyNU");

Parse.Cloud.afterSave("Tweet", function(request){
	var query = new Parse.Query("runningTallyNU");
	var currRunningTally = new runningTally();
	query.ascending("createdAt");
	query.first().then(function(queryResult){
		currRunningTally = queryResult;
		var countNeg = currRunningTally.get("negative");
		var countPos = currRunningTally.get("positive");
		if (request.object.get("classification") > 0) {
			countPos++;
			currRunningTally.set("positive", countPos);
		} else {
			countNeg++;
			currRunningTally.set("negative", countNeg);
		}
		currRunningTally.save();
	});
});

Parse.Cloud.job("newRunningTallyNU", function(request, response) {
	var newRunningTallyNU = new runningTally()
	newRunningTallyNU.set("positive", 0);
	newRunningTallyNU.set("negative", 0);
	newRunningTallyNU.save();
	response.success("Created new running tally object.");
});

Parse.Cloud.define("returnSentiment", function(request, response){
    var runningTally = Parse.Object.extend("runningTallyNU")
    var currentPercentage = 0.0;
    var negOrPos = "";

    var query = new Parse.Query("runningTallyNU");
    query.ascending("createdAt");
	query.first().then(function(queryResult){
		currRunningTally = queryResult;
		var countNeg = currRunningTally.get("negative");
		var countPos = currRunningTally.get("positive");
		if (countNeg == 0) {
			countNeg = 1.0;
		}
		if (countPos == 0) {
			countPos = 1.0;
		}

		currentPercentage = Math.round((countPos/(countPos + countNeg)) * 100);

		if (countNeg > countPos) {
			negOrPos = "negative!";
			currentPercentage = 100 - $scope.currentPercentage;
		} else {
			negOrPos = "positive!";
		}
		var returnArray = []
		returnArray.push(currentPercentage);
		returnArray.push(negOrPos);
		response.success(returnArray);
	});
});
