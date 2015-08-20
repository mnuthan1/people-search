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
    app_name = db.StringProperty()
    owner = db.StringProperty()
    registered = db.DateTimeProperty()
    key_value = db.StringProperty()
