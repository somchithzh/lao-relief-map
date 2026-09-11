import React, { useState } from 'react';
import { X, MapPin, Upload, Navigation2, Check, AlertTriangle, Construction } from 'lucide-react';
import { supabase } from '../supabase';

const REPORT_TYPES = [
  { id: 'sos', label: '🚨 ຂໍຄວາມຊ່ວຍເຫຼືອ', desc: 'ຄົນຕິດຄ້າງ, ຕ້ອງການເຮືອ/ອາຫານດ່ວນ' },
  { id: 'road', label: '🚧 ສະພາບເສັ້ນທາງ', desc: 'ທາງຕັດຂາດ, ນ້ຳຖ້ວມທາງ, ດິນເຈື່ອນ' },
  { id: 'warning', label: '⚠️ ແຈ້ງເຕືອນ', desc: 'ເຂດສ່ຽງໄພ, ນ້ຳກຳລັງຂຶ້ນ' },
  { id: 'shelter', label: '🏠 ສູນພັກເຊົາ', desc: 'ຈຸດພັກປອດໄພ, ວັດ, ໂຮງຮຽນ' },
  { id: 'donation', label: '📦 ຈຸດບໍລິຈາກ', desc: 'ບ່ອນຮັບ/ແຈກຢາຍອາຫານ & ເຄື່ອງໃຊ້' },
];

const ROAD_CONDITIONS = [
  { id: 'blocked', label: '🔴 ຜ່ານບໍ່ໄດ້ເລີຍ', desc: 'ທາງຕັດຂາດ / ນ້ຳໄຫຼເຊີ່ຍ / ດິນເຈື່ອນໃຫຍ່' },
  { id: 'high_only', label: '🟡 ຜ່ານໄດ້ສະເພາະລົດໃຫຍ່', desc: 'ລົດເກັງ & ລົດຈັກຜ່ານບໍ່ໄດ້ / ລົດກະບະຍົກສູງຜ່ານໄດ້' },
  { id: 'passable', label: '🟢 ຜ່ານໄດ້ປົກກະຕິ', desc: 'ນ້ຳແຫ້ງແລ້ວ / ເປີດການສັນຈອນແລ້ວ' },
];

