import requests
import sys

try:
    print("Testing /api/cyber-health/report...")
    response = requests.get('http://localhost:5000/api/cyber-health/report')
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Success! Data received:")
        print(response.json().keys())
    else:
        print("Error Response:")
        print(response.text)
        
except Exception as e:
    print(f"Connection failed: {e}")
