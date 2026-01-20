# backend/payment_core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('create_payment/', views.create_payment, name='create_payment'), 
    path('execute_payment/', views.execute_payment, name='execute_payment'),
]

# backend/payment_core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('create_payment/', views.create_payment, name='create_payment'), 
    path('execute_payment/', views.execute_payment, name='execute_payment'),
]