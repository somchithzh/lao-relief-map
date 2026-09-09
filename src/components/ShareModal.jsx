import React from 'react';
import { X, MessageCircle, Send, Copy, Share2 } from 'lucide-react';

export default function ShareModal({ report, onClose }) {
  if (!report) return null;

  const shareToWhatsApp = () => {
    const text = `🚨 [Lao Relief Map - ແຈ້ງເຫດດ່ວນ]
📌 ຫົວຂໍ້: ${report.title}
📍 ສະຖານທີ່: ${report.location_name}
📝 ລາຍລະອຽດ: ${report.description || 'ບໍ່ມີ'}
📞 ເບີຕິດຕໍ່: ${report.phone}
🗺️ ເບິ່ງພິກັດເທິງແຜນທີ່: https://somchithzh.github.io/lao-relief-map/`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = 'https://somchithzh.github.io/lao-relief-map/';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareCopyText = () => {
    const text = `🚨 [Lao Relief Map] ${report.title} ທີ່ ${report.location_name} (ໂທ: ${report.phone})
https://somchithzh.github.io/lao-relief-map/`;

    navigator.clipboard.writeText(text);
    alert('ຄັດລອກຂໍ້ຄວາມ ແລະ ລິ້ງແຜນທີ່ແລ້ວ! ສາມາດນຳໄປ Paste ໃນ Messenger ຫຼື ແຊັດໄດ້ເລີຍ.');
  };

  const shareNativeDevice = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lao Relief Map',
          text: `🚨 [ແຈ້ງເຫດ] ${report.title} ທີ່ ${report.location_name} (ໂທ: ${report.phone})`,
          url: 'https://somchithzh.github.io/lao-relief-map/',
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      shareCopyText();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '17px', margin: 0 }}>ແບ່ງປັນເຫດການ</h2>
          <X size={20} style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>

        <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '16px' }}>
          📍 <strong>{report.title}</strong> ({report.location_name})
        </p>

        <button className="share-option-btn share-wa" onClick={shareToWhatsApp}>
          <MessageCircle size={18} /> ແຊຣ໌ເຂົ້າ WhatsApp
        </button>

        <button className="share-option-btn share-fb" onClick={shareToFacebook}>
          <Send size={18} /> ແຊຣ໌ເທິງ Facebook / Messenger
        </button>

        <button className="share-option-btn share-copy" onClick={shareCopyText}>
          <Copy size={18} /> ຄັດລອກຂໍ້ຄວາມ ແລະ ລິ້ງ (Copy)
        </button>

        {navigator.share && (
          <button className="share-option-btn share-native" onClick={shareNativeDevice}>
            <Share2 size={18} /> ເປີດແອັບອື່ນໆໃນມືຖື...
          </button>
        )}
      </div>
    </div>
  );
}
