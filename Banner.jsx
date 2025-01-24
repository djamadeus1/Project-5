import React from 'react';

function Banner({ bannerUrl }) {
  return (
    <div className="banner" style={{ 
      backgroundImage: `url(${bannerUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
    </div>
  );
}

export default Banner;