export default function ReportModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onStartPickingLocation,
  gpsMessage,
  setGpsMessage,
  onSuccess,
}) {
  const [roadCondition, setRoadCondition] = useState('blocked');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ຂະໜາດຮູບພາບໃຫຍ່ເກີນ 5MB, ກະລຸນາເລືອກຮູບໃໝ່');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('ອຸປະກອນຂອງທ່ານບໍ່ຮອງຮັບ GPS');
      return;
    }
    setGpsMessage('⏳ ກຳລັງດຶງ GPS ປັດຈຸບັນ...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        setGpsMessage(`✅ ດຶງ GPS ສຳເລັດ: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      (err) => {
        console.error(err);
        setGpsMessage('❌ ບໍ່ສາມາດດຶງ GPS ໄດ້, ກະລຸນາເລືອກເທິງແຜນທີ່');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('ກະລຸນາປ້ອນຫົວຂໍ້ເຫດການ');
      return;
    }
    if (!formData.locationName.trim()) {
      alert('ກະລຸນາປ້ອນຊື່ສະຖານທີ່ / ບ້ານ / ເມືອງ');
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedImageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('report_images')
          .upload(filePath, imageFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('report_images')
            .getPublicUrl(filePath);
          uploadedImageUrl = publicUrl;
        }
      }

      // ຖ້າເປັນປະເພດເສັ້ນທາງ ໃຫ້ໃສ່ປ້າຍສະຖານະໄວ້ໃນຫົວຂໍ້ ແລະ ລາຍລະອຽດ
      let finalTitle = formData.title;
      let finalDesc = formData.description;

      if (formData.type === 'road') {
        const selectedCond = ROAD_CONDITIONS.find(c => c.id === roadCondition);
        const prefix = selectedCond ? `[${selectedCond.label}] ` : '[🚧 ສະພາບທາງ] ';
        finalTitle = prefix + formData.title;
        finalDesc = `${formData.description || ''}\n\nສະພາບທາງ: ${selectedCond?.label || ''} (${selectedCond?.desc || ''})`.trim();
      }

      const { error } = await supabase.from('reports').insert([
        {
          title: finalTitle,
          type: formData.type,
          description: finalDesc,
          location_name: formData.locationName,
          phone: formData.phone,
          lat: formData.lat,
          lng: formData.lng,
          image_url: uploadedImageUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        alert('ເກີດຂໍ້ຜິດພາດ: ' + error.message);
      } else {
        alert('ລາຍງານເຫດສຳເລັດແລ້ວ! ຂໍ້ມູນຈະປາກົດເທິງແຜນທີ່ທັນທີ.');
        onSuccess();
        onClose();
        setFormData({
          title: '',
          type: 'sos',
          description: '',
          locationName: '',
          phone: '',
          lat: 17.9757,
          lng: 102.6331,
        });
        setImageFile(null);
        setImagePreview(null);
        setGpsMessage('');
      }
    } catch (err) {
      console.error(err);
      alert('ເກີດຂໍ້ຜິດພາດໃນການສົ່ງຂໍ້ມູນ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📢 ແຈ້ງເຫດ / ລາຍງານໄພພິບັດ</h2>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ປະເພດເຫດການ:</label>
            <div className="type-selector-grid">
              {REPORT_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className={`type-btn ${formData.type === t.id ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, type: t.id })}
                >
                  <div className="type-btn-title">{t.label}</div>
                  <div className="type-btn-desc">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ຖ້າເລືອກປະເພດ "ສະພາບເສັ້ນທາງ": ໃຫ້ເລືອກສະຖານະທາງ */}
          {formData.type === 'road' && (
            <div className="form-group" style={{ background: '#fff7ed', padding: '12px', borderRadius: '10px', border: '1px solid #fed7aa' }}>
              <label style={{ color: '#c2410c', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Construction size={16} /> ສະຖານະຂອງເສັ້ນທາງ:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ROAD_CONDITIONS.map((cond) => (
                  <label 
                    key={cond.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '8px', 
                      cursor: 'pointer',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: roadCondition === cond.id ? '#ffffff' : 'transparent',
                      border: roadCondition === cond.id ? '1.5px solid #ea580c' : '1px solid #ffedd5'
                    }}
                  >
                    <input
                      type="radio"
                      name="roadCondition"
                      checked={roadCondition === cond.id}
                      onChange={() => setRoadCondition(cond.id)}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px' }}>{cond.label}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{cond.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>ຫົວຂໍ້ເຫດການ *:</label>
            <input
              type="text"
              required
              placeholder={formData.type === 'road' ? 'ເຊັ່ນ: ທາງເລກ 13 ໃຕ້ ຫຼັກ 42 ນ້ຳຖ້ວມສູງ' : 'ເຊັ່ນ: ນ້ຳຖ້ວມຊັ້ນ 1, ຕິດຄ້າງ 3 ຄົນ'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ບ້ານ, ເມືອງ, ແຂວງ *:</label>
            <input
              type="text"
              required
              placeholder="ເຊັ່ນ: ບ້ານຫ້ອມ, ເມືອງຫາດຊາຍຟອງ, ນະຄອນຫຼວງວຽງຈັນ"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ເບີໂທຕິດຕໍ່:</label>
            <input
              type="text"
              placeholder="ເຊັ່ນ: 020 XXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ລາຍລະອຽດເພີ່ມເຕີມ:</label>
            <textarea
              rows="3"
              placeholder={formData.type === 'road' ? 'ເຊັ່ນ: ລະດັບນ້ຳເລິກປະມານ 50 ຊມ, ນ້ຳໄຫຼແຮງ ຫ້າມລົດນ້ອຍຜ່ານ' : 'ລະບຸຄວາມຕ້ອງການດ່ວນ, ຈຳນວນຄົນ, ເດັກນ້ອຍ, ຜູ້ເຖົ້າ...'}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="form-group">
            <label>ຕຳແໜ່ງພິກັດ (Lat, Lng):</label>
            <div className="location-action-buttons">
              <button type="button" className="btn-loc btn-loc-gps" onClick={handleGetCurrentLocation}>
                <Navigation2 size={14} />
                <span>ດຶງ GPS ປັດຈຸບັນ</span>
              </button>
              <button type="button" className="btn-loc btn-loc-map" onClick={onStartPickingLocation}>
                <MapPin size={14} />
                <span>ເລືອກເທິງແຜນທີ່</span>
              </button>
            </div>
            {gpsMessage && <div className="gps-status-text">{gpsMessage}</div>}
          </div>

          <div className="form-group">
            <label>ຮູບພາບສະຖານະການ (ຖ້າມີ):</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {imagePreview && (
              <div style={{ marginTop: '8px' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }} />
              </div>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'ກຳລັງບັນທຶກ...' : '✅ ຢືນຢັນການລາຍງານ'}
          </button>
        </form>
      </div>
    </div>
  );
}
