import React, { useState } from 'react';
import { X, Camera, Crosshair, Loader2, MapPin } from 'lucide-react';
import { supabase } from '../supabase';

export default function ReportModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onStartPickingLocation,
  gpsMessage,
  setGpsMessage,
  onSuccess
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  if (!isOpen) return null;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('ອຸປະກອນຂອງທ່ານບໍ່ຮອງຮັບລະບົບ GPS');
      return;
    }

    setIsLocating(true);
    setGpsMessage('ກຳລັງດຶງພິກັດ GPS...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude
        }));
        setIsLocating(false);
        setGpsMessage(`✅ ໄດ້ຮັບພິກັດ GPS ແລ້ວ (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      },
      (err) => {
        setIsLocating(false);
        setGpsMessage('');
        console.error(err);
        alert('ບໍ່ສາມາດດຶງ GPS ໄດ້: ກະລຸນາກົດ "ອະນຸຍາດ (Allow)" ໃຫ້ເວັບໄຊເຂົ້າເຖິງຕຳແໜ່ງ Location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    try {
      let uploadedImageUrl = null;

      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { error: uploadErr } = await supabase.storage
          .from('report-images')
          .upload(fileName, selectedImage);

        if (!uploadErr) {
          const { data: publicUrlData } = supabase.storage
            .from('report-images')
            .getPublicUrl(fileName);
          uploadedImageUrl = publicUrlData.publicUrl;
        } else {
          console.error('Upload error:', uploadErr);
        }
      }

      const { error } = await supabase.from('reports').insert([
        {
          type: formData.type,
          title: formData.title,
          description: formData.description,
          location_name: formData.locationName,
          phone: formData.phone,
          lat: formData.lat,
          lng: formData.lng,
          image_url: uploadedImageUrl,
          status: 'pending'
        }
      ]);

      if (!error) {
        setSelectedImage(null);
        setImagePreview(null);
        setGpsMessage('');
        setFormData({
          title: '',
          type: 'sos',
          description: '',
          locationName: '',
          phone: '',
          lat: 17.9757,
          lng: 102.6331
        });
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2>ລາຍງານເຫດການ / ຂໍຄວາມຊ່ວຍເຫຼືອ</h2>
          <X size={20} style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ປະເພດເຫດການ</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="sos">🚨 ຂໍຄວາມຊ່ວຍເຫຼືອດ່ວນ (SOS)</option>
              <option value="warning">⚠️ ແຈ້ງເຕືອນລະດັບນ້ຳ / ຖະໜົນຕັດຂາດ</option>
              <option value="shelter">🏠 ສູນພັກເຊົາຊົ່ວຄາວ</option>
              <option value="donation">📦 ຈຸດຮັບບໍລິຈາກ / ແຈກເຄື່ອງ</option>
            </select>
          </div>

          <div className="form-group">
            <label>ຫົວຂໍ້</label>
            <input
              type="text"
              placeholder="ຕົວຢ່າງ: ນ້ຳຖ້ວມສູງ ຕ້ອງການເຮືອດ່ວນ"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>ສະຖານທີ່ (ບ້ານ, ເມືອງ, ແຂວງ)</label>
            <input
              type="text"
              placeholder="ຕົວຢ່າງ: ບ້ານທ່າແຂກໃຕ້, ແຂວງຄຳມ່ວນ"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>ລາຍລະອຽດເພີ່ມເຕີມ</label>
            <textarea
              rows={3}
              placeholder="ລະບຸຈຳນວນຄົນ, ສະພາບຕົວຈິງ ຫຼື ສິ່ງທີ່ຕ້ອງການ..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ຮູບພາບສະພາບຕົວຈິງ (ຖ້າມີ)</label>
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" />
                <button type="button" className="btn-remove-img" onClick={handleRemoveImage}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="upload-box">
                <div className="upload-icon-circle">
                  <Camera size={22} color="#334155" />
                </div>
                <span style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: '700' }}>
                  ກົດຖ່າຍຮູບ ຫຼື ເລືອກຮູບຈາກມືຖື
                </span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  ຮອງຮັບໄຟລ໌ຮູບພາບ JPG, PNG
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          <div className="form-group">
            <label>ເບີໂທຕິດຕໍ່ສຸກເສີນ (WhatsApp/ໂທ)</label>
            <input
              type="text"
              placeholder="020 xxxx xxxx"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
              ພິກັດຈຸດເກີດເຫດ
            </label>

            {gpsMessage && (
              <div className="gps-success-text">
                {gpsMessage}
              </div>
            )}

            <button
              type="button"
              className="btn-gps"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  ກຳລັງຊອກຫາຕຳແໜ່ງ GPS...
                </>
              ) : (
                <>
                  <Crosshair size={16} />
                  📍 ດຶງຕຳແໜ່ງປັດຈຸບັນຂອງຂ້ອຍ (GPS)
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-pick-map"
              onClick={onStartPickingLocation}
            >
              <MapPin size={15} />
              🗺️ ຫຼື ຈິ້ມເລືອກຈຸດເທິງແຜນທີ່ດ້ວຍຕົນເອງ
            </button>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              ຍົກເລີກ
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'ກຳລັງອັບໂຫຼດ ແລະ ສົ່ງ...' : 'ສົ່ງລາຍງານ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
