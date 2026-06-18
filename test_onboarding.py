import urllib.request
import urllib.error
import json
import sys

def run_test():
    print("=== STARTING ONBOARDING API INTEGRATION TEST ===")
    
    # 1. Authenticate as Admin to retrieve JWT Token
    print("\n[Step 1] Authenticating as Admin...")
    login_data = json.dumps({
        "email": "admin@managemyopz.com",
        "password": "Admin@123"
    }).encode('utf-8')
    
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/auth/login",
        data=login_data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    token = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            token = resp_data.get("accessToken")
            print("Successfully authenticated.")
    except urllib.error.HTTPError as err:
        print(f"Auth failed with HTTP status: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)
    except Exception as ex:
        print(f"Auth request failed: {ex}")
        sys.exit(1)
        
    if not token:
        print("Failed to retrieve token from auth response.")
        sys.exit(1)

    # 2. Invoke Onboarding Orchestrator Endpoint
    print("\n[Step 2] Sending onboarding request to /api/v1/onboarding...")
    
    import random
    emp_suffix = str(random.randint(1000, 9999))

    # Construct complete payload representing all 8 wizard steps
    onboarding_payload = {
        "firstName": "Alex",
        "lastName": "Rivera",
        "workEmail": f"alex.rivera.{emp_suffix}@managemyopz.com",
        "personalEmail": f"alex.rivera.personal.{emp_suffix}@gmail.com",
        "phone": "9876543210",
        "emergencyPhone": "9876543211",
        "gender": "MALE",
        "dateOfBirth": "1992-04-15",
        
        "organizationId": "6841af62-9c16-431b-a8c2-a3adba1dc47a",
        "dateOfJoining": "2026-07-01",
        "department": "Engineering",
        "designation": "Staff Software Engineer",
        "location": "San Francisco, CA",
        "workMode": "HYBRID",
        "employmentStatus": "ACTIVE",
        
        "pan": "ABCDE9999F",
        "aadhaar": "999988887777",
        "uan": "100990099009",
        "esic": "31123456780011002",
        
        "bankName": "Silicon Valley Bank",
        "accountNumber": "9988112244",
        "ifsc": "SVTX0000231",
        
        "skills": [
            {"skillName": "React", "skillLevel": "EXPERT"},
            {"skillName": "Spring Boot", "skillLevel": "EXPERT"}
        ],
        "certifications": [
            {"certificationName": "AWS Solutions Architect", "issuer": "Amazon Web Services"}
        ],
        
        "relationships": [
            {"relationshipType": "MANAGER", "relatedEmployeeId": "00000000-0000-0000-0000-000000000003"},
            {"relationshipType": "HRBP", "relatedEmployeeId": "00000000-0000-0000-0000-000000000003"}
        ],
        
        "documents": [
            {
                "documentType": "IDENTITY_DOC",
                "documentName": "passport.pdf",
                "documentUrl": "https://storage.managemyopz.com/docs/passport.pdf",
                "verificationStatus": "PENDING"
            }
        ]
    }
    
    payload_bytes = json.dumps(onboarding_payload).encode('utf-8')
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/onboarding",
        data=payload_bytes,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        },
        method='POST'
    )
    
    created_employee = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            print("Onboarding Response Code:", resp.status)
            print("Success Message:", resp_data.get("message"))
            created_employee = resp_data.get("data")
            print("Created Digital Twin ID:", created_employee.get("id"))
            print("System Generated Employee Code:", created_employee.get("employeeCode"))
    except urllib.error.HTTPError as err:
        print(f"Onboarding failed with HTTP status: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)
    except Exception as ex:
        print(f"Onboarding request failed: {ex}")
        sys.exit(1)

    # 3. Retrieve Employees Directory List to verify new twin exists
    print("\n[Step 3] Fetching Employee Directory to verify record...")
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/employees",
        headers={
            'Authorization': f'Bearer {token}'
        },
        method='GET'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            employees = json.loads(resp.read().decode('utf-8')).get("data", [])
            print(f"Retrieved {len(employees)} employees from registry.")
            
            # Check if our created employee is in the registry
            found = False
            for emp in employees:
                if emp.get("id") == created_employee.get("id"):
                    print(f"\n[SUCCESS] Found newly onboarded employee twin in the registry!")
                    print(f"  Name: {emp.get('firstName')} {emp.get('lastName')}")
                    print(f"  Generated Code: {emp.get('employeeCode')}")
                    print(f"  Email: {emp.get('workEmail')}")
                    print(f"  PAN: {emp.get('pan')}")
                    print(f"  Aadhaar: {emp.get('aadhaar')}")
                    found = True
                    break
            
            if not found:
                print("\n[FAILURE] Newly onboarded employee was not found in the directory response.")
                sys.exit(1)
                
    except urllib.error.HTTPError as err:
        print(f"Failed to retrieve directory: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)
    except Exception as ex:
        print(f"Directory request failed: {ex}")
        sys.exit(1)
        
    print("\n=== ALL INTEGRATION CHECKS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_test()
