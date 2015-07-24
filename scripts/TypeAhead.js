/*$(document).ready(
		function($) {
			// Workaround for bug in mouse item selection
			$.fn.typeahead.Constructor.prototype.blur = function() {
				var that = this;
				setTimeout(function() {
					that.hide()
				}, 250);
			};
			var resultList = []
			var that = this;
			$('#people_search').typeahead(
					{
						minLength : 3,
						highlight : true,
						source : function(query, process) {
							var q = {
								'query' : query
							};
							return $.ajax({
								//url : '/search',
								url : '/data/user.json',
								type : 'post',
								data : JSON.stringify(q),
								dataType : 'json',
								success : function(result) {
									//console.log(result);
									resultList = result.map(function(item) {
										//return item.name.fullName + "";
										//var aItem = { id: item.Id, name: item.Name };
										
										return JSON.stringify(item);
									});

									return process(resultList);

								}
							});
						},

						matcher : function(obj) {

							var item = JSON.parse(obj);
							//item = obj;
							//console.log(item);
							return ~item.name.fullName.toLowerCase().indexOf(
									this.query.toLowerCase())
						},

						
						highlighter : function(obj) {
							
							var product = JSON.parse(obj);
							//console.log(product);
							return product.name.fullName + " :@"
									+ product.primaryEmail + " ("
									+ product.addresses[0].locality + ") <br>"
									+ product.organizations[0].title + " ("
									+ product.organizations[0].name + ")";
						},
						updater : function(obj) {
							var product = JSON.parse(obj);
							
							that.setSelectedProduct(product);
							return product.name.fullName;
						}
					});

			$('#product').hide();
			this.setSelectedProduct = function(product) {
				renderDetails(product);

			};
		});*/


