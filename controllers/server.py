__author__ = 'nuthankumar.mallavaram@globalfoundries.com'
# -*- coding: utf-8 -*-
"""
This module serve as WSGI end points for people search application

Attributes:
    JINJA_ENVIRONMENT (LIST): Module level variable to set JINJA template settings
    app : WSGI interface to extrenal world
    SCOPES (LIST): varible to hold google api scopes required for this application
    
    7/22/2015 - Added fileds to the query to reduce payload size
    7/29/2015 - Added logic to handle CEO's heirarchy chart - with no manager

"""
import logging

import os
from urllib2 import HTTPError

from google.appengine.api import users
import webapp2
import jinja2
import json
import re


from decorators import decorator

SCOPES = [
            "https://www.googleapis.com/auth/admin.directory.user.readonly"] 

FIELDS = ['nextPageToken',
                  'users(name,relations,organizations,phones,thumbnailPhotoUrl,primaryEmail,addresses,emails,externalIds,suspended)'         
          ]
U_FIELDS = ['name',
            'relations',
            'organizations',
            'phones',
            'primaryEmail',
            'addresses',
            'emails',
            'thumbnailPhotoUrl',
            'externalIds',
            'suspended']

H_FIELDS = ['nextPageToken',
                  'users(name,relations,thumbnailPhotoUrl,primaryEmail,addresses)'         
          ]

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)
    
 

class RootPage(webapp2.RequestHandler):
    @decorator.custom_login_required
    def get(self,query = ""):
               
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
            'param':query,
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
        
        
        params = {'domain': 'globalfoundries.com',
                  'orderBy':'email',
                  'viewType':'admin_view',
                  'fields': ','.join(FIELDS),
                  'query':query }

       
        self.searchUsers(params)
        
        # further filter the results to remove suspended users
        if( not bool(re.search(r"\bisSuspended=false",query, re.I))):
            self.all_users = filter(lambda x: self.filterResults(x) , self.all_users)
        
        self.response.headers['Content-Type'] = 'application/json'  
        self.response.write(json.dumps(self.all_users))
    
    
    def filterResults(self,x):
        return not x.get('suspended')  
         
            
    
    @decorator.get_oauth_build    
    def searchUsers(self,params,directory_service):
        
        page_token = None
        while True:
            try:
                if page_token:
                    params['pageToken'] = page_token
                current_page = directory_service.users().list(**params).execute()
                
                if( 'users' in current_page ):
                    self.all_users.extend(current_page['users'])
                #for user in self.all_users:
                    #logging.info( user['primaryEmail'])
                page_token = current_page.get('nextPageToken')
                if not page_token:
                    break
            except HTTPError as error:
                logging.error( 'An error occurred: %s' % error)
                break
        #logging.info(json.dumps(self.all_users))
        #logging.info(self.all_users.__class__)
        return None
    
        
class AdvSearch(webapp2.RequestHandler):
    @decorator.custom_login_required
    @decorator.get_oauth_build
    def post(self,directory_service):
        # read request parameters
        jsonstring = self.request.body
        jsonobject = json.loads(jsonstring)
        email = jsonobject.get('email')
        
       
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
                #logging.info( current_page)
                
                page_token = current_page.get('nextPageToken')
                if not page_token:
                    break
            except HTTPError as error:
                logging.error( 'An error occurred: %s' % error)
                break
        
        self.response.headers['Content-Type'] = 'application/json'  
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.write(json.dumps(all_users))




class HierarchyDetails(webapp2.RequestHandler):
    
    
    def getReportees(self,email,directory_service):
        
        reportees = []
        params = {'domain': 'globalfoundries.com',
                  'orderBy':'email',
                  'viewType':'admin_view',
                  'fields': ','.join(FIELDS),
                  'query':'directManager='+email.lower()+' isSuspended=false'
                  }
        page_token = None
        while True:
            try:
                if page_token:
                    params['pageToken'] = page_token
                current_page = directory_service.users().list(**params).execute()
                
                if( 'users' in current_page ):
                    reportees.extend(current_page['users'])
               
                page_token = current_page.get('nextPageToken')
                if not page_token:
                    break
            except HTTPError as error:
                logging.error( 'An error occurred: %s' % error)
                break
        return reportees
    
    @decorator.custom_login_required
    @decorator.get_oauth_build
    def post(self,directory_service):
        # read request parameters
        jsonstring = self.request.body
        jsonobject = json.loads(jsonstring)
        email = jsonobject.get('primaryEmail')
        manager = None
        if('relations' in jsonobject):
            for dest in jsonobject['relations']:
                if dest['type'] == 'manager':
                    manager = dest['value']
          
        
        # no manager for him - to handle CEOs chart
        all_users = []
        if(manager):
            
            page_token = None
            params = {'userKey':manager,
                      'fields': ','.join(U_FIELDS)}
    
            while True:
                try:
                    if page_token:
                        params['pageToken'] = page_token
                    current_page = directory_service.users().get(**params).execute()
                    all_users = current_page
                    #current_page = directory_service.files().list(maxResults=10).execute()
                    #logging.info( current_page)
                    
                    page_token = current_page.get('nextPageToken')
                    if not page_token:
                        break
                except HTTPError as error:
                    logging.error( 'An error occurred: %s' % error)
                    break
            
            all_users['children']=self.getReportees(manager,directory_service)
            reportees = self.getReportees(email,directory_service)
            if len(reportees) > 0:
                for user in all_users['children']:
                    if user['primaryEmail'] == email:
                        user['children'] = reportees
        else :
            all_users = jsonobject
            all_users['children'] = self.getReportees(email,directory_service)
        # get immediate reportees for the selected user
       
       
        #jsonobject['children']=reportees
        self.response.headers['Content-Type'] = 'application/json'  
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        if(len(all_users) > 0):
            self.response.write(json.dumps(all_users))
        else:
            self.response.write(json.dumps(jsonobject))