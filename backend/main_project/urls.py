# backend/main_project/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # T-1 任務: 導入金流 API 路由
    path('api/paypal/', include('payment_core.urls')), 
]

# backend/payment_core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('create_payment/', views.create_payment, name='create_payment'), 
    path('execute_payment/', views.execute_payment, name='execute_payment'),
]