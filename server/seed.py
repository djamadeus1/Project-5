#!/usr/bin/env python3

from app import app
from models import db, User, Contact, MediaFile, ContactMedia
from werkzeug.security import generate_password_hash

def seed_database():
    print("Starting seed...")

    # Clear existing data
    ContactMedia.query.delete()
    Contact.query.delete()
    MediaFile.query.delete()
    User.query.delete()

    # Create a test user
    test_user = User(
        username="testuser",
        email="test@example.com",
        password="password123"  # Will be hashed by the model
    )
    db.session.add(test_user)
    db.session.commit()

    # Add your actual media files
    media_files = [
        MediaFile(
            user_id=test_user.id,
            file_url="/uploads/Famemba_premix_test.mp3",
            file_type="audio/mpeg",
            title="Famemba Premix"
        ),
        MediaFile(
            user_id=test_user.id,
            file_url="/uploads/Bump_Do_U_Wanna_Master_1-4KE_2HQBX.mp3",
            file_type="audio/mpeg",
            title="Bump Do U Wanna"
        )
    ]
    db.session.add_all(media_files)
    db.session.commit()

    # Create a test contact
    contact = Contact(
        user_id=test_user.id,
        name="Test Contact",
        email="contact@test.com",
        phone="555-0123",
        company="Test Studio",
        discipline="Audio Engineer"
    )
    db.session.add(contact)
    db.session.commit()

    # Create contact-media associations
    for media in media_files:
        contact_media = ContactMedia(
            contact_id=contact.id,
            media_file_id=media.id,
            role="Creator"
        )
        db.session.add(contact_media)
    
    db.session.commit()
    print("Seed completed successfully!")

if __name__ == "__main__":
    with app.app_context():
        seed_database()