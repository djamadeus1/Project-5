#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db, User, Contact, MediaFile, ContactMedia

fake = Faker()

if __name__ == '__main__':
    with app.app_context():
        print("Starting seed...")
        # Seed code goes here!

        # Clear existing data
        #ContactMedia.query.delete()
        Contact.query.delete()
        MediaFile.query.delete()

        # Fetch existing users
        users = db.session.query(User).all()

        # Seed contacts
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
        media_files = []
        for _ in range(10):  # Create 10 media files
            media_file = MediaFile(
                user_id=rc([user.id for user in users]),
                file_url=fake.url(),  # Generates a random placeholder URL
                file_type=rc(['audio', 'video', 'image']),  # Randomly choose media type
                title=fake.sentence(),
                description=fake.text()
            )
            media_files.append(media_file)

        db.session.add_all(media_files)
        db.session.commit()

        # Seed contact-media associations
        # contact_media_associations = []
        # for _ in range(10):
        #     association = ContactMedia(
        #         contact_id=rc([contact.id for contact in contacts]),
        #         media_file_id=rc([media.id for media in media_files]),
        #         role=rc(['Producer', 'Vocalist', 'Songwriter', 'Engineer'])
        #     )
        #     contact_media_associations.append(association)

        # db.session.add_all(contact_media_associations)
        # db.session.commit()


        print("Seeding complete!")
