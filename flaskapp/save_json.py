import sqlite3
import json
import os

# Path to your SQLite database
db_path = "analysis.db"
output_json = "analysis_output.json"

# Connect to the SQLite database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get a list of all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

# Dictionary to hold the data
db_dict = {}

# Loop through tables and collect data
for (table_name,) in tables:
    cursor.execute(f"SELECT * FROM {table_name}")
    columns = [description[0] for description in cursor.description]
    rows = cursor.fetchall()

    table_data = []
    for row in rows:
        row_dict = {}
        for col, val in zip(columns, row):
            if isinstance(val, bytes):
                continue  # Skip byte columns
            row_dict[col] = val
        table_data.append(row_dict)

    db_dict[table_name] = table_data

# Save to JSON
with open(output_json, "w") as f:
    json.dump(db_dict, f, indent=2)

conn.close()

print(f"✅ Exported database to {output_json}, skipping any columns with bytes.")
