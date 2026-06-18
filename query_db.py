import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT id, tenant_id, username, email, password_hash, active FROM users")
    users = cursor.fetchall()
    print("=== Users in managemyopz_hr ===")
    for u in users:
        # Convert hex id to string
        user_id_hex = u[0].hex() if isinstance(u[0], bytes) else u[0]
        print(f"ID: {user_id_hex}, Tenant: {u[1]}, Username: {u[2]}, Email: {u[3]}, Hash: {u[4]}, Active: {u[5]}")
        
    conn.close()
except Exception as e:
    print("Error:", e)
