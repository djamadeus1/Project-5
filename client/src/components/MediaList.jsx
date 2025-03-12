import React from "react";
import '../styles/index.css';  // Adjust path as needed

function MediaList({ mediaFiles, onMediaSelect, currentMedia }) {
  console.log("Media Files in MediaList:", mediaFiles); // Debugging log

  if (!mediaFiles || mediaFiles.length === 0) {
    return <p>No media files available.</p>;
  }

  return (
    <ul className="media-list">
      {mediaFiles.map((media) => (
        <li
          key={media.id}
          className={`media-item ${currentMedia?.id === media.id ? "selected" : ""}`}
          onClick={() => onMediaSelect(media)}
        >
          <div className="media-item-container">
            <img
              src={media.artwork_url 
                    ? `http://127.0.0.1:5555${media.artwork_url}?t=${Date.now()}`
                    : '/assets/default-artwork.png'}
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
  );
}

export default MediaList;