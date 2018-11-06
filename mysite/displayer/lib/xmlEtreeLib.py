# -*- coding: utf-8 -*-
	## 1st line prevent error caused by chinese in code

import codecs
import io
import glob, os
import fnmatch
import sys
from lxml import etree
from lxml.etree import ParseError

from lxml.etree import XMLSyntaxError

import collections
Maybe = collections.namedtuple('Maybe', ['root', 'error'])




def fixRowNum(root):
	count = 1
	for r in root.findall("ROW"):
		r.set('num', str(count))
		count = count + 1
	return root


def addnum(root):
	count = 1
	for r in root.findall("�ץ�".decode('big5')):
		r.set('num', str(count))
		count = count + 1
	return root


def parseString(string):
	try:
		xmlp = etree.XMLParser(encoding='cp950', remove_blank_text=False, recover=True)
		root = etree.fromstring(string, xmlp)
	except XMLSyntaxError:
		xmlp = etree.XMLParser(encoding='cp950', remove_blank_text=False, load_dtd=True, ns_clean=False)
		root = etree.fromstring(string, xmlp)

	errors = []
	for e in xmlp.error_log:
		errors.append(e.message + '\n')


	if root.find("ROW") == None:
		root = addnum(root)

	result = Maybe(root, errors)

	return result

def removeList(root, list):
	x = 0
	rTag = "ROW"
	if root.find(rTag) == None:
		rTag = "�ץ�".decode('big5')

	for r in root.findall(rTag):
		if list[x][u'toDelete'] == True :
			root.remove(r)
		if(list[x][u'num'] != r.get('num')):
			print "num is different" + r.get('num') + r.get('num')
		x = x + 1


	return root

def exportFromRoot(root):

	tree = root.getroottree()
	encoding = tree.docinfo.encoding
	if root.find("ROW") == None:
		doctypeString = '<!DOCTYPE ROWSET SYSTEM "�D�װe.DTD" [\n<!ENTITY  % �򥻼���  SYSTEM "94_�ɮװ򥻼���.ent" >\n<!ENTITY  % �洫�μ���  SYSTEM "94_�ɮץ洫�μ���.ent" >\n<!ENTITY  % �D�װe����  SYSTEM "94_�D�װe����.ent" >\n]>'
		xml_data = etree.tostring(tree, pretty_print=True, xml_declaration=True, method='xml', encoding=encoding, doctype=doctypeString.decode('big5'))
	else:
		xml_data = etree.tostring(tree, pretty_print=True, xml_declaration=True, method='xml', encoding=encoding)
	return xml_data