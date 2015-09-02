/*************************************************************************
 * Global Foundries
 *
 *************************************************************************
 *
 * @description
 * Java script util to draw Org Chart 
 * user Jquery APIs and D3,js
 * @author
 * Nuthan Kumar
 *
 *************************************************************************/

/****************************************
 * Function to wrap text under image ..
 ***************************************/

var app = angular.module('search', []);



app.factory('dataFactory', function($http) {
	return {
		getResults:function(url,param) {
			return $http({
				url: url,
				method: "POST",
				data: param
			});
		}
	} ;

});


app.filter('capitalize', function() {
    return function(input) {
      return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
    }
});

app.config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});


app.controller('SearchBox', ['$scope','$location','dataFactory', function ($scope, $location,dataFactory) {
	
	
	
	function getQueryVariable(url,variable) {
	    var query = url.split('?')[1];
	    if(query)
	    {
		    var vars = query.split('&');
		    for (var i = 0; i < vars.length; i++) {
		        var pair = vars[i].split('=');
		        if (decodeURIComponent(pair[0]) == variable) {
		            return decodeURIComponent(pair[1]);
		        }
		    }
	    }
	    // return empty if query param not found
	    return '';
	    console.log('Query variable %s not found', variable);
	}
	
	var parser = document.createElement('a');
	parser.href = $location['$$absUrl'];
	$scope.selector = parser.pathname.replace(/\//g,'');
	if($scope.selector ==="")
	{
		 // check q parameter
		$scope.selector = getQueryVariable($location['$$absUrl'],'q');
	}
	
	
	$scope.UserList = [];
	$scope.SelectedUser = {};
	$scope.HierarchyData = {};
	
	$scope.levels = [];
	
	$scope.fname = "";
	$scope.lname = "";
	$scope.inputEmail = "";
	$scope.manager ="";
	$scope.locality = "";
	$scope.phone = "";
	$scope.empid = "";
	$scope.localities= ['Abu Dhabi',
						'Amsterdam',
						'Austin',
						'Burlington',
						'Dresden',
						'East Fishkill',
						'Hsinchu',
						'Malta',
						'Munich',
						'San Diego',
						'Santa Clara',
						'Shanghai',
						'Singapore'
						];
	$scope.setSelector = function (value){
		$scope.selector = value;}

	/*$scope.executeClickFromLevel = function(value)	{
		$scope.SelectedUser = {};
		$scope.buildHierarchy();
	}	*/



	$scope.executeClearAll = function () {
		$scope.fname = "";
		$scope.lname = "";
		$scope.inputEmail = "";
		$scope.manager ="";
		$scope.locality = "";
		$scope.phone = "";
		$scope.empid = "";
	}






	/*$scope.executeReadLevels = function () {
		$scope.levels = [];
		$scope.levels.push($scope.SelectedUser);
		$scope.readManager ($scope.SelectedUser);
		//$scope.levels.reverse();
	}*/


	//function called by click event	


	$scope.executeClearSearch = function () {
		$scope.selector = "";
	}

	$scope.executeOptionSearch = function() {
		$scope.selector = "";
		if ($scope.fname.length > 0) { 
			$scope.selector = $scope.selector
			+ " givenName:{"
			+ $scope.fname + "}* ";
		}
		if($scope.lname.length > 0 ){ 
			$scope.selector = $scope.selector
			+ " familyName:{"
			+ $scope.lname + "}* ";
		}
		if ($scope.inputEmail.length > 0) { 
			$scope.selector = $scope.selector
			+ " email:{"
			+ $scope.inputEmail + "}* ";
		}
		if ($scope.phone.length > 0) { 
			$scope.selector = $scope.selector
			+ " phone="
			+ $scope.phone + " ";
		}
		if ($scope.manager.length > 0) { 
			$scope.selector = $scope.selector
			+ " directManager="
			+ $scope.manager + " ";
		}
		
		if ($scope.locality.length > 0) { 
			$scope.selector = $scope.selector
			+ " addressLocality='"
			+ $scope.locality + "' ";
		}
		
		if($scope.empid.length > 0) {
			// remove letters from the empid
			$scope.selector = $scope.selector
			+ " externalId='"
			+ ($scope.empid).replace(/\D/g,'') + "' ";
				
		}
		
		
		// don't get suspended users
		$scope.selector = $scope.selector
		+ " isSuspended=false";
		
		$scope.executeSearch();
	}


	//function called by click event	
	$scope.executeSearch = function () {
		
		$('#advSerachModal').hide();
		
		if ($scope.selector.length < 3 ) 
		{
			$('#Error').html("Enter 3 or more Characters").show().fadeOut(3000);
			return; 
		}
		

		$('#ajaxBusy').show();
		
		
		 dataFactory.getResults('/search',{'query':$scope.selector}).then(function(response){
		 //dataFactory.getResults('/data/user.json',{'query':$scope.selector}).then(function(response){
			 
			// build side bar console.log(response);
			 $scope.UserList = response.data;
			 if($.isEmptyObject($scope.UserList))
			 {
				 $('#Error').html("Opps! Not able to search what you are looking for...").show().fadeOut(3000);
			 }else {
				
				 $scope.SelectedUser = $scope.UserList[0];
				 $scope.buildHierarchy();
				 
			 }
			 $('#ajaxBusy').hide(); 
			 return; 
		 }).
		 catch(function(e){
			 $('#Error').html("Opps! Something did not work, try after some time ..").show().fadeOut(3000); 
			 $('#ajaxBusy').hide(); 
			 return;
		 });
	
		
	}
	
	$scope.buildHierarchy = function() {
		
		$('#ajaxBusy').show();
		
		// to handle d3 json
		$scope.SelectedUser['_children'] = [];
		$scope.SelectedUser['parent'] = [];
		
		 //dataFactory.getResults('/data/heirarchy.json',{'query':$scope.selector}).then(function(response){
		 dataFactory.getResults('/getHierarchy',JSON.stringify($scope.SelectedUser)).then(function(response){
			 
			// build side bar
			 
			 $scope.HierarchyData = response.data;
			 //$('#ajaxBusy').hide(); 
		 });
		 $('#ajaxBusy').hide(); 
	
	}
	$scope.setSelection = function(email) {
		
		var index =  $scope.UserList.map(function(d) { return d['primaryEmail']; }).indexOf(email);
		$scope.SelectedUser = $scope.UserList[index];
		$scope.buildHierarchy();
	}
	
	$scope.isUserSlected = function() {
		if($.isEmptyObject($scope.SelectedUser))
			return false;
		else
			return true;
	}
	
	
	$scope.openMail = function () {
		var str = 'http://mail.google.com/mail/?view=cm&fs=1'+
           '&to=' + $scope.SelectedUser.primaryEmail +
              //'&su=' + 'opts.subject' +
              //'&body=' + 'opts.message' +
              '&ui=1';
              window.open(str,'_blank');
              // location.href = str;
    }
	
	$scope.sendLink = function() {
		
		var str = 'http://mail.google.com/mail/?view=cm&fs=1'+
       
           '&su=' + $location['$$protocol']+'://'+ $location['$$host'] + '/'+ $scope.SelectedUser.primaryEmail +
           '&body=' + $location['$$protocol']+'://'+ $location['$$host'] + '/'+ $scope.SelectedUser.primaryEmail +
           '&ui=1';
           window.open(str,'_blank');
	}
	
	
	// do initial search
	if ($scope.selector.length >0 ) 
	{
		$scope.executeSearch();
	}

}]);