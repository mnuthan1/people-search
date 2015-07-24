/**
 * 
 */

angular.module('search')
.controller('TypeAheadController', ['$scope','dataFactory', function($scope, dataFactory) {
	
	
	$scope.name = ''; // This will hold the selected item
	$scope.onItemSelected = function() { // this gets executed when an item is selected
		console.log('selected=' + $scope.current);
	};
	
	$scope.getData = function () {
		console.log($scope.model);
		dataFactory.getTypeAhead('./data/user.json').then(function(data) {
		    $scope.items = data;
		  });
	};
	  
}]);