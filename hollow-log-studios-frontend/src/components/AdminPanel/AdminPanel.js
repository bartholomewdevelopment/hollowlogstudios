import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPanel.css"; // Ensure you style as needed
import { FaTrash, FaEdit } from "react-icons/fa";

const AdminPanel = () => {
  const [artworks, setArtworks] = useState([]);
  const [newArtwork, setNewArtwork] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    availability: "Print",
    image: null,
  });
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({});

  // Fetch artworks
  const fetchArtworks = async () => {
    try {
      const response = await axios.get("/api/artworks");
      setArtworks(response.data);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    }
  };

  // Add new artwork
  const addArtwork = async () => {
    const formData = new FormData();
    formData.append('title', newArtwork.title);
    formData.append('description', newArtwork.description);
    formData.append('price', newArtwork.price);
    formData.append('category', newArtwork.category);
    formData.append('availability', newArtwork.availability);
    formData.append('image', newArtwork.image); // Ensure 'image' matches the backend key
  
    try {
      const response = await axios.post('/api/artworks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Artwork added:', response.data);
      alert('Artwork added successfully!');
      setNewArtwork({
        title: '',
        description: '',
        price: '',
        category: '',
        availability: 'Print',
        image: null,
      });
      fetchArtworks();
    } catch (error) {
      console.error('Error adding artwork:', error.response?.data || error.message);
      alert('Failed to add artwork.');
    }
  };
  
  // Delete artwork
  const deleteArtwork = async (id) => {
    if (window.confirm("Are you sure you want to delete this artwork?")) {
      try {
        await axios.delete(`/api/artworks/${id}`);
        alert("Artwork deleted successfully!");
        fetchArtworks();
      } catch (error) {
        console.error("Error deleting artwork:", error);
        alert("Failed to delete artwork.");
      }
    }
  };

  // Save artwork changes
  const saveChanges = async (id) => {
    try {
      await axios.put(`/api/artworks/${id}`, updatedFields);
      alert("Artwork updated successfully!");
      setEditingArtwork(null);
      fetchArtworks();
    } catch (error) {
      console.error("Error updating artwork:", error);
      alert("Failed to update artwork.");
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      {/* Add Artwork Section */}
      <div className="add-artwork">
        <h2>Add New Artwork</h2>
        <input
          type="text"
          placeholder="Title"
          value={newArtwork.title}
          onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={newArtwork.description}
          onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newArtwork.price}
          onChange={(e) => setNewArtwork({ ...newArtwork, price: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category"
          value={newArtwork.category}
          onChange={(e) => setNewArtwork({ ...newArtwork, category: e.target.value })}
        />
        <select
          value={newArtwork.availability}
          onChange={(e) => setNewArtwork({ ...newArtwork, availability: e.target.value })}
        >
          <option value="Print">Print</option>
          <option value="Original">Original</option>
          <option value="Both">Both</option>
        </select>
        <input
          type="file"
          onChange={(e) => setNewArtwork({ ...newArtwork, image: e.target.files[0] })}
        />
        <button onClick={addArtwork}>Add Artwork</button>
      </div>

      {/* Manage Artworks Section */}
      <div className="manage-artworks">
        <h2>Manage Artworks</h2>
        <ul>
          {artworks.map((artwork) => (
            <li key={artwork._id} className="artwork-item">
              <img
                src={artwork.imageURL}
                alt={artwork.title}
                className="artwork-thumbnail"
              />
              {editingArtwork === artwork._id ? (
                <div>
                  <input
                    type="text"
                    defaultValue={artwork.title}
                    onChange={(e) =>
                      setUpdatedFields({
                        ...updatedFields,
                        title: e.target.value,
                      })
                    }
                  />
                  <textarea
                    defaultValue={artwork.description}
                    onChange={(e) =>
                      setUpdatedFields({
                        ...updatedFields,
                        description: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    defaultValue={artwork.price}
                    onChange={(e) =>
                      setUpdatedFields({
                        ...updatedFields,
                        price: e.target.value,
                      })
                    }
                  />
                  <button onClick={() => saveChanges(artwork._id)}>Save</button>
                  <button onClick={() => setEditingArtwork(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <h3>{artwork.title}</h3>
                  <p>{artwork.description}</p>
                  <p>${artwork.price}</p>
                  <button
                    className="edit-btn"
                    onClick={() => setEditingArtwork(artwork._id)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteArtwork(artwork._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
