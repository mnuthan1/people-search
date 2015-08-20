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

angular.module('search').filter('match', function() {
	return function( items,input) {
		var filtered = [];
		
		if(input)
		{
			angular.forEach(items, function(item) {
				
				if(item.name.fullName.toLowerCase().indexOf(input.toLowerCase()) !== -1 
						|| item.organizations[0].title.toLowerCase().indexOf(input.toLowerCase()) !== -1
						|| (item.addresses[0].locality||'').toLowerCase().indexOf(input.toLowerCase()) !== -1)
				{
					filtered.push(item);
				}
			});
		} else {
			filtered = items;
		}
		return filtered;
	};
});