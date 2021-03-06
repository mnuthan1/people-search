__author__ = 'nuthankumar.mallavaram@globalfoundries.com'
# -*- coding: utf-8 -*-
"""
This module serve as WSGI Gateway for people search application

Attributes:
    app : WSGI interface to extrenal world

"""

import os, sys
lib_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'controllers')
sys.path.insert(0, lib_path)

import webapp2
import logging

from controllers import add_lib_path
add_lib_path()
from controllers import api


endpoints = webapp2.WSGIApplication([
	('/api/users/([^/]+)/?', api.SimpleUserSearchHandler),
    ('/api/user/([^/]+)/?', api.UserGetHandler),
    ('/api/groups/([^/]+)/?', api.SimpleGroupSearchHandler),
	
], debug=True)


# Extra Hanlder like 404 500 etc
def handle_404(request, response, exception):
    """module level function to handle page not found exception

    parameter lsit::

        request (type): description
            http request object
        response (type): description
            http response object
        exception (type): description
            exception raised by WSGI inteface
   
    Returns:
        response: Http response with 404 handle
    """
    logging.exception(exception)
    response.write('{"error": "404 not_found"}')
    response.set_status(404)

endpoints.error_handlers[404] = handle_404

