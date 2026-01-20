# backend/paypal_api/views.py - T-1 核心邏輯
import os
import json
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from paypalcheckoutsdk.core import PayPalHttpClient, SandboxEnvironment
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest

# ---------------------------------------------------------------------
# 1. 設置 PayPal Client (使用 settings.py 中讀取的環境變數)
# ---------------------------------------------------------------------
client_id = settings.PAYPAL_CLIENT_ID
client_secret = settings.PAYPAL_SECRET

# 確保 settings.py 已配置 PAYPAL_ENVIRONMENT (sandbox/live)
environment = SandboxEnvironment(client_id, client_secret) 
client = PayPalHttpClient(environment)

# ---------------------------------------------------------------------
# T-1: Create Payment API 邏輯
# URL: /api/paypal/create_payment/
# ---------------------------------------------------------------------
@csrf_exempt
def create_payment(request):
    if request.method == 'POST':
        # 這裡應該從請求中解析訂單資訊 (例如: 價格、報告ID)
        try:
            data = json.loads(request.body)
            report_id = data.get('report_id', 'TEST_REPORT_XYZ') # 假設我們要付費解鎖的報告 ID
        except:
            return JsonResponse({'error': 'Invalid request body'}, status=400)
            
        request_obj = OrdersCreateRequest()
        request_obj.headers['Content-Type'] = 'application/json'
        
        # 假設固定價格為 299 TWD
        request_obj.prefer('return=representation')
        request_obj.request_body(
            {
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "amount": {
                            "currency_code": "TWD",
                            "value": "299.00" 
                        },
                        "custom_id": report_id, # 將報告 ID 存入自定義欄位，用於驗證
                        "description": "易燈星科 - 專業命理報告解鎖"
                    }
                ],
                # 設置成功和失敗的回調 URL，前端需要
                "application_context": {
                    "return_url": "http://localhost:3000/payment/success", 
                    "cancel_url": "http://localhost:3000/payment/cancel"
                }
            }
        )

        try:
            response = client.execute(request_obj)
            # 成功創建訂單，回傳 Order ID 和導向連結給前端
            return JsonResponse({
                'order_id': response.result.id,
                'links': response.result.links # 前端需要從這裡找到 approval link
            })
        except Exception as e:
            print(f"PayPal API Error: {e}")
            return JsonResponse({'error': 'Failed to create PayPal order'}, status=500)
    return HttpResponse(status=405) # 只接受 POST

# ---------------------------------------------------------------------
# T-1: Execute Payment API 邏輯 (回調/捕捉交易)
# URL: /api/paypal/execute_payment/
# ---------------------------------------------------------------------
@csrf_exempt
def execute_payment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = data.get('order_id')
        except:
            return JsonResponse({'error': 'Invalid request body'}, status=400)
            
        request_obj = OrdersCaptureRequest(order_id)
        
        try:
            response = client.execute(request_obj)
            
            # 檢查交易狀態
            if response.result.status == "COMPLETED":
                # 獲取自定義 ID (報告 ID)
                captured_report_id = response.result.purchase_units[0].custom_id
                
                # ----------------------------------------------------
                # **T-3: 解鎖驗證邏輯核心**
                # 應在這裡更新資料庫，將 'captured_report_id' 標記為 '已付費'
                # ----------------------------------------------------
                # (資料庫更新邏輯將在下一步加入)
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Payment completed and report unlocked.',
                    'report_id': captured_report_id
                })
            else:
                return JsonResponse({'status': 'failed', 'message': f'Payment status: {response.result.status}'})
                
        except Exception as e:
            print(f"PayPal Capture Error: {e}")
            return JsonResponse({'error': 'Failed to capture PayPal payment'}, status=500)
    return HttpResponse(status=405)