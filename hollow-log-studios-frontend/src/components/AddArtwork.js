import React, { useState } from 'react';
import axios from 'axios';

const AddArtwork = () => {
  const [artwork, setArtwork] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    availability: 'Print',
    imageURL: '',
  });

  const handleChange = (e) => {
    setArtwork({ ...artwork, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!artwork.title || !artwork.category || !artwork.price || !artwork.availability) {
      alert('Please fill in all required fields!');
      return;
    }
    try {
      const response = await axios.post('/api/artworks', artwork);
      alert('Artwork added successfully!');
      setArtwork({
        title: '',
        description: '',
        category: '',
        price: '',
        availability: 'Print',
        imageURL: '',
      });
    } catch (error) {
      console.error(error);
      alert('Failed to add artwork.');
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Artwork</h2>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={artwork.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={artwork.description}
        onChange={handleChange}
      ></textarea>
      <input
        type="text"
        name="category"
        placeholder="Category"
        value={artwork.category}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={artwork.price}
        onChange={handleChange}
        required
      />
      <select name="availability" value={artwork.availability} onChange={handleChange}>
        <option value="Print">Print</option>
        <option value="Original">Original</option>
        <option value="Both">Both</option>
      </select>
      <input
        type="text"
        name="imageURL"
        placeholder="Image URL"
        value={artwork.imageURL}
        onChange={handleChange}
      />
      <button type="submit">Add Artwork</button>
    </form>
  );
};

export default AddArtwork;
