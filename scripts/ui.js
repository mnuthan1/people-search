/*************************************************************************
 * Global Foundries
 *
 *************************************************************************
 *
 * @description
 * UI file to render dynamic HTML based on the ajax response
 * user Jquery APIs, bootstrap CSS
 * @author
 * Nuthan Kumar
 *
 *************************************************************************/
    
 // render list details side bar
var globalProducts = [];
var renderListDetails = function(users) {
	
	globalProducts = users;
	
	if(users.length !=0 )
	{
		var s = "<ul class=\"nav sidebar-nav\">";
		
		for(i in users) {
			
			s+= "<li>";
			s+= "<a href=\"#\" onClick=\"renderDetailsByIndex("+i+")\">";
			if(users[i].thumbnailPhotoUrl)
				{
				s+= "<i class=\"sidebar-icon\"> <img src = " + users[i].thumbnailPhotoUrl +"></img></i>";
				} else {
				s+= "<i class=\"sidebar-icon\"> <img src = /img/image_not_found.jpg ></img></i>";
				}
			//s+=  users[i].name.fullName +"</li>" ;
			//s+= "<dd>"+users[i].organizations[0].title +"</dd></li>";
			s+= "<dl class=\"sidebar-text\">";
			s+= "<dt>"+users[i].name.fullName+"</dt>";
			s+= "<dd>"+users[i].organizations[0].title + "</dd>";
			s+= "</dl>";
		    
			s+="</a>";
		}
		s+="</ul>";
	}else {
		var s =" <div class=\"alert alert-info\" role=\"alert\">";
		s+= "No Users found";
		s+= "</div>";
	} 
	//console.log(s);
	$('#sidebar').html(s);
}

var renderDetailsByIndex = function(index) {
	renderDetails(globalProducts[index]);
}

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

	var s = "<div class=\" col-xs-6 col-md-8 \">"
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
			+ "<a href=\"mailto:"+product.emails[0].address+"\">"
			+ product.emails[0].address + "</a>"+"</td>" + "</tr>" + "</table>"
			+ "</div>";
	
	s += "<div id=\"Address\" class=\"tab-pane fade\">"
			+ " <table class=\"table table-responsive\"> "
			+ "<tr class=\"active\">" + "<td> Address</td> " + "<td>"
			+ product.addresses[0].formatted + "</td> </tr>"   ;

			for (ele in product.phones)
				{
				//console.log(JSON.stringify(ele));
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
			+ product.organizations[0].name + "</td>" + "</tr>";
			for (ele in product.externalIds)
			{
				//console.log(JSON.stringify(ele));
				s +=  "<tr class=\"active\"> <td>" +product.externalIds[ele].type +"</td>" 
				s +=  "<td>" +product.externalIds[ele].value +"</td> </tr>" 
			}
	
			s+= "</table>"
				+ "</div>";

	s += "</div>" + "</div>";

	//console.log(s);
	$('#productDetails').append(s);

	// thubnail
	var thubnail = $('#thubnail');
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
		thubnail.append(img);
		
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
	thubnail.append(img);
}