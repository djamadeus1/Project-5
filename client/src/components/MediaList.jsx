import React from "react";
import '../styles/index.css';  // Fix path to styles directory

function MediaList({ mediaFiles, onMediaSelect, currentMedia }) {
    console.log("Media Files in MediaList:", mediaFiles); // Debugging log

    if (!mediaFiles || mediaFiles.length === 0) {
        return <p>No media files available.</p>; // Display a message if empty
    }

    return (
        <ul className="media-list">
            {mediaFiles.map((media) => (
                <li
                    key={media.id}
                    className={`media-item ${currentMedia?.id === media.id ? "selected" : ""}`}
                    onClick={() => onMediaSelect(media)}
                >
                    <img src={media.imageUrl || "/assets/default-image.png"} alt={media.title} />
                    {media.title}
                </li>
            ))}
        </ul>
    );
}

export default MediaList;