import React, { useState } from 'react';
import { X, Lock, Unlock, Trash2, Search, Calendar } from 'lucide-react';
import { supabase } from '../supabase';

const ADMIN_PIN = '9999';

export default function AdminModal({ isOpen, onClose, reports, onRefresh }) {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      setErrorMsg('');
      setPinInput('');
    } else {
      setErrorMsg('❌ ລະຫັດ PIN ບໍ່ຖືກຕ້ອງ!');
      setPinInput('');
    }
  };

  const handleDeleteReport = async (reportId, title) => {
    const confirmDelete = window.confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບເຫດການ:\n"${title}"\nອອກຈາກລະບົບຢ່າງຖາວອນ?`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        alert('ເກີດຂໍ້ຜິດພາດ: ' + error.message);
      } else {
        alert('✅ ລຶບເຫດການສຳເລັດແລ້ວ!');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      alert('ບໍ່ສາມາດລຶບໄດ້');
    } finally {
      setIsDeleting(false);
    }
  };

  const currentTime = Date.now();

  // 1. ກວດສອບເງື່ອນໄຂສະແດງຜົນຄືກັບແຜນທີ່:
  // - ຖ້າຊ່ວຍແລ້ວ: ໂຊທັງໝົດຕັ້ງແຕ່ສູນ
  // - ຖ້າຍັງບໍ່ທັນຊ່ວຍ (SOS, ທາງ, ເຕືອນໄພ): ໂຊສະເພາະອັນທີ່ມີເທິງແຜນທີ່ (ບໍ່ເກີນ 72 ຊົ່ວໂມງ)
  const isVisibleInAdmin = (r) => {
    if (r.status === 'resolved') return true;
    const hours = (currentTime - new Date(r.created_at).getTime()) / (1000 * 60 * 60);
    return hours <= 72;
  };

  // 2. ກວດສອບຊ່ວງເວລາ (ມື້ນີ້, 7 ວັນ, ເດືອນນີ້)
  const isWithinTime = (createdAtStr) => {
    if (timeRange === 'all') return true;
    const created = new Date(createdAtStr).getTime();
    const now = new Date();

    if (timeRange === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return created >= startOfToday;
    }
    if (timeRange === 'week') {
      const sevenDaysAgo = currentTime - (7 * 24 * 60 * 60 * 1000);
      return created >= sevenDaysAgo;
    }
    if (timeRange === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return created >= startOfMonth;
    }
    return true;
  };

  // ລາຍການທີ່ຜ່ານເງື່ອນໄຂແຜນທີ່ & ຊ່ວງເວລາ
  const baseReports = reports.filter(isVisibleInAdmin).filter((r) => isWithinTime(r.created_at));

  // ກັ່ນຕອງຕາມ Tab ທີ່ເລືອກ
  const filteredReports = baseReports.filter((r) => {
    const createdAt = new Date(r.created_at).getTime();
    const hoursPassed = (currentTime - createdAt) / (1000 * 60 * 60);

    if (activeTab === 'urgent') {
      if (r.type !== 'sos' || r.status === 'resolved' || hoursPassed < 24) return false;
    } else if (activeTab === 'sos') {
      if (r.type !== 'sos' || r.status === 'resolved') return false;
    } else if (activeTab === 'road') {
      if (r.type !== 'road' || r.status === 'resolved') return false;
    } else if (activeTab === 'resolved') {
      if (r.status !== 'resolved') return false;
    }

    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const title = (r.title || '').toLowerCase();
    const loc = (r.location_name || '').toLowerCase();
    const phone = (r.phone || '').toLowerCase();
    return title.includes(q) || loc.includes(q) || phone.includes(q);
  });

  // ນັບຈຳນວນຕົວເລກແຕ່ລະ Tab
  const stats = {
    total: baseReports.length,
    urgent: baseReports.filter(r => {
      const hours = (currentTime - new Date(r.created_at).getTime()) / (1000 * 60 * 60);
      return r.type === 'sos' && r.status !== 'resolved' && hours >= 24;
    }).length,
    sos: baseReports.filter(r => r.type === 'sos' && r.status !== 'resolved').length,
    road: baseReports.filter(r => r.type === 'road' && r.status !== 'resolved').length,
    resolved: reports.filter(r => r.status === 'resolved' && isWithinTime(r.created_at)).length,
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-modal-box" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAuthenticated ? <Unlock size={20} color="#16a34a" /> : <Lock size={20} color="#dc2626" />}
            <h2 style={{ margin: 0, fontSize: '16px' }}>
              {isAuthenticated ? 'ລະບົບຫຼັງບ້ານ (Admin Panel)' : 'ເຂົ້າສູ່ລະບົບຫຼັງບ້ານ'}
            </h2>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        {!isAuthenticated ? (
          <div className="admin-login-box">
            <div className="admin-lock-icon">
              <Lock size={36} color="#dc2626" />
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '15px' }}>ປ້ອນລະຫັດ PIN ລັບ</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
              ສະເພາະຜູ້ພັດທະນາ ແລະ ທີມງານກູ້ໄພເທົ່ານັ້ນ
            </p>

            <form onSubmit={handleUnlock}>
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="ປ້ອນລະຫັດ PIN 4 ຕົວເລກ..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="admin-pin-input"
              />

              {errorMsg && <div className="admin-error-text">{errorMsg}</div>}

              <button type="submit" className="btn-admin-login">
                ປົດລັອກເຂົ້າສູ່ລະບົບ
              </button>
            </form>
          </div>
        ) : (
          <div className="admin-content-body">
            
            {/* Filter Tabs ປຸ່ມກົດມົນມຸມ ບໍ່ຖືກບີບ */}
            <div className="admin-filter-tabs">
              <button
                className={`admin-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                ທັງໝົດ ({stats.total})
              </button>

              <button
                className={`admin-tab-btn tab-urgent ${activeTab === 'urgent' ? 'active' : ''}`}
                onClick={() => setActiveTab('urgent')}
              >
                🔥 ດ່ວນ ({stats.urgent})
              </button>

              <button
                className={`admin-tab-btn ${activeTab === 'sos' ? 'active' : ''}`}
                onClick={() => setActiveTab('sos')}
              >
                🚨 ລໍຖ້າການຊ່ວຍ ({stats.sos})
              </button>

              <button
                className={`admin-tab-btn ${activeTab === 'road' ? 'active' : ''}`}
                onClick={() => setActiveTab('road')}
              >
                🚧 ສະພາບເສັ້ນທາງ ({stats.road})
              </button>

              <button
                className={`admin-tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolved')}
              >
                ✅ ຊ່ວຍເຫຼືອແລ້ວ ({stats.resolved})
              </button>
            </div>

            {/* ແຖບຄົ້ນຫາ + ເລືອກຊ່ວງເວລາ + ອອກຈາກລະບົບ */}
            <div className="admin-tools-bar">
              <div className="admin-search-wrap">
                <Search size={14} className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາບ້ານ, ເມືອງ, ຫົວຂໍ້, ເບີໂທ..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="admin-search-input"
                />
              </div>

              {/* ປຸ່ມເລືອກຊ່ວງເວລາ (ມື້ນີ້, 7 ວັນ, ເດືອນນີ້) */}
              <div className="admin-time-filter">
                <Calendar size={13} color="#475569" style={{ flexShrink: 0 }} />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="admin-time-select"
                >
                  <option value="all">🗓️ ທຸກຊ່ວງເວລາ</option>
                  <option value="today">⚡ ສະເພາະມື້ນີ້</option>
                  <option value="week">📅 7 ວັນຜ່ານມາ</option>
                  <option value="month">📆 ສະເພາະເດືອນນີ້</option>
                </select>
              </div>

              <button className="btn-admin-logout" onClick={() => setIsAuthenticated(false)}>
                ອອກຈາກລະບົບ
              </button>
            </div>

            {/* ລາຍການເຫດການ */}
            <div className="admin-reports-table">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <div key={report.id} className="admin-report-row">
                    <div className="admin-row-main">
                      <div className="admin-row-header">
                        <span className={`popup-badge pin-${report.type}`} style={{ margin: 0, fontSize: '10.5px' }}>
                          {report.type === 'sos' && '🚨 SOS'}
                          {report.type === 'road' && '🚧 ທາງ'}
                          {report.type === 'warning' && '⚠️ ເຕືອນໄພ'}
                          {report.type === 'shelter' && '🏠 ສູນພັກ'}
                          {report.type === 'donation' && '📦 ບໍລິຈາກ'}
                        </span>
                        {report.status === 'resolved' && (
                          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>✅ ຊ່ວຍແລ້ວ</span>
                        )}
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {new Date(report.created_at).toLocaleDateString('lo-LA')} {new Date(report.created_at).toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 className="admin-row-title">{report.title}</h4>
                      {report.description && (
                        <p className="admin-row-desc">{report.description}</p>
                      )}
                      <div className="admin-row-meta">
                        <span>📍 {report.location_name}</span>
                        {report.phone && (
                          <a href={`tel:${report.phone}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '700' }}>
                            📞 {report.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="admin-row-actions">
                      <button
                        className="btn-admin-delete"
                        disabled={isDeleting}
                        onClick={() => handleDeleteReport(report.id, report.title)}
                        title="ລຶບເຫດການນີ້ອອກຈາກລະບົບ"
                      >
                        <Trash2 size={15} />
                        <span>ລຶບ</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '35px 15px', color: '#64748b', fontSize: '13px' }}>
                  ບໍ່ພົບເຫດການໃນໝວດໝູ່ ຫຼື ຊ່ວງເວລານີ້
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
