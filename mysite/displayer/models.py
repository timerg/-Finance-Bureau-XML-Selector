# -*- coding: utf-8 -*-
from django.db import models
from lxml import etree
# Create your models here.

def etree_default():
	return etree.ElementTree(etree.Element("root"))


class XmlSession(models.Model):
	xml_file_name = models.CharField(max_length=100)
	etreeString = models.BinaryField()
	save_time = models.CharField(max_length=25)
	delete_list = models.BinaryField()
	expire_at = models.DateField()
	def __str__(self):
		return self.save_time + "   " + self.xml_file_name



