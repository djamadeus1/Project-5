#!/usr/bin/env python3

from sqlalchemy import or_, func
from datetime import timedelta
from flask import Flask, request, session, jsonify
from flask_restful import Resource
from flask_cors import CORS
from flask_session import Session
from config import app, db, api, bcrypt
from models import User, Contact, MediaFile, ContactMedia

# Configure Flask app
app.config.update(
    SECRET_KEY='your-secret-key-here',  # Add a secure secret key
    SESSION_TYPE='filesystem',
    SESSION_PERMANENT=False,
    PERMANENT_SESSION_LIFETIME=timedelta(minutes=60),
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=False,  # True in production
    SESSION_COOKIE_HTTPONLY=True
)

# Initialize sessions
Session(app)

# Configure CORS
CORS(app, 
     supports_credentials=True,
     resources={r"/*": {
         "origins": ["http://localhost:3000"],
         "methods": ["GET", "POST", "PUT", "DELETE"],
         "allow_headers": ["Content-Type", "Authorization"]
     }})

@app.route('/check_session')
def check_session():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return {"error": "Unauthorized"}, 401
            
        user = User.query.filter_by(id=user_id).first()
        if user:
            return {"id": user.id, "username": user.username}, 200
        return {"error": "User not found"}, 401
    except Exception as e:
        return {"error": str(e)}, 500

# Signup Resource
class Signup(Resource):
    def post(self):
        data = request.get_json()

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        # Check if user already exists
        if db.session.query(User).filter(or_(User.username == username, User.email == email)).first():
            return {"error": "User already exists"}, 409

        # Create new user and use the property setter for password
        new_user = User(username=username, email=email)
        new_user.password = password  # This automatically hashes the password

        # Add and commit the new user to the database
        db.session.add(new_user)
        db.session.commit()

        return {"message": "User created successfully"}, 201
    
class Login(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # Check if user exists
        user = db.session.query(User).filter(func.lower(User.username) == username.lower()).first()
        if not user:
            return {"error": "Invalid username and/or password"}, 401

        # Check if password matches using check_password()
        if not user.check_password(password):
            return {"error": "Invalid username and/or password"}, 401

        # Store user ID in session
        session['user_id'] = user.id
        print(f"Session set: {session.get('user_id')}")  # Debug statement to verify session

        # Return success message
        return {"message": f"Login successful {user.username}"}, 200
    
class CheckSession(Resource):
    def get(self):
        print(f"Checking session for user_id: {session.get('user_id')}")  # Existing log
        print(f"Session content: {dict(session)}")
        print(f"Session content during check_session: {dict(session)}")
        user_id = session.get('user_id')
        
        if not user_id:
            return {"error": "User not logged in"}, 401

        user = db.session.get(User, user_id)  # Modern replacement

        if user:
            response = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "picture_icon": user.picture_icon,
                "logo": user.logo,
                "discipline": user.discipline,
                "bio": user.bio
            }
            return response, 200

        return {"error": "User not found"}, 404
    
class Logout(Resource):
    def post(self):
        session.clear()  # This clears the session
        return {"message": "Logout successful"}, 200
    
class ContactsResource(Resource):
    def post(self):
        data = request.get_json()

        try:
            new_contact = Contact(
                user_id=data['user_id'],
                name=data['name'],
                email=data['email'],
                phone=data.get('phone'),
                company=data.get('company'),
                discipline=data.get('discipline')
            )

            db.session.add(new_contact)
            db.session.commit()
            return {"message": "Contact created successfully"}, 201
        except KeyError as e:
            return {"error": f"Missing required field: {str(e)}"}, 400
        except Exception as e:
            return {"error": str(e)}, 500
        
    def get(self):
        contacts = Contact.query.all()
        return [contact.to_dict() for contact in contacts], 200
    
    def patch(self, id):
        contact = Contact.query.get(id)
        if not contact:
            return {"error": "Contact not found"}, 404

        data = request.get_json()
        for key, value in data.items():
            setattr(contact, key, value)

        db.session.commit()
        return contact.to_dict(), 200
    
    def delete(self, id):
        contact = db.session.query(Contact).get(id)
        if not contact:
            return {"error": "Contact not found"}, 404

        db.session.delete(contact)
        db.session.commit()
        return {"message": "Contact deleted successfully"}, 204

class MediaFilesResource(Resource):
    def get(self):
        media_files = db.session.query(MediaFile).all()
        return [media_file.to_dict() for media_file in media_files], 200

    def post(self):
        data = request.get_json()
        try:
            new_media_file = MediaFile(
                user_id=data['user_id'],
                file_url=data['file_url'],
                file_type=data['file_type'],
                title=data['title'],
                description=data.get('description')
            )
            db.session.add(new_media_file)
            db.session.commit()
            return new_media_file.to_dict(), 201
        except Exception as e:
            return {"error": str(e)}, 400

class MediaFileResource(Resource):
    def patch(self, id):
        media_file = db.session.query(MediaFile).get(id)
        if not media_file:
            return {"error": "Media file not found"}, 404

        data = request.get_json()
        for key, value in data.items():
            setattr(media_file, key, value)

        db.session.commit()
        return media_file.to_dict(), 200

    def delete(self, id):
        media_file = db.session.query(MediaFile).get(id)
        if not media_file:
            return {"error": "Media file not found"}, 404

        db.session.delete(media_file)
        db.session.commit()
        return {"message": "Media file deleted"}, 204
    
class ContactMediaResource(Resource):
    def post(self):
        data = request.get_json()
        try:
            new_contact_media = ContactMedia(
                contact_id=data['contact_id'],
                media_file_id=data['media_file_id'],
                role=data.get('role')
            )
            db.session.add(new_contact_media)
            db.session.commit()
            return {"message": "ContactMedia created successfully"}, 201
        except KeyError as e:
            return {"error": f"Missing required field: {str(e)}"}, 400
        except Exception as e:
            return {"error": str(e)}, 500

    def get(self):
        contact_media = db.session.query(ContactMedia).all()
        return [cm.to_dict() for cm in contact_media], 200

    def delete(self, id):
        contact_media = db.session.query(ContactMedia).get(id)
        if not contact_media:
            return {"error": "ContactMedia not found"}, 404

        db.session.delete(contact_media)
        db.session.commit()
        return {"message": "ContactMedia deleted successfully"}, 200
    
    def patch(self, id):
        data = request.get_json()
        contact_media = db.session.query(ContactMedia).get(id)
        if not contact_media:
            return {"error": "ContactMedia not found"}, 404

        if "role" in data:
            contact_media.role = data["role"]

        db.session.commit()
        return {"message": "ContactMedia updated successfully"}
    
class Logout(Resource):
    def delete(self):
        session.clear()
        return {"message": "Successfully logged out"}, 200


# Add the route to your API
api.add_resource(Signup, '/signup')
api.add_resource(Login, '/login')
api.add_resource(CheckSession, '/check_session')
api.add_resource(Logout, '/logout')
api.add_resource(ContactsResource, '/contacts', '/contacts/<int:id>')
api.add_resource(MediaFilesResource, '/media_files')
api.add_resource(MediaFileResource, '/media_files/<int:id>')
api.add_resource(ContactMediaResource, '/contact_media', '/contact_media/<int:id>')


@app.route('/')
def index():
    return '<h1>Project Server</h1>'

# @app.route('/test_session')
# def test_session():
#     session['test'] = 'session works'
#     return {"message": "Session set"}

@app.route('/test_session')
def test_session():
    session['test_key'] = 'test_value'
    return {"message": "Session set"}

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5555, debug=True)