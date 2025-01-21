from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from flask_bcrypt import generate_password_hash, check_password_hash

from config import db

# Models go here!
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.String, nullable=False, unique=True)
    _password_hash = db.Column(db.String, nullable=False)  # Updated field
    picture_icon = db.Column(db.String)
    logo = db.Column(db.String)
    discipline = db.Column(db.String)
    bio = db.Column(db.Text)
    profile_pic = db.Column(db.String)  # URL or path for profile picture
    banner_url = db.Column(db.String)  # URL or path for banner

    contacts = db.relationship('Contact', back_populates='user')
    media_files = db.relationship('MediaFile', back_populates='user', cascade='all, delete-orphan')

    # Avoid exposing the password and prevent circular references
    serialize_rules = ('-password', '-media_files.user')

    # Define property to get and set password
    @property
    def password(self):
        raise AttributeError("Password is write-only")

    @password.setter
    def password(self, password):
        self._password_hash = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return check_password_hash(self._password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "picture_icon": self.picture_icon,
            "logo": self.logo,
            "discipline": self.discipline,
            "bio": self.bio
        }


class Contact(db.Model, SerializerMixin):
    __tablename__ = 'contacts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=False)
    company = db.Column(db.String, nullable=True)
    discipline = db.Column(db.String, nullable=True)
    contact_pic = db.Column(db.String, nullable=True)  

    user = db.relationship('User', back_populates='contacts')
    media_associations = db.relationship('ContactMedia', back_populates='contact')

    serialize_rules = ('-media_associations', '-user.contacts')

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "company": self.company,
            "discipline": self.discipline,
            "contact_pic": self.contact_pic  
        }


class MediaFile(db.Model, SerializerMixin):
    __tablename__ = 'media_files'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    file_url = db.Column(db.String, nullable=False)
    file_type = db.Column(db.String, nullable=False)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=True)

    user = db.relationship('User', back_populates='media_files')
    contact_associations = db.relationship('ContactMedia', back_populates='media_file')

    # Exclude contact associations from being serialized
    serialize_rules = ('-contact_associations', '-user.media_files')

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "file_url": self.file_url,
            "file_type": self.file_type,
            "title": self.title,
            "description": self.description
        }


class ContactMedia(db.Model, SerializerMixin):
    __tablename__ = 'contact_media'

    id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id'), nullable=False)
    media_file_id = db.Column(db.Integer, db.ForeignKey('media_files.id'), nullable=False)
    role = db.Column(db.String, nullable=True)

    contact = db.relationship('Contact', back_populates='media_associations')
    media_file = db.relationship('MediaFile', back_populates='contact_associations')

    # Exclude both sides to prevent circular serialization
    serialize_rules = ('-contact.media_associations', '-media_file.contact_associations')

    def to_dict(self):
        return {
            "id": self.id,
            "contact_id": self.contact_id,
            "media_file_id": self.media_file_id,
            "role": self.role
        }