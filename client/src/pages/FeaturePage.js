import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:4001/api';

function FeaturePage({ title, icon, apiEndpoint, columns, formFields }) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchData = useCallback(async (page = currentPage) => {
    setLoading(true);
    setError('');
    try {
      const endpoint = apiEndpoint.startsWith('/api')
        ? apiEndpoint.replace('/api', '')
        : apiEndpoint;
      const res = await axios.get(`${API_BASE}${endpoint}`, {
        ...getAuthHeaders(),
        params: { page, limit: 20 },
      });
      let items = [];
      if (Array.isArray(res.data)) {
        items = res.data;
        setPagination(null);
      } else if (res.data && Array.isArray(res.data.data)) {
        items = res.data.data;
        setPagination(res.data.pagination || null);
      } else if (res.data && typeof res.data === 'object') {
        items = [res.data];
        setPagination(null);
      }
      setData(items);
      setFilteredData(items);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setError(err.response?.data?.error || 'Failed to load data');
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, getAuthHeaders, navigate, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(page);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = data.filter((item) =>
      Object.values(item).some(
        (val) => val && String(val).toLowerCase().includes(lower)
      )
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const initFormData = () => {
    const initial = {};
    formFields.forEach((field) => {
      if (field.type === 'checkbox') {
        initial[field.key] = false;
      } else if (field.type === 'number') {
        initial[field.key] = '';
      } else {
        initial[field.key] = '';
      }
    });
    return initial;
  };

  const handleAddNew = () => {
    setFormData(initFormData());
    setEditMode(false);
    setShowFormModal(true);
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleEdit = () => {
    const editData = {};
    formFields.forEach((field) => {
      editData[field.key] = selectedItem[field.key] !== undefined ? selectedItem[field.key] : '';
    });
    setFormData(editData);
    setEditMode(true);
    setShowDetailModal(false);
    setShowFormModal(true);
  };

  const handleDelete = () => {
    setShowDetailModal(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const endpoint = apiEndpoint.startsWith('/api')
        ? apiEndpoint.replace('/api', '')
        : apiEndpoint;
      const id = selectedItem.id || selectedItem._id;
      await axios.delete(`${API_BASE}${endpoint}/${id}`, getAuthHeaders());
      setShowDeleteConfirm(false);
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete');
      setShowDeleteConfirm(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = apiEndpoint.startsWith('/api')
        ? apiEndpoint.replace('/api', '')
        : apiEndpoint;
      if (editMode && selectedItem) {
        const id = selectedItem.id || selectedItem._id;
        await axios.put(`${API_BASE}${endpoint}/${id}`, formData, getAuthHeaders());
      } else {
        await axios.post(`${API_BASE}${endpoint}`, formData, getAuthHeaders());
      }
      setShowFormModal(false);
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Already Booked: ' + (err.response?.data?.error || 'This tee time slot is already booked.'));
      } else {
        setError(err.response?.data?.error || 'Operation failed');
      }
    }
  };

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const formatCellValue = (value, key) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (key === 'status' || key === 'condition' || key === 'availability') {
      const statusClass = String(value).toLowerCase().replace(/\s+/g, '-');
      return <span className={`status-badge ${statusClass}`}>{value}</span>;
    }
    return String(value);
  };

  const renderFormField = (field) => {
    const value = formData[field.key] !== undefined ? formData[field.key] : '';

    if (field.type === 'select') {
      return (
        <div className="form-group" key={field.key}>
          <label>{field.label}</label>
          <select
            value={value}
            onChange={(e) => handleFormChange(field.key, e.target.value)}
          >
            <option value="">Select {field.label}</option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <div className="form-group checkbox-group" key={field.key}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleFormChange(field.key, e.target.checked)}
          />
          <label>{field.label}</label>
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div className="form-group" key={field.key}>
          <label>{field.label}</label>
          <textarea
            value={value}
            onChange={(e) => handleFormChange(field.key, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        </div>
      );
    }

    return (
      <div className="form-group" key={field.key}>
        <label>{field.label}</label>
        <input
          type={field.type || 'text'}
          value={value}
          onChange={(e) => handleFormChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          step={field.type === 'number' ? 'any' : undefined}
        />
      </div>
    );
  };

  return (
    <div className="feature-page">
      <header className="feature-page-header">
        <div className="feature-page-header-left">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            &larr; Back
          </button>
          <span className="page-icon">{icon}</span>
          <h1>{title}</h1>
        </div>
      </header>

      <div className="feature-page-content">
        {error && (
          <div className="error-banner">
            <span>&#9888;</span> {error}
          </div>
        )}

        <div className="toolbar">
          <div className="toolbar-left">
            <input
              className="search-input"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="total-count">
              {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
            </span>
          </div>
          <div className="toolbar-right">
            <button className="btn-secondary" onClick={fetchData}>
              &#8635; Refresh
            </button>
            <button className="btn-primary" onClick={handleAddNew}>
              + Add New
            </button>
          </div>
        </div>

        <div className="data-table-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">{icon}</span>
              <h3>No records found</h3>
              <p>Click "Add New" to create your first record.</p>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={item.id || item._id || index} onClick={() => handleRowClick(item)}>
                      {columns.map((col) => (
                        <td key={col.key}>{formatCellValue(item[col.key], col.key)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {pagination && pagination.totalPages > 1 && (
                <div className="pagination-bar">
                  <button
                    className="btn-secondary"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    &laquo; Prev
                  </button>
                  <span className="pagination-info">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
                  </span>
                  <button
                    className="btn-secondary"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                  >
                    Next &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{title} Details</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                {Object.entries(selectedItem)
                  .filter(([key]) => key !== 'id' && key !== '_id' && key !== '__v')
                  .map(([key, value]) => (
                    <div className="detail-item" key={key}>
                      <label>{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</label>
                      <span>
                        {typeof value === 'boolean'
                          ? value ? 'Yes' : 'No'
                          : value !== null && value !== undefined
                            ? String(value)
                            : '-'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-danger" onClick={handleDelete}>
                Delete
              </button>
              <button className="btn-primary" onClick={handleEdit}>
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal (Add / Edit) */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? `Edit ${title}` : `New ${title}`}</h2>
              <button className="modal-close" onClick={() => setShowFormModal(false)}>
                &times;
              </button>
            </div>
            <form className="modal-form" onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formFields.map((field) => renderFormField(field))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowFormModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editMode ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay confirm-modal" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to delete this record? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeaturePage;
