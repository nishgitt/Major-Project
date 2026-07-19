import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "college_assets.db")
print(f"Connecting to database at {db_path}...")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Set dummy bills for seeded assets
updates = [
    ("Dell Latitude 5420", "/uploads/dell_latitude_bill.pdf"),
    ("Blue Star 1.5 Ton AC", "/uploads/blue_star_ac_invoice.pdf"),
    ("Exide Mileage Bus Battery", "/uploads/exide_battery_bill.pdf")
]

for asset_name, bill_path in updates:
    cursor.execute(
        "UPDATE assets SET bill_document = ? WHERE asset_name = ?",
        (bill_path, asset_name)
    )
    print(f"Updated {asset_name} with bill document: {bill_path}")

conn.commit()
conn.close()
print("Successfully seeded purchase bills into database!")
