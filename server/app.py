#!/usr/bin/env python3

# Standard library imports
from sqlalchemy import or_
# Remote library imports
from flask import request, session, jsonify
from flask_restful import Resource
from flask_bcrypt import check_password_hash

# Local imports
from config import app, db, api, bcrypt
from models import User, db, Contact, MediaFile, ContactMedia

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

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Create new user
        new_user = User(username=username, email=email, password=hashed_password)

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
        user = db.session.query(User).filter_by(username=username).first()
        if not user:
            return {"error": "Invalid username or password"}, 401

        # Check if password matches
        if not check_password_hash(user.password, password):
            return {"error": "Invalid username or password"}, 401
        
         # Store user ID in session
        session['user_id'] = user.id

        # If login is successful
        return {"message": f"Login successful {user.username}"}, 200
    
class CheckSession(Resource):
    def get(self):
        # Check if 'user_id' exists in session
        user_id = session.get('user_id')
        
        if not user_id:
            return {"error": "User not logged in"}, 401

        # Query the user from the database using the user_id from session
        user = db.session.query(User).get(user_id)

        if user:
            return {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "picture_icon": user.picture_icon,
                "logo": user.logo,
                "discipline": user.discipline,
                "bio": user.bio
            }, 200
        
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



# Add the route to your API
api.add_resource(Signup, '/signup')
api.add_resource(Login, '/login')
api.add_resource(CheckSession, '/check_session')
api.add_resource(Logout, '/logout')
api.add_resource(ContactsResource, '/contacts', '/contacts/<int:id>')
api.add_resource(MediaFilesResource, '/media_files')
api.add_resource(MediaFileResource, '/media_files/<int:id>')


@app.route('/')
def index():
    return '<h1>Project Server</h1>'

if __name__ == '__main__':
    app.run(port=5555, debug=True)