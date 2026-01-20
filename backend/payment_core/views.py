# backend/payment_core/views.py - T-1 核心邏輯
import os
import json
from django.conf import settings 
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from paypalcheckoutsdk.core import PayPalHttpClient, SandboxEnvironment
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest

# ---------------------------------------------------------------------
# 1. 設置 PayPal Client (從 settings.py 讀取金鑰)
# ---------------------------------------------------------------------
try:
    client_id = settings.PAYPAL_CLIENT_ID 
    client_secret = settings.PAYPAL_SECRET
    
    # 使用 SandboxEnvironment 進行測試
    environment = SandboxEnvironment(client_id, client_secret) 
    client = PayPalHttpClient(environment)
except AttributeError:
    client = None 

# ---------------------------------------------------------------------
# T-1: Create Payment API 邏輯 (發起訂單)
# ---------------------------------------------------------------------
@csrf_exempt
def create_payment(request):
    if client is None:
        return JsonResponse({'error': 'Server configuration error: PayPal keys missing.'}, status=500)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            report_id = data.get('report_id', f'REPORT_{os.urandom(8).hex()}') 
            price = data.get('price', '299.00') # 假設預設價格 299 TWD
        except:
            return JsonResponse({'error': 'Invalid request data'}, status=400)
            
        request_obj = OrdersCreateRequest()
        request_obj.headers['Content-Type'] = 'application/json'
        request_obj.prefer('return=representation')
        request_obj.request_body(
            {
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "amount": {
                            "currency_code": "TWD",
                            "value": price 
                        },
                        "custom_id": report_id, # 將報告 ID 存入 custom_id
                        "description": "易燈星科 - 專業報告解鎖服務"
                    }
                ],
                "application_context": {
                    "return_url": "http://localhost:3000/payment/success", 
                    "cancel_url": "http://localhost:3000/payment/cancel"
                }
            }
        )

        try:
            response = client.execute(request_obj)
            return JsonResponse({
                'order_id': response.result.id,
                'links': response.result.links 
            })
        except Exception as e:
            print(f"PayPal API Error: {e}")
            return JsonResponse({'error': 'Failed to create PayPal order'}, status=500)
    return HttpResponse(status=405)

# ---------------------------------------------------------------------
# T-1: Execute Payment API 邏輯 (捕捉交易 - T-3 解鎖核心)
# ---------------------------------------------------------------------
@csrf_exempt
def execute_payment(request):
    if client is None:
        return JsonResponse({'error': 'Server configuration error: PayPal keys missing.'}, status=500)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = data.get('order_id') 
        except:
            return JsonResponse({'error': 'Invalid request data'}, status=400)
            
        request_obj = OrdersCaptureRequest(order_id)
        
        try:
            response = client.execute(request_obj)
            
            if response.result.status == "COMPLETED":
                captured_report_id = response.result.purchase_units[0].custom_id
                
                # *** T-3: 資料庫解鎖邏輯將在這裡發生 ***
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Payment completed and report unlocked.',
                    'order_id': order_id,
                    'report_id': captured_report_id 
                })
            else:
                return JsonResponse({'status': 'failed', 'message': f'Payment status: {response.result.status}'})
                
        except Exception as e:
            print(f"PayPal Capture Error: {e}")
            return JsonResponse({'error': 'Failed to capture PayPal payment.'}, status=500)
    return HttpResponse(status=405)