import json

har_path = r"C:\Users\Dhipak\Downloads\localhost.har"
try:
    with open(har_path, "r", encoding="utf-8") as f:
        har_data = json.load(f)
    
    entries = har_data.get("log", {}).get("entries", [])
    for i, entry in enumerate(entries):
        print(f"\n================ ENTRY {i+1} ================")
        print(json.dumps(entry, indent=2))
except Exception as e:
    print(f"Error: {e}")
