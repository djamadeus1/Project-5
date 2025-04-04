from app import app, db
from models import Contact
import sqlite3

def add_social_fields():
    with app.app_context():
        try:
            # Connect to the existing database
            conn = sqlite3.connect('instance/app.db')
            cursor = conn.cursor()

            # Add social fields one by one
            fields = ['social1', 'social2', 'social3', 'social4']
            for field in fields:
                try:
                    cursor.execute(f'ALTER TABLE contacts ADD COLUMN {field} TEXT')
                except sqlite3.OperationalError as e:
                    if 'duplicate column name' not in str(e).lower():
                        raise e

            conn.commit()
            conn.close()
            print("Social fields added successfully!")
            
        except Exception as e:
            print(f"Error: {e}")
            conn.rollback()
            conn.close()

if __name__ == "__main__":
    add_social_fields()
