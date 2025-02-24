import React, { useState } from "react";
import '../styles/shared.css';

function EditMediaForm({ media, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: media.title || "",
    description: media.description || "", // Add description field from ERD
    contact: media.contacts?.[0] || {
      name: "",
      email: "",
      phone: "",
      company: "",
      discipline: "",
      bio: "",        // Add bio field from ERD
      picture_icon: "",// Add picture_icon field from ERD
      logo: "",       // Add logo field from ERD
      address: ""     // Add address field from ERD
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title" || name === "description") {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [name]: value }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        // First update or create contact
        let contactResponse;
        const contactData = {
            ...formData.contact,
            user_id: media.user_id
        };

        //console.log("Contact data being sent:", contactData);

        // Update or create contact
        if (formData.contact.id) {
            contactResponse = await fetch(`/contacts/${formData.contact.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(contactData)
            });
        } else {
            contactResponse = await fetch('/contacts', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(contactData)
            });
        }

        if (!contactResponse.ok) {
            throw new Error('Failed to update contact');
        }

        const updatedContact = await contactResponse.json();
        //console.log("Updated contact ID:", updatedContact?.id);

        // Now update media with the confirmed contact ID
        const mediaData = {
            title: formData.title,
            description: formData.description,
            contacts: [{
                contact_id: updatedContact?.id,  // Ensure it's not undefined
                role: "Creator"
            }]
        };

        //console.log("Media update payload:", mediaData);

        const mediaResponse = await fetch(`/media_files/${media.id}`, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json"  // Removed "Accept" header
            },
            credentials: "include",
            body: JSON.stringify(mediaData)
        });

        if (!mediaResponse.ok) {
            const error = await mediaResponse.json();
            throw new Error(error.error || 'Failed to update media');
        }

        const updatedMedia = await mediaResponse.json();
        onUpdate(updatedMedia);
        onClose();

    } catch (error) {
        console.error("Error in form submission:", error);
        alert(error.message);
    }
};

  // Add fields to match ERD structure
  return (
    <div className="popup-overlay">
      <div className="edit-popup">
        <h2>Edit Media Information</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <h3>Contact Information</h3>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.contact.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.contact.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={formData.contact.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Company:</label>
            <input
              type="text"
              name="company"
              value={formData.contact.company}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Discipline:</label>
            <input
              type="text"
              name="discipline"
              value={formData.contact.discipline}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Bio:</label>
            <textarea
              name="bio"
              value={formData.contact.bio}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={formData.contact.address}
              onChange={handleChange}
            />
          </div>
          
          <div className="button-group">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMediaForm;