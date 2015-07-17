__author__ = 'nuthankumar.mallavaram@globalfoundries.com'
# -*- coding: utf-8 -*-
"""
This module serve as WSGI end points for people search application

Attributes:
    JINJA_ENVIRONMENT (LIST): Module level variable to set JINJA template settings
    app : WSGI interface to extrenal world
    SCOPES (LIST): varible to hold google api scopes required for this application

"""
import logging

import os
from urllib2 import HTTPError

from google.appengine.api import users
import webapp2
import jinja2
import json

from decorators import decorator

SCOPES = ["https://www.googleapis.com/auth/admin.directory.user",
            "https://www.googleapis.com/auth/admin.directory.user.readonly"] 


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)
    
 

class RootPage(webapp2.RequestHandler):
    @decorator.custom_login_required
    def get(self):
        # check for user active session
        user = users.get_current_user()
        if user:
            #self.response.headers['Content-Type'] = 'text/plain'
            #self.response.write('Hello, ' + user.nickname())
            url = users.create_logout_url(self.request.uri)
            url_linktext = 'Logout'
            #self.response.write(MAIN_PAGE_HTML)
        else:
            url = users.create_login_url(self.request.uri)
            url_linktext = 'Login'
            #self.redirect('/_ah/login_required')
        
        template_values = {
            'user': user,
            'url': url,
            'url_linktext': url_linktext,
        }
        jinja_environment = self.jinja_environment
        template = jinja_environment.get_template("/index.html")
        self.response.write(template.render(template_values))
        
        
    @property
    def jinja_environment(self):
        jinja_environment = jinja2.Environment(autoescape=True,extensions=['jinja2.ext.autoescape'],
            loader=jinja2.FileSystemLoader(
                os.path.join(os.path.dirname(__file__),
                         '../views'
                ))
        )
        return jinja_environment


class Search(webapp2.RequestHandler):
    all_users = []
    @decorator.custom_login_required
    def post(self):
        jsonstring = self.request.body
        jsonobject = json.loads(jsonstring)
        self.all_users = []
        query = jsonobject.get('query')
        logging.info(query)
     
        params = {'domain': 'globalfoundries.com',
                  'orderBy':'email',
                  'viewType':'admin_view',
                  'query':'familyName:{'+query+'}*' }

       
        self.searchUsers(params)
       
        params = {'domain': 'globalfoundries.com',
                  'orderBy':'email',
                  'viewType':'admin_view',
                  'query':'givenName:{'+query+'}*' }

        self.searchUsers(params)
        self.response.headers['Content-Type'] = 'application/json'  
        self.response.write(json.dumps(self.all_users))
    
    
    @decorator.get_oauth_build    
    def searchUsers(self,params,directory_service):
        
        page_token = None
        while True:
            try:
                if page_token:
                    params['pageToken'] = page_token
                current_page = directory_service.users().list(**params).execute()
                #current_page = directory_service.files().list(maxResults=10).execute()
                logging.info( current_page.__class__)
                if( 'users' in current_page ):
                    self.all_users.extend(current_page['users'])
                for user in self.all_users:
                    logging.info( user['primaryEmail'])
                page_token = current_page.get('nextPageToken')
                if not page_token:
                    break
            except HTTPError as error:
                logging.error( 'An error occurred: %s' % error)
                break
        logging.info(json.dumps(self.all_users))
        logging.info(self.all_users.__class__)
        return None
    
        
class AdvSearch(webapp2.RequestHandler):
    @decorator.custom_login_required
    @decorator.get_oauth_build
    def post(self,directory_service):
        # read request parameters
        jsonstring = self.request.body
        jsonobject = json.loads(jsonstring)
        email = jsonobject.get('email')
        logging.info (email);
        '''region = self.request.get('region')
        manager = self.request.get('manager')
        fname = self.request.get('fname')
        lname = self.request.get('lname')'''
        
        all_users = []
        page_token = None
        params = {'userKey':email,
                  'projection':'full'}

        while True:
            try:
                if page_token:
                    params['pageToken'] = page_token
                current_page = directory_service.users().get(**params).execute()
                all_users = current_page
                #current_page = directory_service.files().list(maxResults=10).execute()
                logging.info( current_page)
                
                page_token = current_page.get('nextPageToken')
                if not page_token:
                    break
            except HTTPError as error:
                logging.error( 'An error occurred: %s' % error)
                break
        logging.info(json.dumps(all_users))
        self.response.headers['Content-Type'] = 'application/json'  
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.write(json.dumps(all_users))




class HeirarchyDetails(webapp2.RequestHandler):
    @decorator.custom_login_required
    @decorator.get_oauth_build
    def post(self,directory_service):
        # read request parameters
        jsonstring = self.request.body
        jsonobject = json.loads(jsonstring)
        email = jsonobject.get('primaryEmail')
        manager = None
        for dest in jsonobject['relations']:
            if dest['type'] == 'manager':
                manager = dest['value']
          
        logging.info ("email"+email);
        logging.info ("manager"+manager);
        
        all_users = []
        page_token = None
        params = {'userKey':manager,
                  'projection':'full'}

        while True:
            try:
                if page_token:
                    params['pageToken'] = page_token
                current_page = directory_service.users().get(**params).execute()
                all_users = current_page
                #current_page = directory_service.files().list(maxResults=10).execute()
                logging.info( current_page)
                
                page_token = current_page.get('nextPageToken')
                if not page_token:
                    break
            except HTTPError as error:
                logging.error( 'An error occurred: %s' % error)
                break
        
        all_users['children']=[jsonobject]
        # get immediate reportees for the selected user
        
        params = {'domain': 'globalfoundries.com',
                  'orderBy':'email',
                  'viewType':'admin_view',
                  'query':'directManager='+email
                  }
        reportees = []
        while True:
            try:
                if page_token:
                    params['pageToken'] = page_token
                current_page = directory_service.users().list(**params).execute()
                reportees = current_page
                #current_page = directory_service.files().list(maxResults=10).execute()
                logging.info( reportees)
                
                page_token = current_page.get('nextPageToken')
                if not page_token:
                    break
            except HTTPError as error:
                logging.error( 'An error occurred: %s' % error)
                break


        jsonobject['children']=reportees.get('users')
        
        logging.info(json.dumps(all_users))
        self.response.headers['Content-Type'] = 'application/json'  
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.write(json.dumps(all_users))