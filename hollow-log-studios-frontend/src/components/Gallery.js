import React, { useEffect, useState } from 'react';
import { fetchArtworks } from '../api/api';

const Gallery = () => {
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    const getArtworks = async () => {
      const { data } = await fetchArtworks();
      setArtworks(data);
    };
    getArtworks();
  }, []);

  return (
    <div>
      <h1>Gallery</h1>
      <div>
        {artworks.map((artwork) => (
          <div key={artwork._id}>
            <h3>{artwork.title}</h3>
            <p>{artwork.description}</p>
            <img src={artwork.imageURL} alt={artwork.title} style={{ width: '200px' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
