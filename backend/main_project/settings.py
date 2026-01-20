# backend/main_project/settings.py
from pathlib import Path
import os
import sys 
from dotenv import load_dotenv # 確保已 pip install python-dotenv


# ----------------------------------------------------
# 1. 基礎路徑與 App 搜尋路徑 (必須是檔案最前端)
# ----------------------------------------------------

# 確保 BASE_DIR 最先定義
BASE_DIR = Path(__file__).resolve().parent.parent.parent 

# T-1 最終修正：強制加入應用程式根目錄 (解決 payment_core 找不到的問題)
BACKEND_DIR = BASE_DIR / 'backend' 
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR)) 


# ----------------------------------------------------
# 2. 環境變數與安全配置
# ----------------------------------------------------

load_dotenv(os.path.join(BASE_DIR, '.env')) 

SECRET_KEY = 'django-insecure-test-key-for-development' 
DEBUG = True
ALLOWED_HOSTS = ['*'] 


# ----------------------------------------------------
# 3. PayPal 環境變數 (T-1 核心)
# ----------------------------------------------------

PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID')
PAYPAL_SECRET = os.environ.get('PAYPAL_SECRET')
PAYPAL_ENVIRONMENT = os.environ.get('PAYPAL_ENVIRONMENT', 'sandbox') 


# ----------------------------------------------------
# 4. 應用程式清單 (T-1 核心)
# ----------------------------------------------------

INSTALLED_APPS = [
    # Django 預設 Apps 
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # T-1 核心 Apps (確保已 pip install django-cors-headers)
    'corsheaders', 
    'payment_core', # <-- 我們的金流應用程式
]


# ----------------------------------------------------
# 5. 中介軟體與 CORS 設置 (T-1 核心)
# ----------------------------------------------------

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000", 
    "https://yidengxingke-project.onrender.com", 
]


# ----------------------------------------------------
# 6. URL 和 WSGI 配置
# ----------------------------------------------------

ROOT_URLCONF = 'backend.main_project.urls'
WSGI_APPLICATION = 'backend.main_project.wsgi.application'

# ... (Database, Timezone 等其他預設配置，保持原樣)