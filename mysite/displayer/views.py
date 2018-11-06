# -*- coding: utf-8 -*-
# from __future__ import unicode_literals

from django.shortcuts import render, redirect
from django.template import loader
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http.response import HttpResponse
from django.contrib import messages

from lxml import etree

import lib.xmlEtreeLib as xel
from lxml.etree import ParseError

import codecs

from xmljson import badgerfish as bf
from json import dumps, loads
from datetime import datetime, date, timedelta
from types import NoneType

from .models import XmlSession


def index(request):
	error = ''
	if 'error' in request.GET:
		if (request.GET['error'] == 'xml-parse-error') :
			error = "XML 檔案格式錯誤，請重新上傳"
		elif (request.GET['error'] == 'xml-lost'):
			error = "XML 檔案已經不存在"
	fileList = XmlSession.objects.all().values_list('id', 'xml_file_name', 'save_time')
	if len(fileList) > 0:
		context = {
			"error": error,
			"file_list": dumps(list(fileList))
		}
	else:
		context = {
			"error": error
		}

	return render(request, 'displayer/index.html', context)


def handle_xml_upload(request):
	# xml_file = codecs.EncodedFile(request.FILES['xmlfile'], 'big5', errors='ignore')
	xml_file = request.FILES['xmlfile']
	string = ''

	if xml_file.multiple_chunks(chunk_size=100000):
		for chunk in xml_file.chunks():
			string += chunk
	else :
		string = xml_file.read()

	root = xel.parseString(string).root

	if type(root) is NoneType:
		return  redirect('/displayer/?error=xml-parse-error')
	else:

		time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
		expiredate = date.today() + timedelta(days=1)



		model = XmlSession(xml_file_name=xml_file.name, etreeString=string, save_time=time, expire_at=expiredate, delete_list='')
		model.save()

		return redirect('/displayer/handle_xml_pull/?query=' + str(model.id))



def handle_xml_pull(request):
	if 'query' in request.GET:
		xmlFileId = request.GET['query']
	else:
		xmlFileId = request.POST.__getitem__('fileId')

	try:
		f = XmlSession.objects.get(id__exact=xmlFileId)
	except ObjectDoesNotExist:
		return  redirect('/displayer/?error=xml-lost')

	result = xel.parseString(str(f.etreeString))

	root = result.root

	if type(root) is NoneType:
		return  redirect('/displayer/?error=xml-parse-error')
	else:
		request.session['fileId'] = xmlFileId
		context = {
			"file_json": dumps(bf.data(root)),
			"delete_list": f.delete_list,
			"file_name": f.xml_file_name,
			"parse_error": dumps(result.error)
		}
		return render(request, 'displayer/select.html', context)



def handle_submit(request):

	fileId = request.session.get('fileId')

	f = XmlSession.objects.get(id__exact=fileId)

	deleteList = loads(request.body)
	f.delete_list = request.body
	f.save()
	root = xel.parseString(str(f.etreeString))
	root = xel.removeList(root, deleteList)
	root = xel.fixRowNum(root)


	xml_data = xel.exportFromRoot(root)

	response = HttpResponse(xml_data)
	response['Content-Disposition'] = 'attachment; filename=' + f.xml_file_name


	return response

def handle_save(request):
	fileId = request.session.get('fileId')

	f = XmlSession.objects.get(id__exact=fileId)

	time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
	f.delete_list = request.body
	f.save_time = time
	f.save()


	return HttpResponse()


def handle_delete(request):
	fileId = request.session.get('fileId')

	f = XmlSession.objects.get(id__exact=fileId)

	f.delete()

	return redirect('/displayer/')
