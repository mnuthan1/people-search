__author__ = 'nuthankumar.mallavaram@globalfoundries.com'
# -*- coding: utf-8 -*-
'''
This module serve as crypto util to encrypt and decrypt using AES

Created on Aug 4, 2015

@author: nmallav1
'''
from Crypto.Cipher import AES
import base64
from Crypto import Random
import logging

BS = 16
pad = lambda s: s + (BS - len(s) % BS) * '\f'
unpad = lambda s : s.rstrip('\f')

class Cipher:
  

    @staticmethod
    def decrypt( enc,key ):
        enc = base64.b64decode(enc)
        
        #logging.info(enc);
        iv = enc[:16]
        cipher = AES.new(key, AES.MODE_CBC, iv )
        dec = cipher.decrypt( enc[16:] )
        logging.info(dec)
        #logging.info( unpad(dec))
        return unpad(dec)

    @staticmethod
    def encrypt( raw,key ):
        raw = pad(raw)
        iv = Random.new().read( 16 )
        cipher = AES.new(key, AES.MODE_CBC, iv )
        return base64.b64encode( iv + cipher.encrypt( raw ) ) 



