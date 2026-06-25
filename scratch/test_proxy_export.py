import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:5173/api"

def login(email, password):
    url = f"{BASE_URL}/v1/auth/login"
    payload = {"email": email, "password": password}
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode("utf-8"))
            return res_data["accessToken"]
    except Exception as e:
        print(f"Login failed: {e}")
        sys.exit(1)

def test_export_specific(token, format, ids):
    url = f"{BASE_URL}/v1/employees/export/{format}?ids={ids}"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "X-Tenant-ID": "ACME"
        },
        method="GET"
    )
    try:
        with urllib.request.urlopen(req) as res:
            print(f"\n--- Proxy Export {format.upper()} ---")
            print(f"Status: {res.status}")
            print(f"Content-Type: {res.headers.get('Content-Type')}")
            print(f"Content-Length: {res.headers.get('Content-Length')}")
            print(f"Content-Disposition: {res.headers.get('Content-Disposition')}")
            
            data = res.read()
            print(f"Size: {len(data)} bytes")
            print(f"Content repr: {repr(data[:300])}")
            
            filename = f"scratch/test_proxy_export.{format}"
            if format == "excel":
                filename = "scratch/test_proxy_export.xlsx"
            with open(filename, "wb") as f:
                f.write(data)
            print(f"Saved to {filename}")
            
    except urllib.error.HTTPError as e:
        print(f"Export {format} HTTP Error {e.code}: {e.read().decode('utf-8')[:500]}")
    except Exception as e:
        print(f"Export {format} failed: {e}")

if __name__ == "__main__":
    token = login("sarah.williams@acme.com", "Admin@123")
    test_export_specific(token, "csv", "025bafdb-e68d-4aeb-9d5c-5d69ca842214")
    test_export_specific(token, "excel", "025bafdb-e68d-4aeb-9d5c-5d69ca842214")
    test_export_specific(token, "pdf", "025bafdb-e68d-4aeb-9d5c-5d69ca842214")
