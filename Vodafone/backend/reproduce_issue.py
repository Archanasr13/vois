import urllib.request
import json

url = 'http://localhost:5000/api/phishing/click'
payload = {
    'user_id': 1,
    'simulation_id': 12345,
    'clicked': True
}

try:
    req = urllib.request.Request(url)
    req.add_header('Content-Type', 'application/json')
    jsondata = json.dumps(payload)
    jsondataasbytes = jsondata.encode('utf-8')
    req.add_header('Content-Length', len(jsondataasbytes))
    
    response = urllib.request.urlopen(req, jsondataasbytes)
    print(f"Status Code: {response.getcode()}")
    print(f"Response: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Response: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
