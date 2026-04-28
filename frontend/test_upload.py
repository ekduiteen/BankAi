import requests
import json
import tempfile
import os

# Create test file
test_file = os.path.join(tempfile.gettempdir(), 'test_upload.txt')
with open(test_file, 'wb') as f:
    f.write(b'Test file content for upload')

# Login with form data
print("Logging in...")
login_response = requests.post(
    'http://127.0.0.1:18000/api/auth/login',
    data={'username': 'admin@bankai.io', 'password': 'admin123'}
)

if login_response.status_code == 200:
    token = login_response.json()['access_token']
    print(f"Token obtained")
    
    # Try file upload
    with open(test_file, 'rb') as f:
        files = {'file': f}
        headers = {'Authorization': f'Bearer {token}'}
        
        print("Uploading file to session 25...")
        upload_response = requests.post(
            'http://127.0.0.1:18000/api/chat/sessions/25/files',
            files=files,
            headers=headers
        )
        
        print(f"Status: {upload_response.status_code}")
        print(f"Response: {json.dumps(upload_response.json(), indent=2)}")
else:
    print(f"Login failed: {login_response.status_code}")
