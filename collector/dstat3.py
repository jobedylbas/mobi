#!/usr/bin/env python3


# Adding useful libraries
try:
	import sys, os, time, sched, re, getopt, fnmatch, pip
	import types, resource, getpass, glob, linecache
    #import json, pprint, socket
	import subprocess, datetime
    #from elasticsearch import Elasticsearch
    #from collections import OrderedDict
    #from thread import *
	#import requests
    #import threading
    #from pymongo import * # To use mongo DB
    #from uuid import * # To create unique ids
except:
	sys.exit('Error: Error when loading libraries')

if sys.version_info < (3, 4):
	sys.exit('Error: Python 3.4 or later required')

class dstat():
	def open(self, *filenames):
		#"Open stat file descriptor"
		self.file = []
		self.fd = []
		for filename in filenames:
			try:
				fd = dopen(filename)
				if fd:
					self.file.append(filename)
					self.fd.append(fd)
			except:
				pass
		if not self.fd:
			raise Exception('Cannot open file {}'.format(filename))


class dstat_cpu():
	def __init__(self):
		self.nick = ('usr', 'sys', 'idl', 'wai', 'stl')
		self.type = 'p'
		self.width = 3
		self.scale = 34
		self.open('/proc/stat')
		self.cols = 5

	def discover(self, *objects):        
		ret = []
		for l in self.splitlines():
			if len(l) < 9 or l[0][0:3] != 'cpu': continue
			ret.append(l[0][3:])
		ret.sort()
		for item in objlist: ret.append(item)
		return ret

	def vars(self):
		ret = []
		if (op.cpulist  and 'all' in op.cpulist) or op.full:
			varlist = []
			cpu = 0
			while cpu < cpunr:
				varlist.append(str(cpu))
				cpu = cpu + 1
			varlist.append('total')
#           if len(varlist) > 2: varlist = varlist[0:2]
		elif op.cpulist:
			varlist = op.cpulist
		else:
			varlist = ('total',)
		for name in varlist:
			if name in self.discover + ['total']:
				ret.append(name)
		return ret

	def name(self):
		ret = []
		for name in self.vars:
			if name == 'total':
				ret.append('total cpu usage')
			else:
				ret.append('cpu' + name + ' usage')
			return ret

	def extract(self):
		for l in self.splitlines():
			if len(l) < 9: continue
			for name in self.vars:
				if l[0] == 'cpu' + name or ( l[0] == 'cpu' and name == 'total' ):
					self.set2[name] = ( long(l[1]) + long(l[2]) + long(l[6]) + long(l[7]), long(l[3]), long(l[4]), long(l[5]), long(l[8]) )

		for name in self.vars:
			for i in range(self.cols):
				if sum(self.set2[name]) > sum(self.set1[name]):
					self.val[name][i] = 100.0 * (self.set2[name][i] - self.set1[name][i]) / (sum(self.set2[name]) - sum(self.set1[name]))
				else:
					self.val[name][i] = 0
#                    print >>sys.stderr, "Error: tick problem detected, this should never happen !"

		if step == op.delay:
			self.set1.update(self.set2)