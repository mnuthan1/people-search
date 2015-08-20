__author__ = 'nuthankumar.mallavaram@globalfoundries.com'
# -*- coding: utf-8 -*-
"""
This module holds decorators required for people search application

Attributes:
    JINJA_ENVIRONMENT (LIST): Module level variable to set JINJA template settings
    app : WSGI interface to extrenal world
    SCOPES (LIST): varible to hold google api scopes required for this application

"""
from google.appengine.api import users
import os
from oauth2client.client import SignedJwtAssertionCredentials
import httplib2
from apiclient.discovery import build
import logging
from controllers.AESCipher import Cipher
from google.appengine.ext import db
import json
from model.application import Application



SCOPES = ["https://www.googleapis.com/auth/admin.directory.user.readonly"] 

sub = 'People.Search_App@globalfoundries.com'
service_account_email = '1025736752504-ublfj5g4am94o31ihnger3c5f6avfd5v@developer.gserviceaccount.com'

def custom_login_required(handler_method):
    """decorator function to check valid globalfoundries authentication

    parameter lsit::

        *args
   
    Returns:
        handler method
    """
    def check_login(self, *args):
        #if self.request.method != 'GET':
            #raise HTTPError('The check_login decorator can only be used for GET equests')
        user = users.get_current_user()
        
        if not user:
            self.redirect(users.create_login_url(self.request.uri))
            return
        else:
            #check user domain
            domain = os.getenv('USER_ORGANIZATION')
            if domain != 'globalfoundries.com':
                self.redirect(users.create_logout_url(self.request.uri))
                return
        handler_method(self, *args)
    return check_login

def get_oauth_build(handler_method):
    """decorator function to get oauth token and return directory service build to the handler method
    
    parameter lsit::

        *args
   
    Returns:
        handler method
    """
    def get_token(*args):
        key_file_location = './privatekey.pem'
        f = open(key_file_location, 'rb')
        key = f.read()
        f.close()
        credentials = SignedJwtAssertionCredentials(service_account_email, key, scope=SCOPES,sub=sub)
  
        http = credentials.authorize(httplib2.Http())
        
        directory_service = build('admin', 'directory_v1',http=http)
        return handler_method( directory_service=directory_service,*args)
    return get_token


def app_auth_required(handler_method):
    """decorator function to get app authentication
    
    parameter lsit::

        *args
   
    Returns:
        handler method
    """
    def check_app(self,*args):
        
        q = db.Query(Application)
        name = self.request.headers['app-identifier-name']
        KEY = self.request.headers['app-identifier-key']
        logging.info(name +':'+KEY)
        return handler_method(self, *args)
        for app in q:
            '''KEY = app.key_value
            msg = Cipher.decrypt(self.request.headers['app-identifier'],KEY)'''
            logging.info(app.app_name +':'+app.key_value)
            if name == app.app_name and KEY == app.key_value:
                return handler_method(self, *args)
        
        error_msg = '{"error": "401 Not a Registered APP"}'
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(error_msg))
    return check_app