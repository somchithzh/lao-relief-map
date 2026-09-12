import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';

export default function ShareModal({ report, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const baseUrl = window.location.origin + window.location.pathname;
  const shareText = `🚨 [Lao Relief Map] ${report.title} ທີ່ ${report.location_name} ${report.phone ? `(ໂທ: ${report.phone})` : ''}\nກວດສອບສະຖານະການ & ແຜນທີ່ໄພພິບັດ:\n${baseUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareFacebook = () => {
    navigator.clipboard.writeText(shareText);
    alert('✅ ກັອບປີ້ຂໍ້ຄວາມເຫດການແລ້ວ!\n\nເມື່ອໜ້າຕ່າງ Facebook ເປີດຂຶ້ນ ທ່ານສາມາດກົດ "ວາງ (Paste)" ຂໍ້ຄວາມລົງໃນໂພສໄດ້ທັນທີ.');
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`;
    window.open(fbUrl, '_blank');
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={18} color="#dc2626" />
            <h2 style={{ margin: 0, fontSize: '15px' }}>ແບ່ງປັນເຫດການນີ້</h2>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="share-body">
          <div className="share-preview-card">
            <div className="share-preview-badge">
              {report.type === 'sos' && '🚨 ຂໍຄວາມຊ່ວຍເຫຼືອ'}
              {report.type === 'road' && '🚧 ສະພາບເສັ້ນທາງ'}
              {report.type === 'warning' && '⚠️ ແຈ້ງເຕືອນ'}
              {report.type === 'shelter' && '🏠 ສູນພັກເຊົາ'}
              {report.type === 'donation' && '📦 ຈຸດບໍລິຈາກ'}
            </div>
            <h4 style={{ margin: '6px 0 4px 0', fontSize: '14px', color: '#0f172a' }}>{report.title}</h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>📍 {report.location_name}</p>
          </div>

          <div className="share-buttons-list">
            <button className="btn-share-channel share-fb" onClick={handleShareFacebook}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>ແຊຣ໌ລົງ Facebook (ພ້ອມກັອບປີ້ຂໍ້ຄວາມ)</span>
            </button>

            <button className="btn-share-channel share-wa" onClick={handleShareWhatsApp}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              <span>ສົ່ງຕໍ່ໃນ WhatsApp</span>
            </button>

            <button className="btn-share-channel share-copy" onClick={handleCopy}>
              {copied ? <Check size={18} color="#16a34a" /> : <Copy size={18} />}
              <span>{copied ? 'ກັອບປີ້ຂໍ້ຄວາມແລ້ວ! ✅' : 'ກັອບປີ້ຂໍ້ຄວາມ & ລິ້ງ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
