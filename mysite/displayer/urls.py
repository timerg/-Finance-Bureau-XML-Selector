from django.conf.urls import url


from . import views

urlpatterns = [
	url(r'^$', views.index, name='index'),
	url(r'^handle_xml_pull/save/', views.handle_save),
	url(r'^handle_xml_pull/submit/', views.handle_submit),
	url(r'^handle_xml_pull/delete/', views.handle_delete),
	url(r'^handle_xml_upload/', views.handle_xml_upload),
	url(r'^handle_xml_pull/', views.handle_xml_pull),
]