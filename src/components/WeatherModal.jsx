import React, { useState, useEffect } from 'react';
import { X, CloudRain, Wind, Droplets, AlertTriangle } from 'lucide-react';

const getWeatherInfo = (code) => {
  if (code === 0) return { label: 'ແຈ່ມໃສ / ແດດອອກ', icon: '☀️', danger: false };
  if (.includes(code)) return { label: 'ມີເມກບາງສ່ວນ', icon: '⛅', danger: false };
  if ([45, 48].includes(code)) return { label: 'ມີໝອກປົກຄຸມ', icon: '🌫️', danger: false };
  if ([51, 53, 55].includes(code)) return { label: 'ຝົນຕົກຮຳ / ປອຍໆ', icon: '🌦️', danger: false };
  if ([61, 63].includes(code)) return { label: 'ຝົນຕົກປານກາງ', icon: '🌧️', danger: false };
  if ([65, 80, 81, 82].includes(code)) return { label: 'ຝົນຕົກໜັກ', icon: '⛈️', danger: true };
  if ([95, 96, 99].includes(code)) return { label: 'ພະຍຸຝົນຟ້າຮ້ອງ', icon: '🌩️', danger: true };
  return { label: 'ມີເມກ', icon: '☁️', danger: false };
};

export default function WeatherModal({ isOpen, onClose, lat, lng, locationName }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FBangkok`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
          setWeather(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Weather error:', err);
        setLoading(false);
      });
  }, [isOpen, lat, lng]);

  if (!isOpen) return null;

  const current = weather?.current;
  const daily = weather?.daily;
  const currentInfo = current ? getWeatherInfo(current.weather_code) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7' }}>
            <CloudRain size={20} color="#0284c7" />
            ສະພາບອາກາດ & ພະຍາກອນຝົນ
          </h2>
          <X size={20} style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>

        <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '14px' }}>
          📍 ພື້ນທີ່: <strong>{locationName}</strong> (Real-time Open-Meteo)
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '13px' }}>
            ກຳລັງໂຫຼດຂໍ້ມູນສະພາບອາກາດ...
          </div>
        ) : current ? (
          <div>
            {/* ກາດສະພາບອາກາດປັດຈຸບັນ */}
            <div className={`weather-current-card ${currentInfo.danger ? 'weather-alert' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>
                    {Math.round(current.temperature_2m)}°C
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: currentInfo.danger ? '#b91c1c' : '#0369a1' }}>
                    {currentInfo.icon} {currentInfo.label}
                  </div>
                </div>
                <div style={{ fontSize: '42px' }}>{currentInfo.icon}</div>
              </div>

              {currentInfo.danger && (
                <div className="weather-warning-pill">
                  <AlertTriangle size={14} /> ເຝົ້າລະວັງຝົນຕົກໜັກ ອາດມີນ້ຳຖ້ວມສັບພະລັນ!
                </div>
              )}

              <div className="weather-stats-grid">
                <div className="weather-stat-item">
                  <CloudRain size={15} color="#0284c7" />
                  <div>
                    <span className="stat-label">ປະລິມານຝົນ</span>
                    <strong className="stat-value">{current.precipitation} ມມ</strong>
                  </div>
                </div>
                <div className="weather-stat-item">
                  <Droplets size={15} color="#0284c7" />
                  <div>
                    <span className="stat-label">ຄວາມຊຸ່ມ</span>
                    <strong className="stat-value">{current.relative_humidity_2m}%</strong>
                  </div>
                </div>
                <div className="weather-stat-item">
                  <Wind size={15} color="#0284c7" />
                  <div>
                    <span className="stat-label">ຄວາມໄວລົມ</span>
                    <strong className="stat-value">{Math.round(current.wind_speed_10m)} km/h</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ພະຍາກອນ 3 ມື້ຕໍ່ໜ້າ */}
            {daily && daily.time && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                  📅 ພະຍາກອນອາກາດ 3 ມື້ຕໍ່ໜ້າ:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {daily.time.slice(1, 4).map((dayStr, idx) => {
                    const actualIdx = idx + 1;
                    const code = daily.weather_code[actualIdx];
                    const info = getWeatherInfo(code);
                    const maxT = Math.round(daily.temperature_2m_max[actualIdx]);
                    const minT = Math.round(daily.temperature_2m_min[actualIdx]);
                    const rainSum = daily.precipitation_sum[actualIdx];
                    const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[actualIdx] : null;

                    const dateObj = new Date(dayStr);
                    const dayLabels = ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ'];
                    const dayName = actualIdx === 1 ? 'ມື້ອື່ນ' : actualIdx === 2 ? 'ມື້ຮື' : `ວັນ${dayLabels[dateObj.getDay()]}`;

                    return (
                      <div key={dayStr} className="weather-daily-item">
                        <div style={{ minWidth: '70px', fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>
                          {dayName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                          <span style={{ fontSize: '16px' }}>{info.icon}</span>
                          <span style={{ fontSize: '12px', color: '#475569' }}>{info.label}</span>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '12px' }}>
                          <strong>{maxT}° / {minT}°</strong>
                          {rainSum > 0 && (
                            <div style={{ fontSize: '10.5px', color: rainSum >= 15 ? '#dc2626' : '#0284c7', fontWeight: '700' }}>
                              💧 {rainSum} ມມ {rainProb ? `(${rainProb}%)` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444', fontSize: '13px' }}>
            ບໍ່ສາມາດດຶງຂໍ້ມູນສະພາບອາກາດໄດ້ໃນຕອນນີ້
          </div>
        )}
      </div>
    </div>
  );
}
