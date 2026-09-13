import React, { useState } from 'react';
import { X, Lock, Unlock, Trash2, CheckCircle, Search, RefreshCw, AlertCircle, Phone } from 'lucide-react';
import { supabase } from '../supabase';

// ລະຫັດ PIN ລັບສຳລັບ Admin (ເຈົ້າສາມາດປ່ຽນເປັນເລກອື່ນໄດ້)
const ADMIN_PIN = '9999';

export default function AdminModal({ isOpen, onClose, reports, onRefresh }) {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  // ກວດສອບລະຫັດ PIN
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

  // ຟັງຊັນລຶບເຫດການອອກຈາກ Supabase
  const handleDeleteReport = async (reportId, title) => {
    const confirmDelete = window.confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບເຫດການ:\n"${title}"\nອອກຈາກແຜນທີ່ຢ່າງຖາວອນ?`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        alert('ເກີດຂໍ້ຜິດພາດໃນການລຶບ: ' + error.message);
      } else {
        alert('✅ ລຶບເຫດການສຳເລັດແລ້ວ! ໝຸດຖືກຖອນອອກຈາກແຜນທີ່ແລ້ວ.');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      alert('ບໍ່ສາມາດລຶບໄດ້');
    } finally {
      setIsDeleting(false);
    }
  };

  // ກັ່ນຕອງເຫດການໃນໜ້າ Admin
  const filteredReports = reports.filter((r) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const title = (r.title || '').toLowerCase();
    const loc = (r.location_name || '').toLowerCase();
    const phone = (r.phone || '').toLowerCase();
    return title.includes(q) || loc.includes(q) || phone.includes(q);
  });

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

        {/* ຖ້າຍັງບໍ່ທັນປົດລັອກ: ສະແດງໜ້າປ້ອນ PIN */}
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
                placeholder="ປ້ອນ PIN (ເລີ່ມຕົ້ນ: 9999)"
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
          /* ເມື່ອປົດລັອກແລ້ວ: ສະແດງຕາຕະລາງລາຍການເຫດການ */
          <div className="admin-content-body">
            {/* ແຖບສະຫຼຸບ & ຄົ້ນຫາ */}
            <div className="admin-tools-bar">
              <div className="admin-stats-badge">
                ທັງໝົດ: <strong>{reports.length}</strong> ເຫດການ
              </div>

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

                    {/* ປຸ່ມລຶບ */}
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
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '13px' }}>
                  ບໍ່ພົບເຫດການທີ່ຕົງກັບຄຳຄົ້ນຫາ
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}