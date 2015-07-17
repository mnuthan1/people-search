/**
 * 
 */

var getHeirarchy = function(product) {
	//var query = {'email':email};
	$.ajax({
		url : '/getHeirarchy',
		type : 'post',
		data : JSON.stringify(product),
		dataType : 'json',
		success : function(result) {
			//console.log(result);
			update(result);
			//renderHeirarchyDetails(result);

		},
		error : function(e) {
			//called when there is an error
			console.log(e.message);
		}
	});
};


var advSearchRequest =  function(email) {
	
	var query = {'email':email};
	$.ajax({
		url: '/advsearch',
		type: 'post',
		data: JSON.stringify(query),
		dataType: 'json',
		success: function (result) {
			//console.log(result);
			renderDetails(result);
			$("#advSerachModal").hide();
		},            	
		error: function(e) {
			//called when there is an error
			console.log(e.message);
		  }
	});
	// keeps page from not refreshing
	return false;
}



var qSearchRequest =  function(query) {
	
	var query = {'query':query};
	$.ajax({
		url: '/search',
		//url : '/data/user.json',
		type: 'post',
		data: JSON.stringify(query),
		dataType: 'json',
		success: function (result) {
			
			renderListDetails(result);
		},            	
		error: function(e) {
			//called when there is an error
			console.log(e.message);
		  }
	});
	// keeps page from not refreshing
	return false;
}
