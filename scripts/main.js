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
									'<div id="ajaxBusy"><p><img src="img/jar-loading.gif" height="100" width="100"></p></div>');

					$('#ajaxBusy').css({
						display : "none",
						position : "fixed",
						paddingLeft : "0px",
						paddingRight : "0px",
						paddingTop : "0px",
						paddingBottom : "0px",
						top : "50%",
						left : "50%"
					});
					
					$('body')
					.append(
							'<div id="Error" class="alert alert-danger" role="alert">' +
							'<strong>Hmm, We can\'t find what you want !!!</strong>'+
							//'Try with part of First Name (or) Last Name' +
							'</div>');

					$('#Error').css({
						display : "none",
						position : "fixed",
						paddingLeft : "0px",
						paddingRight : "0px",
						paddingTop : "0px",
						paddingBottom : "0px",
						top : "10%",
						left : "35%",
						width: "25%",
						height: "60px"
					});

					// Ajax activity indicator bound to ajax start/stop document
					// events
					$(document).ajaxStart(function() {
						$('#ajaxBusy').show();
					}).ajaxStop(function() {
						$('#ajaxBusy').hide();
					});

					// quick search submit GO button
					$("#search_submit").click(function() {
						console.log(" quick seach click");
						var query = $("#people_search").val();

						console.log(" advSubmit click method " + query);

						qSearchRequest(query);

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
					

					// attach enter event to main search box
					$("#people_search").keyup(function(event) {
						if (event.keyCode == 13) {
							$("#search_submit").click();
						}
					});

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

				});