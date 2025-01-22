#!/usr/bin/env python3

from sqlalchemy import or_, func
from datetime import timedelta
from flask import Flask, request, session, jsonify, make_response
from flask_restful import Resource
from flask_cors import CORS
from flask_session import Session
from config import app, db, api, bcrypt
from models import User, Contact, MediaFile, ContactMedia
from werkzeug.security import check_password_hash
from flask import send_from_directory

from werkzeug.utils import secure_filename
import os

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp3', 'wav'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
         "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
         "allow_headers": ["Content-Type"],
         "allow_credentials": True
     }})

# @app.route('/check_session')
# def check_session():
#     try:
#         user_id = session.get('user_id')
#         if not user_id:
#             return {"error": "Unauthorized"}, 401
            
#         user = User.query.filter_by(id=user_id).first()
#         if user:
#             return {"id": user.id, "username": user.username}, 200
#         return {"error": "User not found"}, 401
#     except Exception as e:
#         return {"error": str(e)}, 500

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
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "picture_icon": user.picture_icon,
            "logo": user.logo,
            "discipline": user.discipline,
            "bio": user.bio
        }, 200
    
class CheckSession(Resource):
    def get(self):
        # print(f"Checking session for user_id: {session.get('user_id')}")  # Debug log
        # print(f"Session content: {dict(session)}")

        user_id = session.get('user_id')
        
        if not user_id:
            return {"error": "User not logged in"}, 401

        # Fetch user from the database using db.session.get (modern SQLAlchemy approach)
        user = db.session.get(User, user_id)

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
            print(f"User found: {response}")  # Additional log for successful retrieval
            return make_response(response, 200)

        print("User not found in the database")  # Log for user not found case
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

from flask import jsonify  # Ensure this is imported

class MediaFilesResource(Resource):
    def get(self):
        try:
            # Query all media files
            media_files = db.session.query(MediaFile).all()
            media_list = []

            for media in media_files:
                # Get all contacts associated with this media file
                contacts = (
                    db.session.query(Contact)
                    .join(ContactMedia, Contact.id == ContactMedia.contact_id)
                    .filter(ContactMedia.media_file_id == media.id)
                    .all()
                )

                # Convert contacts to dictionary format
                contact_data = [
                    {
                        "id": contact.id,
                        "name": contact.name,
                        "email": contact.email,
                        "phone": contact.phone,
                        "company": contact.company,
                        "discipline": contact.discipline,
                    }
                    for contact in contacts
                ]

                # Append media file with associated contacts
                media_list.append({
                    "id": media.id,
                    "user_id": media.user_id,
                    "file_url": media.file_url,
                    "file_type": media.file_type,
                    "title": media.title,
                    "description": media.description,
                    "contacts": contact_data  # ✅ Adding associated contacts here
                })

            return media_list, 200  # ✅ Correct return format
        except Exception as e:
            return {"error": str(e)}, 500  # ✅ Catch errors and return JSON response
    
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

@app.route('/verify_password', methods=['POST'])
def verify_password():
    data = request.get_json()
    username = data.get("username")  # This is correctly retrieved from request data
    password = data.get("password")

    # Fix: Query the user by username, not user_id
    user = db.session.query(User).filter_by(username=username).first()

    if user and user.check_password(password):  
        session["user_id"] = user.id  # Keep user logged in
        return jsonify({"message": "Password verified"}), 200
    else:
        return jsonify({"error": "Invalid password"}), 401

@app.route('/check_business_auth', methods=['GET', 'POST'])
def check_business_auth():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user = db.session.get(User, user_id)
    if user:
        session['business_mode'] = True
        return jsonify({"message": "Authorized"}), 200
    return jsonify({"error": "User not found"}), 404

# Add new routes for CRUD operations

@app.route('/update_profile_pic', methods=['PATCH'])
def update_profile_pic():
    if 'user_id' not in session:
        return {"error": "Unauthorized"}, 401

    if 'profile_pic' not in request.files:
        return {"error": "No file provided"}, 400
    
    file = request.files['profile_pic']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        user = db.session.get(User, session['user_id'])
        user.picture_icon = f"/uploads/{filename}"
        print(f"Saving profile pic for user {user.id}: /uploads/{filename}")
        db.session.commit()
        
        return user.to_dict(), 200
    return {"error": "Invalid file type"}, 400

@app.route('/update_banner', methods=['PATCH'])
def update_banner():
    if 'user_id' not in session:
        return {"error": "Unauthorized"}, 401

    if 'banner' not in request.files:
        return {"error": "No file provided"}, 400
    
    file = request.files['banner']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        user = db.session.get(User, session['user_id'])
        user.logo = f"/uploads/{filename}"
        db.session.commit()
        
        return user.to_dict(), 200
    return {"error": "Invalid file type"}, 400

@app.route('/contacts/<int:id>', methods=['PATCH'])
def update_contact(id):
    contact = db.session.query(Contact).get(id)
    if not contact:
        return {"error": "Contact not found"}, 404

    if 'contact_pic' not in request.files:
        return {"error": "No file provided"}, 400

    file = request.files['contact_pic']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        contact.contact_pic = f"/uploads/{filename}" 
        db.session.commit()

        return contact.to_dict(), 200

    return {"error": "Invalid file type"}, 400

@app.route('/upload_media', methods=['POST'])
def upload_media():
    if 'user_id' not in session:
        return {"error": "Unauthorized"}, 401

    if 'media' not in request.files:
        return {"error": "No file provided"}, 400
    
    file = request.files['media']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        new_media = MediaFile(
            user_id=session['user_id'],
            file_url=f"/uploads/{filename}",
            file_type=file.content_type,
            title=filename
        )
        db.session.add(new_media)
        db.session.commit()
        
        return new_media.to_dict(), 201
    return {"error": "Invalid file type"}, 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

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