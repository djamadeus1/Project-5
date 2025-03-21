#!/usr/bin/env python3
import json
from sqlalchemy import or_, func
from datetime import timedelta
from flask import Flask, request, session, jsonify, make_response, send_from_directory
from flask_restful import Resource
from flask_cors import CORS
from flask_session import Session
from config import app, db, api, bcrypt
from models import User, Contact, MediaFile, ContactMedia, Project, ProjectMedia
from werkzeug.security import check_password_hash
# from flask import send_from_directory

from werkzeug.utils import secure_filename
import os

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp3', 'wav'}

app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

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
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "max_age": 3600
    }}
)

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
    def delete(self):
        session.clear()
        return {"message": "Successfully logged out"}, 200
    
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
            return new_contact.to_dict(), 201  # This ensures the frontend receives the full contact data
        except KeyError as e:
            return {"error": f"Missing required field: {str(e)}"}, 400
        except Exception as e:
            return {"error": str(e)}, 500
        
    def get(self):
        contacts = Contact.query.all()
        return [contact.to_dict() for contact in contacts], 200
    
    def patch(self, id):
        contact = db.session.get(Contact, id)
        if not contact:
            return {"error": "Contact not found"}, 404

        data = request.get_json()
        for key, value in data.items():
            setattr(contact, key, value)

        db.session.commit()
        return contact.to_dict(), 200
    
    def delete(self, id):
        contact = db.session.get(Contact, id)
        if not contact:
            return {"error": "Contact not found"}, 404

        db.session.delete(contact)
        db.session.commit()
        return {"message": "Contact deleted successfully"}, 204

from flask import jsonify  # Ensure this is imported

class MediaFilesResource(Resource):
    def get(self):
        try:
            media_files = db.session.query(MediaFile).all()
            return [media.to_dict() for media in media_files], 200
        except Exception as e:
            return {"error": str(e)}, 500
    
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
    def get(self, id):
        media = db.session.get(MediaFile, id)
        if not media:
            return {"error": "Media file not found"}, 404
        return media.to_dict(), 200

    def patch(self, id):
        # print(f"Headers received: {dict(request.headers)}")
        # print(f"Data received: {request.get_json()}")
        media = db.session.get(MediaFile, id)
        if not media:
            return {"error": "Media file not found"}, 404

        data = request.get_json()
        # print("Received update data:", data)  # Debug log

        try:
            if 'title' in data:
                media.title = data['title']
            if 'description' in data:
                media.description = data['description']

            # Handle contact associations if provided
            if 'contacts' in data:
                # Clear existing associations first
                ContactMedia.query.filter_by(media_file_id=id).delete()
                
                for contact_data in data['contacts']:
                    contact_id = contact_data.get('contact_id')
                    if not contact_id:
                        return {"error": "Missing contact_id in contacts data"}, 400

                    contact = db.session.get(Contact, contact_id)
                    if not contact:
                        return {"error": f"Contact {contact_id} not found"}, 404

                    contact_media = ContactMedia(
                        contact_id=contact_id,
                        media_file_id=id,
                        role=contact_data.get('role', 'Creator')
                    )
                    db.session.add(contact_media)

            db.session.commit()
            return media.to_dict(), 200

        except Exception as e:
            db.session.rollback()
            print("Error updating media:", str(e))  # Debug log
            return {"error": str(e)}, 400

    def delete(self, id):
        media_file = db.session.get(MediaFile, id)
        if not media_file:
            return {"error": "Media file not found"}, 404

        db.session.delete(media_file)
        db.session.commit()
        return {"message": "Media file deleted"}, 204
    
