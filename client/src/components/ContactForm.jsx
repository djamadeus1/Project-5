import React, { useState } from "react";
import '../styles/index.css';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    discipline: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Retrieve the user_id from localStorage or sessionStorage
    const user_id = localStorage.getItem("user_id"); // or sessionStorage.getItem("user_id")

    if (!user_id) {
      alert("Error: User ID not found. Please log in first.");
      return;
    }

    fetch("/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...formData, user_id }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create contact");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Contact created:", data);
        alert("Contact created successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          discipline: "",
        });
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Phone:</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Company:</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Discipline:</label>
        <input
          type="text"
          name="discipline"
          value={formData.discipline}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Create Contact</button>
    </form>
  );
}

export default ContactForm;