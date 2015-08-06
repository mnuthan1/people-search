/*************************************************************************
 * Global Foundries
 *
 *************************************************************************
 *
 * @description
 * mainfile to make attach events to HTML elements
 * user Jquery APIs
 * @author
 * Nuthan Kumar
 *
 *************************************************************************/

$(document)
		.ready(
				function() {

					// Jquery Busy indicator

					// Setup the ajax indicator
					$('body')
							.append(
									'<div id="ajaxBusy"><p><img src="img/loading.gif" height="80" width="100"></p></div>');

					
					$('body')
					.append(
							'<div id="Error" class="alert alert-danger" role="alert"></div>');


					// Ajax activity indicator bound to ajax start/stop document
					// events
					$(document).ajaxStart(function() {
						$('#ajaxBusy').show();
					}).ajaxStop(function() {
						$('#ajaxBusy').hide();
					});

					// quick search submit GO button
					$("#search_submit").click(function() {
						
						var query = $("#people_search").val();
						
						if(query.length >= 3)
						{
							
							qSearchRequest(query);
						} else {
							$('#Error').html('<strong>Hmm, We can\'t find what you want !!!</strong> Enter 3 or more characters').show().delay(5000).fadeOut();
						}

					});

					// Advanced search submit
					$("#advSubmit").click(function() {
						console.log(" advSubmit click");
						var email = $("#inputEmail").val();
						var country = $("#country").val();
						console.log(" advSubmit click method " + email);

						advSearchRequest(email);

					});

					// Advanced Search options button
					$("#advsearch").click(function() {

						var sel = $("#advSerachModal");
						var pos = $("#people_search");
						if (sel.is(":hidden")) {
							sel.css({
								'position' : 'absolute',
								'left' : pos.offset().left,
								'top' : pos.offset().top + pos.outerHeight(),
								'width' : pos.outerWidth()
							}).show("slow");

							sel.show();
						} else {
							sel.hide();
						}
					});

					// hide div when user clicks away from the div space
					$(function() {
						$('#advSerachModal').click(function(event) {
							event.stopPropagation();
						});
						$(document).click(function() {
							$('#advSerachModal').hide();
						});
					});
					
					// hide div (ERROR Message) when user clicks away from the div space
					$(function() {
						$('#Error').click(function(event) {
							event.stopPropagation();
						});
						$(document).click(function() {
							$('#Error').hide();
						});
					});
					
					
					/* attach enter event to the text box */
					$.fn.pressEnter = function(fn) {  
						  
					    return this.each(function() {  
					        $(this).bind('enterPress', fn);
					        $(this).keydown(function(e){
					        	
					            if(e.which == 13)
					            {
					               return false;
					            }
					        });
					        $(this).keyup(function(e){
					        	
					            if(e.which == 13)
					            {
					            	e.preventDefault();
					            	 $(this).trigger("enterPress");
					            	return false;
					              
					            }
					        });
					    });  
					 }; 


					$('#people_search').pressEnter(function(){$('#search_submit').click();})
					
										
					

					//	toggle side bar

					$('[data-toggle=offcanvas]').click(function() {
						$('.row-offcanvas-left').toggleClass('active');
					});

					$('[data-toggle=offcanvasright]').click(function() {
						$('.row-offcanvas-right').toggleClass('active');
					});
					
					
					
					// clipboard copy
					function copyToClipboard(element) {
						  $("body").append("<input type='text' id='temp' style='position:absolute;opacity:0;'>");
						  $("#temp").val($(element).text()).select();
						  document.execCommand("copy");
						  $("#temp").remove();
						}

					
					// modified to call quick search function in order to support home page
					var query = $("#people_search").val();
					
					if(query.length >= 3)
					{						
						qSearchRequest(query);
					} else if(query.length > 0) {
						$('#Error').html('<strong>Hmm, We can\'t find what you want !!!</strong> Enter 3 or more characters').show().delay(5000).fadeOut();
					}
				});