class ContactMediaResource(Resource):
    def post(self):
        data = request.get_json()
        print('Received data:', data)  # Add this debug line
        try:
            new_contact_media = ContactMedia(
                contact_id=data['contact_id'],
                media_file_id=data['media_file_id'],
                role=data.get('role')
            )
            db.session.add(new_contact_media)
            db.session.commit()
            return new_contact_media.to_dict(), 201  # Add proper return
        except KeyError as e:
            return {"error": f"Missing required field: {str(e)}"}, 400
        except Exception as e:
            return {"error": str(e)}, 400

    def get(self):
        contact_media = db.session.query(ContactMedia).all()
        return [cm.to_dict() for cm in contact_media], 200

    def delete(self, id):
        contact_media = db.session.get(ContactMedia, id)  # Updated
        if not contact_media:
            return {"error": "ContactMedia not found"}, 404

        db.session.delete(contact_media)
        db.session.commit()
        return {"message": "ContactMedia deleted successfully"}, 200
    
    def patch(self, id):
        data = request.get_json()
        contact_media = db.session.get(ContactMedia, id)  # Updated
        if not contact_media:
            return {"error": "ContactMedia not found"}, 404

        if "role" in data:
            contact_media.role = data["role"]

        db.session.commit()
        return {"message": "ContactMedia updated successfully"}

class ProjectsResource(Resource):
    def get(self):
        try:
            projects = Project.query.all()
            return [project.to_dict() for project in projects], 200
        except Exception as e:
            return {"error": str(e)}, 500

    def post(self):
        # Check if the request is multipart/form-data (for file uploads)
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form
            user_id = data.get('user_id')
            project_name = data.get('project_name')
            artist = data.get('artist')
            genre = data.get('genre')
            year = data.get('year')
            description = data.get('description')
            project_pic = None
            if 'project_pic' in request.files:
                file = request.files['project_pic']
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(file_path)
                    # Assuming you want the file URL to be relative to the server's root
                    project_pic = '/' + file_path
            try:
                new_project = Project(
                    user_id=user_id,
                    project_name=project_name,
                    artist=artist,
                    genre=genre,
                    year=year,
                    description=description,
                    project_pic=project_pic
                )
                db.session.add(new_project)
                db.session.commit()
                return new_project.to_dict(), 201
            except Exception as e:
                db.session.rollback()
                return {"error": str(e)}, 400
        else:
            data = request.get_json()
            try:
                new_project = Project(
                    user_id=data['user_id'],
                    project_name=data['project_name'],
                    artist=data.get('artist'),
                    genre=data.get('genre'),
                    year=data.get('year'),
                    description=data.get('description'),
                    project_pic=data.get('project_pic')
                )
                db.session.add(new_project)
                db.session.commit()
                return new_project.to_dict(), 201
            except Exception as e:
                db.session.rollback()
                return {"error": str(e)}, 400

class ProjectResource(Resource):
    def patch(self, id):
        project = db.session.get(Project, id)
        if not project:
            return {"error": "Project not found"}, 404
        data = request.get_json()
        try:
            if 'project_name' in data:
                project.project_name = data['project_name']
            if 'artist' in data:
                project.artist = data['artist']
            if 'genre' in data:
                project.genre = data['genre']
            if 'year' in data:
                project.year = data['year']
            if 'description' in data:
                project.description = data['description']
            if 'project_pic' in data:
                project.project_pic = data['project_pic']
            db.session.commit()
            return project.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400

    def delete(self, id):
        project = db.session.get(Project, id)
        if not project:
            return {"error": "Project not found"}, 404
        db.session.delete(project)
        db.session.commit()
        return {"message": "Project deleted successfully"}, 204

class ProjectMediaResource(Resource):
    def post(self):
        data = request.get_json()
        try:
            new_association = ProjectMedia(
                project_id=data['project_id'],
                media_file_id=data['media_file_id']
            )
            db.session.add(new_association)
            db.session.commit()
            return new_association.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400

    def delete(self, id):
        association = db.session.get(ProjectMedia, id)
        if not association:
            return {"error": "Association not found"}, 404
        db.session.delete(association)
        db.session.commit()
        return {"message": "Association deleted successfully"}, 200

