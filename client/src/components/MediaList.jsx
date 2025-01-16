import React from "react";

function MediaList({ mediaFiles, onMediaSelect, currentMedia }) {
  return (
    <ul className="media-list">
      {mediaFiles.map((media) => (
        <li
          key={media.id}
          className={`media-item ${
            currentMedia && currentMedia.id === media.id ? "selected" : ""
          }`}
          onClick={() => onMediaSelect(media)}
        >
          {media.title}
        </li>
      ))}
    </ul>
  );
}

export default MediaList;