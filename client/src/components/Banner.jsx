import React from "react";
import '../styles/index.css';

function Banner({ bannerUrl, altText = "User Banner" }) {
  return (
    <div className="user-banner">
      <img src={bannerUrl} alt={altText} className="user-banner-image" />
    </div>
  );
}

export default Banner;