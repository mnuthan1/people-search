/**
 *Angular JS module for people search application 
 */


(function () {
  'use strict';

  angular.module('search', [])
  .factory('dataFactory', function($http) {
	return {
		getTypeAhead:function(url) {
			return $http.get(url).then(function(result) {
				return result.data
			});
		}
	} ;
  
  });

  // define empty controllers
  angular.module('search.controllers', []); 
  angular.module('search.directives', []); 

  run.$inject = ['$http'];

/**
* @name run
* @desc Update xsrf $http headers to align with Django's defaults
*/
function run($http) {
  $http.defaults.xsrfHeaderName = 'X-CSRFToken';
  $http.defaults.xsrfCookieName = 'csrftoken';
}


})();