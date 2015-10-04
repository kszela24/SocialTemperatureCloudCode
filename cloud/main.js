
var tweet = Parse.Object.extend("Tweet");
var runningTally = Parse.Object.extend("runningTallyNU")

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
