
$(document).ready(function () {

	
	// Jquery Busy indicator
	
	// Setup the ajax indicator
	  $('body').append('<div id="ajaxBusy"><p><img src="img/jar-loading.gif" height="100" width="100"></p></div>');
	 
	  $('#ajaxBusy').css({
	    display:"none",
	    position:"fixed",
	    paddingLeft:"0px",
	    paddingRight:"0px",
	    paddingTop:"0px",
	    paddingBottom:"0px",
	    top: "50%",
	    left: "50%"
	  });
	});
	 
	// Ajax activity indicator bound to ajax start/stop document events
	$(document).ajaxStart(function(){ 
	  $('#ajaxBusy').show(); 
	}).ajaxStop(function(){ 
	  $('#ajaxBusy').hide();
	  
	  
     // Attach Button click event listener 
    $("#submit").click(function(){
    //  invoke_Google();
		console.log("click");
         
    });
	
    
	 // Advanced search submit
    $("#advSubmit").click(function(){
		console.log(" advSubmit click");
		var email = $("#inputEmail").val();
		var country = $("#country").val();
		console.log(" advSubmit click method "+email);
		
		advSearchRequest(email);
		
    });
	
	// Advanced Search options button
	$("#advsearch").click(function(){

	var sel = $("#advSerachModal");
	  var pos = $("#people_search");
	  if (sel.is(":hidden")) {
		sel.css({
        'position': 'absolute',
        'left': pos.offset().left,
        'top': pos.offset().top + pos.outerHeight() ,
        'width': pos.outerWidth()
   }).show("slow");
		
		sel.show();
	  } else {
		sel.hide();
	  }
    });
});

// hide div when user clicks away from the div space
$(function(){
    $('#advSerachModal').click(function(event){
        event.stopPropagation();
    });
    $(document).click(function(){
        $('#advSerachModal').hide();
    });
});


//reder details    
var renderDetails = function(product) {
	$('#productDetails').html('');
	$('#orgChart').html('');
	$('#productDetails')
			.append(
					" <div class=\"image_container col-xs-12 col-sm-6 col-md-2\">"
							+ "<div id = \"thubnail\" class=\"thumb\">"
							+ " </div><div class =\"text\"> <dl> <dt>"
							+ product.name.fullName + "</dt> <dd>"
							+ product.organizations[0].title
							+ "</dd></dl></div></div>").show();

	// details page

	var s = "<div class=\" col-xs-6 col-md-6 \">"
			+ "<ul class=\"nav nav-tabs\">"
			+ "<li class=\"active\"><a data-toggle=\"tab\" href=\"#Basic\">Basic</a></li>"
			+ "<li><a data-toggle=\"tab\" href=\"#Address\">Contact</a></li>"
			+ "<li><a data-toggle=\"tab\" href=\"#Organization\">Organization</a></li>"
			+ "</ul>";
			
	s += "<div class=\"tab-content\">";

	s += "<div id=\"Basic\" class=\"tab-pane fade in active\">"
			+ " <table class=\"table table-responsive\"> "
			+ "<tr class=\"active\">" + "<td> First Name</td> " + "<td>"
			+ product.name.givenName + "</td>" + "</tr>"
			+ "<tr class=\"active\">" + "<td> Family Name</td> " + "<td>"
			+ product.name.familyName + "</td>" + "</tr>"
			+ "<tr class=\"active\">" + "<td> Email</td> " + "<td>"
			+ product.emails[0].address + "</td>" + "</tr>" + "</table>"
			+ "</div>";
	
	s += "<div id=\"Address\" class=\"tab-pane fade\">"
			+ " <table class=\"table table-responsive\"> "
			+ "<tr class=\"active\">" + "<td> Address</td> " + "<td>"
			+ product.addresses[0].formatted + "</td> </tr>"   ;

			for (ele in product.phones)
				{
				console.log(JSON.stringify(ele));
				s +=  "<tr class=\"active\"> <td>" +product.phones[ele].type +"</td>" 
				s +=  "<td>" +product.phones[ele].value +"</td> </tr>" 
				}
			
		s+=	"</table>" + "</div>";

	s += "<div id=\"Organization\" class=\"tab-pane fade\">"
			+ " <table class=\"table table-responsive\"> "
			+ "<tr class=\"active\">" + "<td> Title</td> " + "<td>"
			+ product.organizations[0].title + "</td>" + "</tr>"
			+ "<tr class=\"active\">" + "<td>Department</td> " + "<td>"
			+ product.organizations[0].department + "</td>" + "</tr>"
			+ "<tr class=\"active\">" + "<td>Company</td> " + "<td>"
			+ product.organizations[0].name + "</td>" + "</tr>" + "</table>"
			+ "</div>";

	s += "</div>" + "</div>";

	//console.log(s);
	$('#productDetails').append(s);

	// thubnail
		
	window.URL = window.URL || window.webkitURL;
	if (product.thumbnailPhotoUrl) {
		/*var xhr = new XMLHttpRequest();
		xhr.open('GET', product.thumbnailPhotoUrl, true);
		//xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
		xhr.setRequestHeader('Access-Control-Allow-Origin','http://peoplesearch-999.appspot.com');
		xhr.responseType = 'blob';

		xhr.onload = function(e) {
			if (this.status == 200) {
				var blob = this.response;

				var img = document.createElement('img');
				img.onload = function(e) {
					// Clean up after yourself
					window.URL.revokeObjectURL(img.src);
				};
				img.src = window.URL.createObjectURL(blob);

				// Do something with the img
				thubnail.appendChild(img);
			}

		};
		xhr.onerror = function(e) {
			renderImgNotFound(thubnail);
		};

		xhr.send();*/
		
		var img = document.createElement('img');
		img.onload = function(e) {
			// Clean up after yourself
			window.URL.revokeObjectURL(img.src);
		};
		img.src = product.thumbnailPhotoUrl;
		img.setAttribute("style", "max-width:100%;max-height:100%");
		thubnail.appendChild(img);
		
	} else {
		renderImgNotFound(thubnail);
	}

	// get heirarchy 

	getHeirarchy(product);

};

var renderImgNotFound = function(thubnail) {
	var img = document.createElement('img');
	img.onload = function(e) {
		// Clean up after yourself
		window.URL.revokeObjectURL(img.src);
	};
	img.src = 'img/image_not_found.jpg';
	img.setAttribute("style", "max-width:100%;max-height:100%");
	thubnail.appendChild(img);
}

var getHeirarchy = function(product) {
	//var query = {'email':email};
	$.ajax({
		url : '/getHeirarchy',
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
			console.log(result);
			renderDetails(result);
			$("#advSerachModal").hide();
		},            	
		error: function(e) {
			//called when there is an error
			console.log(e.message);
		  }
	});
	// keeps page from not refreshing
	return false;
}

