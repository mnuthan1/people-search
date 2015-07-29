/*************************************************************************
 * Global Foundries
 *
 *************************************************************************
 *
 * @description
 * Controller file to make required ajax calls for directory search application
 * user Jquery APIs
 * @author
 * Nuthan Kumar
 *
 *************************************************************************/

var getHeirarchy = function(product) {
	//var query = {'email':email};
	$.ajax({
		url : '/getHeirarchy',
		//url : '/data/heirarchy.json',
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
			$('#Error').html('<strong>Hmm, We can\'t find what you want !!!</strong> I don\'t know what may have happened..').show().delay(3000).fadeOut();
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
			$('#Error').html('<strong>Hmm, We can\'t find what you want !!!</strong> I don\'t know what may have happened..').show().delay(3000).fadeOut();
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
			
			$('#Error').html('<strong>Hmm, We can\'t find what you want !!!</strong> I don\'t know what may have happened..').show().delay(3000).fadeOut();
			/*.delay(3000).fadeOut(function() {
				   $(this).remove(); 
			});*/
		  }
	});
	// keeps page from not refreshing
	return false;
}
