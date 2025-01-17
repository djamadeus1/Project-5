import React from 'react';
import '../styles/index.css';

function ContactsList({ contacts }) {
  return (
    <div>
      <h2>Contacts:</h2>
      <ul>
        {contacts.map((contact) => (
          <li key={contact.id}>{contact.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default ContactsList;