__author__ = 'nuthankumar.mallavaram@globalfoundries.com'
# -*- coding: utf-8 -*-
"""
Python file to load external library folder

"""

from google.appengine.ext import vendor
# Add any libraries installed in the "lib" folder.
vendor.add('lib')