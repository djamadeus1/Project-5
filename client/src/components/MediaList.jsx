import React from "react";
import '../styles/index.css';  // Adjust path as needed

function MediaList({ mediaFiles, searchQuery, onMediaSelect, currentMedia }) {
  console.log("Media Files in MediaList:", mediaFiles); // Debugging log

  if (!mediaFiles || mediaFiles.length === 0) {
    return (
      <div className="media-list-container">
        <div className="no-media-message">
          <p>No media files available.</p>
        </div>
      </div>
    );
  }

  // Convert searchQuery to lowercase; if empty, use an empty string
  const query = searchQuery ? searchQuery.toLowerCase() : "";

  // Filter mediaFiles based on title and associated contacts (name, company, discipline)
  const filteredMedia = mediaFiles.filter(media => {
    if (!query) return true; // If query is empty, include all media files
    const titleMatch = media.title && media.title.toLowerCase().includes(query);
    const contactMatch = media.contacts && media.contacts.some(contact => {
      return (
        (contact.name && contact.name.toLowerCase().includes(query)) ||
        (contact.company && contact.company.toLowerCase().includes(query)) ||
        (contact.discipline && contact.discipline.toLowerCase().includes(query))
      );
    });
    return titleMatch || contactMatch;
  });

  return (
    <div className="media-list-container">
      {filteredMedia.length === 0 && (
        <div className="tracks-no-matches">  {/* New class name */}
          <p>No Matches</p>
        </div>
      )}
      <ul className="media-list">
        {filteredMedia.map((media) => (
          <li
            key={media.id}
            className={`media-item ${currentMedia?.id === media.id ? "selected" : ""}`}
            onClick={() => onMediaSelect(media)}
          >
            <div className="media-item-container">
              <img
                src={
                  media.artwork_url 
                    ? `http://127.0.0.1:5555${media.artwork_url}?t=${Date.now()}`
                    : '/assets/default-artwork.png'
                }
                alt={media.title}
                className="media-artwork"
              />
              <div className="media-info">
                <h4 className="media-title">{media.title}</h4>
                <p className="media-description">{media.description}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MediaList;