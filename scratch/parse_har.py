import json

har_path = r"C:\Users\Dhipak\Downloads\localhost.har"
try:
    with open(har_path, "r", encoding="utf-8") as f:
        har_data = json.load(f)
    
    entries = har_data.get("log", {}).get("entries", [])
    print(f"Total entries found: {len(entries)}")
    for i, entry in enumerate(entries):
        req = entry.get("request", {})
        res = entry.get("response", {})
        url = req.get("url", "")
        method = req.get("method", "")
        status = res.get("status", 0)
        mime = res.get("content", {}).get("mimeType", "")
        size = res.get("content", {}).get("size", 0)
        
        print(f"\nEntry {i+1}: {method} {url}")
        print(f"  Response Status: {status}")
        print(f"  MimeType: {mime}, Content Size: {size}")
        
        headers = {h["name"].lower(): h["value"] for h in res.get("headers", [])}
        print(f"  Headers: content-disposition={headers.get('content-disposition')}")
        
        text = res.get("content", {}).get("text", "")
        if text:
            print(f"  Response Preview: {text[:300]}")
except Exception as e:
    print(f"Error reading HAR: {e}")
