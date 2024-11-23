import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPanel.css";
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
  const [modalImage, setModalImage] = useState(null); // For modal functionality

  // Fetch artworks
  const fetchArtworks = async () => {
    try {
      const response = await axios.get("/api/artworks");
      const sortedArtworks = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setArtworks(sortedArtworks);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    }
  };

  // Add new artwork
  const addArtwork = async () => {
    const formData = new FormData();
    formData.append("title", newArtwork.title);
    formData.append("description", newArtwork.description);
    formData.append("price", newArtwork.price);
    formData.append("category", newArtwork.category);
    formData.append("availability", newArtwork.availability);
    formData.append("image", newArtwork.image);

    try {
      await axios.post("/api/artworks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Artwork added successfully!");
      setNewArtwork({
        title: "",
        description: "",
        price: "",
        category: "",
        availability: "Print",
        image: null,
      });
      fetchArtworks();
    } catch (error) {
      console.error("Error adding artwork:", error);
      alert("Failed to add artwork.");
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

  // Show modal with full image
  const openModal = (imageURL) => {
    setModalImage(imageURL);
  };

  // Close modal
  const closeModal = () => {
    setModalImage(null);
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
  <div className="add-artwork-card">
    <label className="add-artwork-label">Title</label>
    <input
      type="text"
      placeholder="Enter artwork title"
      value={newArtwork.title}
      onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
      className="add-artwork-input"
    />

    <label className="add-artwork-label">Description</label>
    <textarea
      placeholder="Enter artwork description"
      value={newArtwork.description}
      onChange={(e) =>
        setNewArtwork({ ...newArtwork, description: e.target.value })
      }
      className="add-artwork-input"
    ></textarea>

    <label className="add-artwork-label">Price</label>
    <input
      type="number"
      placeholder="Enter artwork price"
      value={newArtwork.price}
      onChange={(e) => setNewArtwork({ ...newArtwork, price: e.target.value })}
      className="add-artwork-input"
    />

<label className="add-artwork-label">Category</label>
<select
  value={newArtwork.category}
  onChange={(e) => setNewArtwork({ ...newArtwork, category: e.target.value })}
  className="add-artwork-select"
>
  <option value="" disabled>Select a category</option>
  <option value="Illustration">Illustration</option>
  <option value="Mural">Mural</option>
  <option value="Portrait">Portrait</option>
</select>


    <label className="add-artwork-label">Availability</label>
    <select
      value={newArtwork.availability}
      onChange={(e) =>
        setNewArtwork({ ...newArtwork, availability: e.target.value })
      }
      className="add-artwork-select"
    >
      <option value="Print">Print</option>
      <option value="Original">Original</option>
      <option value="Both">Both</option>
    </select>

    <label className="add-artwork-label">Image</label>
    <input
      type="file"
      onChange={(e) => setNewArtwork({ ...newArtwork, image: e.target.files[0] })}
      className="add-artwork-input"
    />

    <button className="add-artwork-btn" onClick={addArtwork}>
      Add Artwork
    </button>
  </div>
</div>

<div className="custom-divider">
  <span>OR</span>
</div>

      {/* Manage Artworks Section */}
      <h2>Manage Artworks</h2>
      <div className="artworks-container">
        {artworks.map((artwork) => (
          <div key={artwork._id} className="artwork-card">
            <img
              src={artwork.imageURL || "https://via.placeholder.com/150"}
              alt={artwork.title}
              className="artwork-image"
              onClick={() => openModal(artwork.imageURL)} // Open modal on image click
            />
            {editingArtwork === artwork._id ? (
              <div className="edit-fields-container">
                <label className="edit-field-label">Title</label>
                <input
                  type="text"
                  defaultValue={artwork.title}
                  onChange={(e) =>
                    setUpdatedFields({
                      ...updatedFields,
                      title: e.target.value,
                    })
                  }
                  className="edit-field"
                />
                <label className="edit-field-label">Description</label>
                <textarea
                  defaultValue={artwork.description}
                  onChange={(e) =>
                    setUpdatedFields({
                      ...updatedFields,
                      description: e.target.value,
                    })
                  }
                  className="edit-field"
                ></textarea>
                <label className="edit-field-label">Price</label>
                <input
                  type="number"
                  defaultValue={artwork.price}
                  onChange={(e) =>
                    setUpdatedFields({
                      ...updatedFields,
                      price: e.target.value,
                    })
                  }
                  className="edit-field"
                />
                <div className="edit-actions">
                  <button
                    className="save-btn"
                    onClick={() => saveChanges(artwork._id)}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setEditingArtwork(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3>{artwork.title}</h3>
                <p>{artwork.description}</p>
                <p>${artwork.price}</p>
                <div className="artwork-actions">
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
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalImage && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>
              Back
            </button>
            <img src={modalImage} alt="Full Artwork" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
