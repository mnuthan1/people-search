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

					
					// Advanced Search options button
					$("#advsearch").click(function() {

						var sel = $("#advSerachModal");
						var pos = $("#search");
						if (sel.is(":hidden")) {
							sel.css({
								'position' : 'absolute',
								'left' : pos.offset().left,
								'top' : pos.offset().top + pos.outerHeight(),
								//'width' : pos.outerWidth()
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
					
					
				});