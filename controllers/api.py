__author__ = 'nuthankumar.mallavaram@globalfoundries.com'
# -*- coding: utf-8 -*-
'''
This module serve as WSGI end points for people search application REST Calls

Created on Jul 31, 2015

@author: nmallav1
'''
import webapp2
import json
from decorators import decorator
from urllib2 import HTTPError
import logging

SCOPES = ["https://www.googleapis.com/auth/admin.directory.user.readonly",
          "https://www.googleapis.com/auth/admin.directory.group.readonly"] 

FIELDS = ['nextPageToken',
                  'users(name,relations,organizations,phones,thumbnailPhotoUrl,primaryEmail,addresses,emails,externalIds,suspended)'         
          ]

    
def responde_with_results(self, results):
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(json.dumps(results))

safeString = lambda s : "".join(c for c in s if c.isalnum() or c in (' ','.','_')).rstrip()
@decorator.get_oauth_build    
def search_google_users(params,directory_service):
    
    page_token = None
    all_users = []
    while True:
        try:
            if page_token:
                params['pageToken'] = page_token
            current_page = directory_service.users().list(**params).execute()
            if( 'users' in current_page ):
                all_users.extend(current_page['users'])
            page_token = current_page.get('nextPageToken')
            if not page_token:
                break
        except HTTPError as error:
            logging.error( 'An error occurred: %s' % error)
            break
    return all_users


@decorator.get_oauth_build    
def search_google_groups(params,directory_service):
    
    page_token = None
    all_users = []
    while True:
        try:
            if page_token:
                params['pageToken'] = page_token
            current_page = directory_service.groups().list(**params).execute()
            logging.info(current_page)
            if( 'users' in current_page ):
                all_users.extend(current_page['users'])
            page_token = current_page.get('nextPageToken')
            if not page_token:
                break
        except HTTPError as error:
            logging.error( 'An error occurred: %s' % error)
            break
    return all_users


@decorator.get_oauth_build    
def get_google_user(params,directory_service):
    current_page = directory_service.users().get(**params).execute()
    logging.info(current_page)
    return current_page
    
class SimpleUserSearchHandler(webapp2.RequestHandler):
    @decorator.app_auth_required
    def get(self, keywords):
        logging.info(keywords)
        
        if not r':' in keywords:
            params = self.extract_params(keywords)
            ''' default seach with name'''
            
            query_result = search_google_users(params)
            query_result = filter(lambda x: self.filterResults(x) , query_result)
        else:
            params = self.extract_params(keywords,'process')
            ''' default seach with Family name '''
            query_result = search_google_users(params)
                    
        responde_with_results(self,query_result)
        
    def filterResults(self,x):
        return not x.get('suspended')          
    
    def extract_params(self,query,criteira=''):
        """ Extract the query parameters from the URL and, after validation returns them as a
            dictionary.
        """
        prefix_list = ['familyName','givenName','email','orgDepartment']
        lower_list = ['directManager','manager']
        new_q = []
        if criteira != '':
            q_l = query.split(',')
            for q in q_l:
                c_l = q.split(':')
                if len(c_l) == 2:
                    if c_l[0] in prefix_list:
                        new_q.append(c_l[0]+':'+c_l[1])
                    elif c_l[0] in lower_list:
                        new_q.append(c_l[0]+'='+c_l[1].lower())
                    else:
                        new_q.append(c_l[0]+'='+c_l[1])
            query = (' '.join(new_q)) + ' isSuspended=false'
          
        return  {'domain': 'globalfoundries.com',
                  'orderBy':'email',
                  'viewType':'admin_view',
                  'fields': ','.join(FIELDS),
                  'query':query }

        

class UserGetHandler(webapp2.RequestHandler):
    def get(self, keywords):
        params = {'userKey':keywords,
                  'projection':'full'}
        query_result = get_google_user(params)
        responde_with_results(self,query_result)


class SimpleGroupSearchHandler(webapp2.RequestHandler):
    @decorator.app_auth_required
    def get(self, keywords):
        logging.info(keywords)
        params = {'domain': 'globalfoundries.com',
                 
                   }
        query_result = search_google_groups(params)
        # further filter the results to 
        
            
        responde_with_results(self,query_result)

