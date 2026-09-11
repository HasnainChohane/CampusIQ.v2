import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  X, 
  MapPin, 
  Calendar,
  AlertCircle,
  Tag
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All',
  'Computers',
  'Lab Equipment',
  'Networking',
  'Projectors',
  'Printers',
  'Furniture',
  'Stationery'
];

export default function InventoryPage() {
  const { role } = useAuth();
  const canManage = role === 'admin' || role === 'officer';

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [facultyUsers, setFacultyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  // Modals & States
  const [selectedItem, setSelectedItem] = useState(null);
  const [assignModalItem, setAssignModalItem] = useState(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Forms
  const [itemForm, setItemForm] = useState({
    item_name: '',
    category: 'Computers',
    total_quantity: 1,
    condition: 'Good',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_value: 0,
    location: 'Faculty Offices'
  });

  const [assignForm, setAssignForm] = useState({
    assigned_to_user_id: '',
    assigned_to_location: '',
    quantity: 1
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, statRes, facRes] = await Promise.all([
        api.getInventory({
          search,
          category: selectedCategory === 'All' ? 'all' : selectedCategory,
          condition: selectedCondition,
          availability: selectedAvailability
        }),
        api.getInventoryStats(),
        api.getFaculty()
      ]);

      if (invRes.success) setItems(invRes.data.inventory);
      if (statRes.success) setStats(statRes.data);
      if (facRes.success) setFacultyUsers(facRes.data.faculty);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, selectedCondition, selectedAvailability]);

  // View details
  const handleViewItem = async (id) => {
    try {
      const res = await api.getInventoryById(id);
      if (res.success) setSelectedItem(res.data.item);
    } catch (err) {
      alert(err.message);
    }
  };

  // Save Item (Create / Update)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateInventoryItem(editingItem.id, itemForm);
      } else {
        await api.createInventoryItem(itemForm);
      }
      setItemModalOpen(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Item
  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await api.deleteInventoryItem(id);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Assign Asset Submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModalItem) return;
    try {
      await api.assignInventoryItem(assignModalItem.id, assignForm);
      alert('Asset successfully assigned!');
      setAssignModalItem(null);
      setAssignForm({ assigned_to_user_id: '', assigned_to_location: '', quantity: 1 });
      loadData();
      if (selectedItem?.id === assignModalItem.id) {
        handleViewItem(assignModalItem.id);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Return Asset Submit
  const handleReturnAssignment = async (assignmentId) => {
    if (window.confirm('Mark this assigned item as returned to inventory?')) {
      try {
        await api.returnInventoryAssignment(assignmentId);
        alert('Item returned to available inventory.');
        loadData();
        if (selectedItem) {
          handleViewItem(selectedItem.id);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Operations & Inventory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Track physical equipment, hardware assignments, location custody, and asset condition.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditingItem(null);
              setItemForm({
                item_name: '',
                category: 'Computers',
                total_quantity: 1,
                condition: 'Good',
                purchase_date: new Date().toISOString().split('T')[0],
                purchase_value: 0,
                location: 'Faculty Offices'
              });
              setItemModalOpen(true);
            }}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Add Inventory Asset</span>
          </button>
        )}
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid-4">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Total Valuation</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: '#047857' }}>
            ${stats?.totalValuation?.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Across {stats?.totalItems || 0} catalog assets
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Total Physical Units</span>
            <Package size={16} className="text-blue-500" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--text-main)' }}>
            {stats?.totalUnits || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tracked in department registry
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Available vs Assigned</span>
            <Layers size={16} className="text-indigo-500" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--primary)' }}>
            {stats?.availableUnits || 0} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {stats?.assignedUnits || 0} asgd</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {Math.round(((stats?.availableUnits || 0) / (stats?.totalUnits || 1)) * 100)}% available for issue
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Maintenance & Low Stock</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: stats?.damagedCount > 0 ? '#dc2626' : 'var(--text-main)' }}>
            {stats?.damagedCount || 0} <span style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 600 }}>Damaged</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#d97706' }}>
            {stats?.lowStockCount || 0} items low on stock (≤3 units)
          </div>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                  background: selectedCategory === cat ? 'var(--primary)' : '#ffffff',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search and Secondary Dropdowns */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Search equipment by name or room location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.3rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-strong)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
            >
              <option value="all">All Conditions</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Damaged">Damaged (Needs Repair)</option>
            </select>

            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
            >
              <option value="all">All Stock Levels</option>
              <option value="available">In Stock (&gt; 0)</option>
              <option value="low">Low Stock (≤ 3 units)</option>
              <option value="out">Fully Assigned (0 left)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Details</th>
                <th>Category</th>
                <th>Location</th>
                <th>Stock / Availability</th>
                <th>Condition</th>
                <th>Valuation</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const availPct = Math.round((item.available_quantity / item.total_quantity) * 100);
                const isDamaged = item.condition === 'Damaged';
                const isLow = item.available_quantity <= 3 && item.available_quantity > 0;
                const isOut = item.available_quantity === 0;

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {item.item_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Purchased: {new Date(item.purchase_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem' }}>
                        <MapPin size={13} className="text-slate-400" />
                        <span>{item.location}</span>
                      </div>
                    </td>
                    <td style={{ minWidth: '150px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                        <span><strong>{item.available_quantity}</strong> avail / {item.total_quantity} total</span>
                        <span style={{ color: isOut ? 'var(--danger)' : isLow ? '#d97706' : 'var(--success)', fontWeight: 600 }}>
                          {isOut ? 'Depleted' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${availPct}%`,
                          height: '100%',
                          background: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981',
                          borderRadius: 'var(--radius-full)'
                        }} />
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        item.condition === 'Good' ? 'badge-success' :
                        item.condition === 'Fair' ? 'badge-primary' : 'badge-danger'
                      }`}>
                        {isDamaged && <AlertTriangle size={12} />}
                        {item.condition}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        ${parseFloat(item.purchase_value).toLocaleString()}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleViewItem(item.id)}
                          title="View Details & Assignments"
                          className="btn btn-outline"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={14} />
                        </button>

                        {canManage && (
                          <>
                            <button
                              onClick={() => {
                                setAssignModalItem(item);
                                setAssignForm({ assigned_to_user_id: '', assigned_to_location: '', quantity: 1 });
                              }}
                              disabled={item.available_quantity === 0}
                              title={item.available_quantity === 0 ? "No units available to assign" : "Assign Asset"}
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--primary)' }}
                            >
                              <UserCheck size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setItemForm({
                                  item_name: item.item_name,
                                  category: item.category,
                                  total_quantity: item.total_quantity,
                                  condition: item.condition,
                                  purchase_date: item.purchase_date ? item.purchase_date.split('T')[0] : '',
                                  purchase_value: item.purchase_value,
                                  location: item.location
                                });
                                setItemModalOpen(true);
                              }}
                              title="Edit Asset"
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              title="Delete Asset"
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No inventory items match the selected category/filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODALS */}
      {/* =================================================================== */}

      {/* 1. Item Details & Active Assignments Modal */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div>
                <span className="badge badge-primary">{selectedItem.category}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.25rem' }}>{selectedItem.item_name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Location: {selectedItem.location} • Valuation: ${parseFloat(selectedItem.purchase_value).toLocaleString()}
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Unit breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Stock</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedItem.total_quantity} units</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>{selectedItem.available_quantity} units</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{selectedItem.assigned_quantity} units</div>
                </div>
              </div>

              {/* Assignments Table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Assignment History & Active Custody</h4>
                  {canManage && selectedItem.available_quantity > 0 && (
                    <button
                      onClick={() => {
                        setAssignModalItem(selectedItem);
                        setAssignForm({ assigned_to_user_id: '', assigned_to_location: '', quantity: 1 });
                      }}
                      className="btn btn-primary"
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      <Plus size={14} />
                      <span>Issue / Assign</span>
                    </button>
                  )}
                </div>

                {selectedItem.assignments?.length > 0 ? (
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Assigned To</th>
                          <th>Qty</th>
                          <th>Issued Date</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItem.assignments.map((asg) => (
                          <tr key={asg.id}>
                            <td>
                              {asg.assigned_user_name ? (
                                <div>
                                  <strong>{asg.assigned_user_name}</strong>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asg.assigned_user_email}</div>
                                </div>
                              ) : (
                                <div>
                                  <strong>{asg.assigned_to_location || 'Room Location'}</strong>
                                </div>
                              )}
                            </td>
                            <td><strong>{asg.quantity}</strong></td>
                            <td>{new Date(asg.assigned_date).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${asg.status === 'active' ? 'badge-success' : 'badge-primary'}`} style={{ textTransform: 'capitalize' }}>
                                {asg.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {asg.status === 'active' && canManage && (
                                <button
                                  onClick={() => handleReturnAssignment(asg.id)}
                                  className="btn btn-outline"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                  title="Return item to available stock"
                                >
                                  <RotateCcw size={13} />
                                  <span>Return</span>
                                </button>
                              )}
                              {asg.status === 'returned' && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Returned on {new Date(asg.return_date).toLocaleDateString()}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)' }}>
                    No active or historical assignments recorded for this asset.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Assign Asset Modal */}
      {assignModalItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Assign Asset</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {assignModalItem.item_name} ({assignModalItem.available_quantity} available)
                </div>
              </div>
              <button onClick={() => setAssignModalItem(null)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Assign to Faculty Member (Optional if Room selected)
                </label>
                <select
                  value={assignForm.assigned_to_user_id}
                  onChange={(e) => setAssignForm({ ...assignForm, assigned_to_user_id: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                >
                  <option value="">-- Select Faculty Recipient --</option>
                  {facultyUsers.filter(f => f.user_id).map(f => (
                    <option key={f.user_id} value={f.user_id}>{f.name} ({f.designation} - {f.office})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Or Assign to Lab / Room Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lab B-104 (AI Lab)"
                  value={assignForm.assigned_to_location}
                  onChange={(e) => setAssignForm({ ...assignForm, assigned_to_location: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Quantity to Issue (Max: {assignModalItem.available_quantity})
                </label>
                <input
                  type="number"
                  min="1"
                  max={assignModalItem.available_quantity}
                  required
                  value={assignForm.quantity}
                  onChange={(e) => setAssignForm({ ...assignForm, quantity: parseInt(e.target.value, 10) })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setAssignModalItem(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create / Edit Asset Modal */}
      {itemModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{editingItem ? 'Edit Asset Details' : 'Add New Inventory Asset'}</h3>
              <button onClick={() => setItemModalOpen(false)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Asset / Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell PowerEdge Server Node"
                  value={itemForm.item_name}
                  onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Total Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={itemForm.total_quantity}
                    onChange={(e) => setItemForm({ ...itemForm, total_quantity: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Condition</label>
                  <select
                    value={itemForm.condition}
                    onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Total Purchase Value ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemForm.purchase_value}
                    onChange={(e) => setItemForm({ ...itemForm, purchase_value: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Location / Room</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab B-101"
                    value={itemForm.location}
                    onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={itemForm.purchase_date}
                    onChange={(e) => setItemForm({ ...itemForm, purchase_date: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setItemModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingItem ? 'Save Changes' : 'Create Asset'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
