__author__ = 'nuthankumar.mallavaram@globalfoundries.com'
# -*- coding: utf-8 -*-
'''
This model class to represent application keys

Created on Jul 31, 2015

@author: nmallav1
'''
from google.appengine.ext import db

class Application(db.Model):
    """Models an individual Appliction entry with keys and date."""
    app = db.StringProperty()
    owner = db.StringProperty()
    registered = db.DateTimeProperty()
    key_value = db.StringProperty()

class Activity(db.Model):
    """Models an individual Appliction entry with keys and date."""
    app = db.StringProperty()
    user = db.StringProperty()
    time = db.DateTimeProperty()
    request = db.StringProperty()
    payload = db.IntegerProperty()
    
    @classmethod
    def query_book(cls, ancestor_key):
        return cls.query(ancestor=ancestor_key).order(-cls.date)


