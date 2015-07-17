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

				});