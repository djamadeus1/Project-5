import React from "react";
import '../styles/index.css';  // Adjust path as needed

function MediaList({ mediaFiles, searchQuery = "", onMediaSelect, currentMedia }) {
  console.log("Media Files in MediaList:", mediaFiles); // Debugging log
  console.log("Search Query:", searchQuery);
  console.log("All Media Files:", mediaFiles);

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

// Filter mediaFiles based on title, description, and associated contacts (name, company, discipline)
const filteredMedia = mediaFiles.filter(media => {
  if (!query) return true;
  const titleMatch = media.title && media.title.toLowerCase().includes(query);
  const descriptionMatch = media.description && media.description.toLowerCase().includes(query);
  const contactMatch = media.contacts && media.contacts.some(contact => {
    return (
      (contact.name && contact.name.toLowerCase().includes(query)) ||
      (contact.company && contact.company.toLowerCase().includes(query)) ||
      (contact.discipline && contact.discipline.toLowerCase().includes(query))
    );
  });
  return titleMatch || descriptionMatch || contactMatch;
});
console.log("Filtered Media:", filteredMedia);

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
              {media.artwork_url ? (
                <img 
                  src={`http://127.0.0.1:5555${media.artwork_url}?t=${Date.now()}`}
                  alt={media.title}
                  className="media-artwork"
                />
              ) : (
                <div className="default-artwork-placeholder">
                  <span>MUSIC - ONE</span>
                </div>
              )}
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