# Add the route to your API
api.add_resource(Signup, '/signup')
api.add_resource(Login, '/login')
api.add_resource(CheckSession, '/check_session')
api.add_resource(Logout, '/logout')
api.add_resource(ContactsResource, '/contacts', '/contacts/<int:id>')
api.add_resource(MediaFilesResource, '/media_files')
api.add_resource(MediaFileResource, '/media_files/<int:id>')
api.add_resource(ContactMediaResource, '/contact_media', '/contact_media/<int:id>')
api.add_resource(ProjectsResource, '/projects')
api.add_resource(ProjectResource, '/projects/<int:id>')
api.add_resource(ProjectMediaResource, '/project_media', '/project_media/<int:id>')

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

    if 'contact_pic' not in request.files:
        return {"error": "No file provided"}, 400
    
    file = request.files['contact_pic']
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
    contact = db.session.get(Contact, id)
    if not contact:
        return {"error": "Contact not found"}, 404
    
    data = request.get_json()
    try:
        for field in ['name', 'email', 'phone', 'company', 
                     'discipline', 'bio', 'picture_icon', 
                     'logo', 'address']:
            if field in data:
                setattr(contact, field, data[field])
                
        db.session.commit()
        return contact.to_dict(), 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 400

@app.route('/upload_media', methods=['POST'])
def upload_media():
    if 'user_id' not in session:
        return {"error": "Unauthorized"}, 401

    if 'media' not in request.files:
        return {"error": "No file provided"}, 400
    
    file = request.files['media']
    contacts_data = request.form.get('contacts', '[]')
    contacts = json.loads(contacts_data)
    
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
        db.session.flush()
        
        # Add contact associations
        for contact_data in contacts:
            contact_media = ContactMedia(
                contact_id=contact_data['contact_id'],
                media_file_id=new_media.id,
                role=contact_data.get('role')
            )
            db.session.add(contact_media)
            
        db.session.commit()
        return new_media.to_dict(), 201
        
    return {"error": "Invalid file type"}, 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/contacts', methods=['POST'])
def create_contact():
    data = request.get_json()
    try:
        new_contact = Contact(
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            company=data.get('company'),
            discipline=data.get('discipline'),
            bio=data.get('bio'),
            picture_icon=data.get('picture_icon'),
            logo=data.get('logo'),
            address=data.get('address'),
            user_id=data.get('user_id')
        )
        db.session.add(new_contact)
        db.session.commit()
        return new_contact.to_dict(), 201
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 400

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

@app.route('/users/<int:id>', methods=['GET'])
def get_user(id):
    user = db.session.get(User, id)
    if not user:
        return {"error": "User not found"}, 404
    return user.to_dict(), 200

@app.route('/media_files/<int:id>', methods=['PATCH'])
def update_media(id):
    print(f"Headers received: {dict(request.headers)}")
    print(f"Data received: {request.get_json()}")
    media = db.session.get(MediaFile, id)
    if not media:
        return {"error": "Media file not found"}, 404

    data = request.get_json()
    print("Received update data:", data)  # Debug log

    try:
        # Update basic media fields
        if 'title' in data:
            media.title = data['title']
        if 'description' in data:
            media.description = data['description']

        # Handle contact associations
        if 'contacts' in data:
            # Clear existing associations
            ContactMedia.query.filter_by(media_file_id=id).delete()
            
            for contact_data in data['contacts']:
                contact_id = contact_data.get('contact_id')
                if not contact_id:
                    print("Missing contact_id in:", contact_data)  # Debug log
                    return {"error": "Missing contact_id in contacts data"}, 400

                contact = db.session.get(Contact, contact_id)
                if not contact:
                    return {"error": f"Contact {contact_id} not found"}, 404

                # Create new contact-media association
                contact_media = ContactMedia(
                    contact_id=contact_id,
                    media_file_id=id,
                    role=contact_data.get('role', 'Creator')
                )
                db.session.add(contact_media)

        db.session.commit()
        return media.to_dict(), 200

    except Exception as e:
        db.session.rollback()
        print("Error updating media:", str(e))  # Debug log
        return {"error": str(e)}, 400

