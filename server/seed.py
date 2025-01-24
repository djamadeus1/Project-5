#!/usr/bin/env python3

from random import choice as rc
from faker import Faker
from app import app
from models import db, User, Contact, MediaFile, ContactMedia

fake = Faker()

if __name__ == '__main__':
    with app.app_context():
        print("Starting seed...")

        # Clear existing data
        ContactMedia.query.delete()
        Contact.query.delete()
        MediaFile.query.delete()
        User.query.delete()

        # Seed users
        print("Seeding users...")
        users = []
        for _ in range(5):  # Create 5 users
            user = User(
                username=fake.user_name(),
                email=fake.email(),
                password="password123"  # Replace with a hashed password if needed
            )
            users.append(user)
        
        db.session.add_all(users)
        db.session.commit()

        # Fetch users after adding
        users = db.session.query(User).all()

        # Seed contacts
        print("Seeding contacts...")
        contacts = []
        for _ in range(10):  # Create 10 contacts
            contact = Contact(
                user_id=rc([user.id for user in users]),
                name=fake.name(),
                email=fake.email(),
                phone=fake.phone_number(),
                company=fake.company(),
                discipline=fake.job()
            )
            contacts.append(contact)
        
        db.session.add_all(contacts)
        db.session.commit()

        # Seed media files
        print("Seeding media files...")
        media_files = []
        for _ in range(10):  # Create 10 media files
            media_file = MediaFile(
                user_id=rc([user.id for user in users]),
                file_url=fake.url(),
                file_type=rc(['audio', 'video', 'image']),
                title=fake.sentence(),
                description=fake.text()
            )
            media_files.append(media_file)
        
        db.session.add_all(media_files)
        db.session.commit()

        # Seed contact-media associations
        print("Seeding contact-media associations...")
        contact_media_associations = []
        for _ in range(10):
            association = ContactMedia(
                contact_id=rc([contact.id for contact in contacts]),
                media_file_id=rc([media.id for media in media_files]),
                role=rc(['Producer', 'Vocalist', 'Songwriter', 'Engineer'])
            )
            contact_media_associations.append(association)
        
        db.session.add_all(contact_media_associations)
        db.session.commit()

        print("Seeding complete!")