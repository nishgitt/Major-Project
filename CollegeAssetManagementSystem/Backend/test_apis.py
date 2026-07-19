import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def make_request(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode("utf-8")
            return status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            err_json = json.loads(body)
        except Exception:
            err_json = {"error": body}
        return e.code, err_json
    except Exception as e:
        return 500, {"error": str(e)}

def run_tests():
    print("=== STARTING COLLEGE ASSET MANAGEMENT REST API TESTS ===")
    
    # Test 1: Admin Login
    print("\nTest 1: Admin Login (Valid Credentials)...")
    status, res = make_request("/admin/login/", "POST", {"username": "admin", "password": "admin123"})
    if status == 200 and "user" in res:
        print("[PASS] Success! Login authenticated correctly.")
    else:
        print(f"[FAIL] Failed! Status: {status}, Response: {res}")
        sys.exit(1)

    print("Test 1b: Admin Login (Invalid Credentials)...")
    status, res = make_request("/admin/login/", "POST", {"username": "admin", "password": "wrongpassword"})
    if status == 401:
        print("[PASS] Success! Correctly blocked bad credentials.")
    else:
        print(f"[FAIL] Failed! Expected 401 but got {status}")
        sys.exit(1)

    # Test 2: Get Categories
    print("\nTest 2: Get Categories list...")
    status, categories = make_request("/categories/")
    if status == 200 and isinstance(categories, list):
        print(f"[PASS] Success! Retrieved {len(categories)} categories.")
    else:
        print(f"[FAIL] Failed! Status: {status}")
        sys.exit(1)

    # Test 3: Add Category
    print("\nTest 3: Add a new Category...")
    new_cat = {"category_name": "Switchboard", "description": "Power socket and switchboards"}
    status, res = make_request("/categories/add/", "POST", new_cat)
    if status == 201 and "category_id" in res:
        cat_id = res["category_id"]
        print(f"[PASS] Success! Added Switchboard category with ID {cat_id}")
    else:
        print(f"[FAIL] Failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # Test 4: Update Category
    print("\nTest 4: Update Category...")
    updated_cat = {"category_name": "Power Switchboard", "description": "Upgraded switchboards"}
    status, res = make_request(f"/categories/update/{cat_id}/", "PUT", updated_cat)
    if status == 200:
        print("[PASS] Success! Category updated correctly.")
    else:
        print(f"[FAIL] Failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # Test 5: Get Assets
    print("\nTest 5: Get Assets list...")
    status, assets = make_request("/assets/")
    if status == 200 and isinstance(assets, list):
        print(f"[PASS] Success! Retrieved {len(assets)} assets.")
        initial_assets_count = len(assets)
    else:
        print(f"[FAIL] Failed! Status: {status}")
        sys.exit(1)

    # Test 6: Add Asset
    print("\nTest 6: Add Asset...")
    new_asset = {
        "asset_name": "Cisco Catalyst 9300",
        "category": "Router",
        "brand": "Cisco",
        "model": "Catalyst 9300",
        "serial_number": "CS-CAT-9300-99",
        "purchase_date": "2026-05-10",
        "purchase_price": 125000.00,
        "warranty_expiry": "2029-05-10"
    }
    status, res = make_request("/assets/add/", "POST", new_asset)
    if status == 201 and "asset_id" in res:
        asset_id = res["asset_id"]
        print(f"[PASS] Success! Added Cisco Catalyst 9300 with ID {asset_id}")
    else:
        print(f"[FAIL] Failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # Test 7: Update Asset
    print("\nTest 7: Update Asset Status to Under Maintenance...")
    new_asset["status"] = "Under Maintenance"
    status, res = make_request(f"/assets/update/{asset_id}/", "PUT", new_asset)
    if status == 200:
        print("[PASS] Success! Asset status updated to Under Maintenance.")
    else:
        print(f"[FAIL] Failed! Status: {status}")
        sys.exit(1)

    # Test 8: Allocations
    print("\nTest 8: Add Allocation...")
    new_alloc = {
        "asset_name": "Cisco Catalyst 9300",
        "department_name": "Computer Science & Engineering",
        "assigned_date": "2026-07-18",
        "maintenance_date": "2027-07-18",
        "maintenance_status": "Pending",
        "remarks": "Allocated as core CSE switch."
    }
    status, res = make_request("/allocations/add/", "POST", new_alloc)
    if status == 201 and "allocation_id" in res:
        alloc_id = res["allocation_id"]
        print(f"[PASS] Success! Allocated switch. Allocation ID {alloc_id}")
    else:
        print(f"[FAIL] Failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # Test 8.5: Upload file (Multipart form-data)
    print("\nTest 8.5: Upload file (Multipart form-data)...")
    boundary = "---ApiTestingBoundary"
    body = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="file"; filename="test_bill.txt"\r\n'
        "Content-Type: text/plain\r\n\r\n"
        "Dummy bill document contents for asset testing."
        f"\r\n--{boundary}--\r\n"
    ).encode("utf-8")
    
    url = f"{BASE_URL}/upload/"
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            res_body = response.read().decode("utf-8")
            res = json.loads(res_body) if res_body else {}
            if status == 201 and "url" in res:
                print(f"[PASS] Success! File uploaded successfully, URL: {res['url']}")
                uploaded_url = res["url"]
            else:
                print(f"[FAIL] Upload status: {status}, Response: {res}")
                sys.exit(1)
    except Exception as e:
        print(f"[FAIL] Upload failed with exception: {e}")
        sys.exit(1)

    # Test 9: Delete Allocation
    print("\nTest 9: Delete Allocation...")
    status, res = make_request(f"/allocations/delete/{alloc_id}/", "DELETE")
    if status == 200:
        print("[PASS] Success! Deleted allocation.")
    else:
        print(f"[FAIL] Failed! Status: {status}")
        sys.exit(1)

    # Test 10: Delete Asset
    print("\nTest 10: Delete Asset...")
    status, res = make_request(f"/assets/delete/{asset_id}/", "DELETE")
    if status == 200:
        print("[PASS] Success! Deleted test asset.")
    else:
        print(f"[FAIL] Failed! Status: {status}")
        sys.exit(1)

    # Test 11: Delete Category
    print("\nTest 11: Delete Category...")
    status, res = make_request(f"/categories/delete/{cat_id}/", "DELETE")
    if status == 200:
        print("[PASS] Success! Deleted test category.")
    else:
        print(f"[FAIL] Failed! Status: {status}")
        sys.exit(1)

    print("\n=== ALL REST API INTEGRATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