@app.route('/update_contact_pic', methods=['PATCH'])
def update_contact_pic():
    print("Received files:", request.files)  # Debug log
    print("Received form data:", request.form)  # Debug log

    if 'contact_pic' not in request.files:
        return {'error': 'No file provided'}, 400

    file = request.files['contact_pic']
    contact_id = request.form.get('contact_id')

    contact = db.session.get(Contact, contact_id)
    if not contact:
        return {'error': 'Contact not found'}, 404

    if file:
        filename = secure_filename(file.filename)
        uploads_dir = os.path.join(app.root_path, 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)

        file_path = os.path.join(uploads_dir, filename)
        file.save(file_path)

        # Update the field using the new name "contact_pic"
        contact.contact_pic = f'/uploads/{filename}'
        db.session.commit()

        print("Saved contact pic path:", contact.contact_pic)  # Debug log

    return contact.to_dict(), 200

@app.route('/update_artwork/<int:media_id>', methods=['PATCH'])
def update_artwork(media_id):
    if 'user_id' not in session:
        return {"error": "Unauthorized"}, 401

    if 'artwork' not in request.files:
        return {"error": "No artwork file provided"}, 400

    file = request.files['artwork']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        media = db.session.get(MediaFile, media_id)
        if not media:
            return {"error": "Media file not found"}, 404

        media.artwork_url = f"/uploads/{filename}"
        db.session.commit()

        return media.to_dict(), 200
    else:
        return {"error": "Invalid file type"}, 400

@app.patch('/projects/<int:id>')
def update_project(id):
    try:
        print("Content-Type:", request.content_type)  # Debug log
        print("Form data:", request.form)            # Debug log
        print("Files:", request.files)               # Debug log

        project = Project.query.get(id)
        if not project:
            return {'error': 'Project not found'}, 404

        # Handle form data
        if request.form:
            if 'project_name' in request.form:
                project.project_name = request.form['project_name']
            if 'artist' in request.form:
                project.artist = request.form['artist']
            if 'genre' in request.form:
                project.genre = request.form['genre']
            if 'year' in request.form:
                project.year = request.form['year']
            if 'description' in request.form:
                project.description = request.form['description']

        # Handle file upload
        if 'project_pic' in request.files:
            file = request.files['project_pic']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                project.project_pic = f'/uploads/{filename}'

        db.session.commit()
        return project.to_dict(), 200

    except Exception as e:
        print(f"Error updating project: {str(e)}")  # Debug log
        db.session.rollback()
        return {'error': str(e)}, 400

@app.route('/projects', methods=['POST'])
def create_project():
    try:
        data = request.get_json()  # Get JSON data instead of form data
        
        if not data.get('project_name'):
            return {'error': 'Project name is required'}, 400

        project = Project(
            user_id=session.get('user_id'),  # Use session user_id instead of payload
            project_name=data['project_name'],
            artist=data.get('artist'),
            genre=data.get('genre'),
            year=data.get('year'),
            description=data.get('description')
        )

        db.session.add(project)
        db.session.commit()
        return project.to_dict(), 201

    except Exception as e:
        print(f"Error creating project: {str(e)}")
        db.session.rollback()
        return {'error': str(e)}, 400

@app.route('/update_project_pic/<int:project_id>', methods=['PATCH'])
def update_project_pic(project_id):
    if 'project_pic' not in request.files:
        return {'error': 'No file provided'}, 400
    
    file = request.files['project_pic']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        project = Project.query.get(project_id)
        if not project:
            return {'error': 'Project not found'}, 404
            
        project.project_pic = f'/uploads/{filename}'
        db.session.commit()
        return project.to_dict(), 200
        
    return {'error': 'Invalid file type'}, 400

@app.route('/projects/<int:project_id>/media_files', methods=['GET'])
def get_project_media_files(project_id):
    try:
        # Query the ProjectMedia table for associations with the given project_id
        project_media_assocs = ProjectMedia.query.filter_by(project_id=project_id).all()
        # Extract the media file from each association
        media_files = [assoc.media_file for assoc in project_media_assocs]
        # Return the media files as a list of dictionaries
        return jsonify([media.to_dict() for media in media_files]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":  # Fixed syntax
    app.run(port=5555, debug=True)