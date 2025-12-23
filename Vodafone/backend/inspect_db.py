import sqlite3
import os
p = os.path.join(os.path.dirname(__file__), 'cybersecurity_training.db')
print('DB file:', p, '\n')
conn = sqlite3.connect(p)
cur = conn.cursor()
for table in ['quiz_question', 'simulation']:
    print('Table:', table)
    try:
        cur.execute(f"PRAGMA table_info('{table}')")
        rows = cur.fetchall()
        if not rows:
            print('  (no such table or no columns)')
        for r in rows:
            print('  ', r)
    except Exception as e:
        print('  Error:', e)
    print()
conn.close()
