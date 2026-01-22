import React, { useEffect, useState } from "react";
import "./AdminPanel.css";
import { FaTrash, FaEdit } from "react-icons/fa";
import {
  getAllArtworks,
  createArtwork,
  createBothArtworks,
  updateArtwork,
  deleteArtwork
} from "../../firebase/artworkService";

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

  // Fetch artworks from Firebase
  const fetchArtworks = async () => {
    try {
      const artworksList = await getAllArtworks();
      setArtworks(artworksList);
    } catch (error) {
      console.error("Error fetching artworks:", error);
      alert("Failed to fetch artworks.");
    }
  };

  // Add new artwork to Firebase
  const addArtwork = async () => {
    // Validation
    if (!newArtwork.title || !newArtwork.category || !newArtwork.image) {
      alert("Please fill in all required fields (title, category, and image).");
      return;
    }

    try {
      // Handle "Both" availability - creates two separate entries
      if (newArtwork.availability === "Both") {
        await createBothArtworks(
          {
            title: newArtwork.title,
            description: newArtwork.description,
            category: newArtwork.category,
            printPrice: newArtwork.printPrice || 0,
            originalPrice: newArtwork.originalPrice || 0,
          },
          newArtwork.image
        );
      } else {
        await createArtwork(
          {
            title: newArtwork.title,
            description: newArtwork.description,
            category: newArtwork.category,
            availability: newArtwork.availability,
            price: newArtwork.price || 0,
          },
          newArtwork.image
        );
      }

      alert("Artwork added successfully!");
      setNewArtwork({
        title: "",
        description: "",
        category: "",
        availability: "Print",
        price: "",
        printPrice: "",
        originalPrice: "",
        image: null,
      });
      fetchArtworks();
    } catch (error) {
      console.error("Error adding artwork:", error);
      alert("Failed to add artwork. Please try again.");
    }
  };

  // Delete artwork from Firebase
  const deleteArtworkHandler = async (artwork) => {
    if (window.confirm("Are you sure you want to delete this artwork?")) {
      try {
        await deleteArtwork(artwork.id, artwork.imageURL);
        alert("Artwork deleted successfully!");
        fetchArtworks();
      } catch (error) {
        console.error("Error deleting artwork:", error);
        alert("Failed to delete artwork.");
      }
    }
  };

  // Save artwork changes to Firebase
  const saveChanges = async (id) => {
    try {
      if (Object.keys(updatedFields).length === 0) {
        alert("No changes to save.");
        return;
      }

      await updateArtwork(id, updatedFields);
      alert("Artwork updated successfully!");
      setEditingArtwork(null);
      setUpdatedFields({});
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
      {/* Add Artwork Section */}
      <div className="add-artwork">
        <h2>Add New Artwork</h2>
        <div className="add-artwork-card">
          <label className="add-artwork-label">Title</label>
          <input
            type="text"
            placeholder="Enter artwork title"
            value={newArtwork.title}
            onChange={(e) =>
              setNewArtwork({ ...newArtwork, title: e.target.value })
            }
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

          <label className="add-artwork-label">Category</label>
          <select
            value={newArtwork.category}
            onChange={(e) =>
              setNewArtwork({ ...newArtwork, category: e.target.value })
            }
            className="add-artwork-select"
          >
            <option value="" disabled>
              Select a category
            </option>
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

          {/* Conditional rendering for Price fields */}
          {newArtwork.availability === "Both" ? (
            <>
              <label className="add-artwork-label">Print Price</label>
              <input
                type="number"
                placeholder="Enter print price"
                value={newArtwork.printPrice || ""}
                onChange={(e) =>
                  setNewArtwork({ ...newArtwork, printPrice: e.target.value })
                }
                className="add-artwork-input"
              />
              <label className="add-artwork-label">Original Price</label>
              <input
                type="number"
                placeholder="Enter original price"
                value={newArtwork.originalPrice || ""}
                onChange={(e) =>
                  setNewArtwork({
                    ...newArtwork,
                    originalPrice: e.target.value,
                  })
                }
                className="add-artwork-input"
              />
            </>
          ) : (
            <>
              <label className="add-artwork-label">Price</label>
              <input
                type="number"
                placeholder="Enter price"
                value={newArtwork.price || ""}
                onChange={(e) =>
                  setNewArtwork({ ...newArtwork, price: e.target.value })
                }
                className="add-artwork-input"
              />
            </>
          )}

          <label className="add-artwork-label">Image</label>
          <input
            type="file"
            onChange={(e) =>
              setNewArtwork({ ...newArtwork, image: e.target.files[0] })
            }
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
          <div key={artwork.id} className="artwork-card">
            {/* Ribbon for Originals */}
            {artwork.availability === "Original" && (
              <div className="ribbon">Original</div>
            )}
            <img
              src={artwork.imageURL || "https://via.placeholder.com/150"}
              alt={artwork.title}
              className="artwork-image"
              onClick={() => openModal(artwork.imageURL)} // Open modal on image click
            />
            {editingArtwork === artwork.id ? (
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
                    onClick={() => saveChanges(artwork.id)}
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
                    onClick={() => setEditingArtwork(artwork.id)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteArtworkHandler(artwork)}
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
