import urllib.request
import json
import os

login_url = "http://localhost:5173/api/v1/auth/login"
login_data = json.dumps({"email": "employee@managemyopz.com", "password": "Admin@123"}).encode('utf-8')
login_req = urllib.request.Request(login_url, data=login_data, headers={"Content-Type": "application/json"}, method='POST')

try:
    with urllib.request.urlopen(login_req) as resp:
        res_data = json.loads(resp.read().decode('utf-8'))
        token = res_data.get("accessToken")
        print(f"Logged in successfully via proxy.")
except Exception as e:
    print(f"Login failed via proxy: {e}")
    exit(1)

for fmt in ['csv', 'excel', 'pdf']:
    export_url = f"http://localhost:5173/api/v1/employees/export/{fmt}"
    export_req = urllib.request.Request(export_url, method='GET')
    export_req.add_header('Authorization', f'Bearer {token}')
    export_req.add_header('X-Tenant-Id', 'ACME')

    try:
        with urllib.request.urlopen(export_req) as resp:
            print(f"\nFormat: {fmt.upper()}")
            print(f"  Status: {resp.status}")
            print(f"  Content-Type: {resp.info().get('Content-Type')}")
            print(f"  Content-Disposition: {resp.info().get('Content-Disposition')}")
            content = resp.read()
            print(f"  Downloaded: {len(content)} bytes")
            if len(content) > 200 and fmt == 'csv':
                print(f"  First 100 chars: {content[:100]}")
    except Exception as e:
        print(f"  Failed for {fmt}: {e}")
