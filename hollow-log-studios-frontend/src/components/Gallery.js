import React, { useEffect, useState } from 'react';
import { getAllArtworks } from '../firebase/artworkService';

const Gallery = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getArtworks = async () => {
      try {
        setLoading(true);
        const artworksList = await getAllArtworks();
        setArtworks(artworksList);
      } catch (err) {
        console.error('Error loading artworks:', err);
        setError('Failed to load artworks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    getArtworks();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading gallery...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div>
      <h1>Gallery</h1>
      <div>
        {artworks.length === 0 ? (
          <p>No artworks available.</p>
        ) : (
          artworks.map((artwork) => (
            <div key={artwork.id}>
              <h3>{artwork.title}</h3>
              <p>{artwork.description}</p>
              <img src={artwork.imageURL} alt={artwork.title} style={{ width: '200px' }} />
              <p>Price: ${artwork.price}</p>
              <p>Category: {artwork.category}</p>
              <p>Availability: {artwork.availability}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Gallery;
