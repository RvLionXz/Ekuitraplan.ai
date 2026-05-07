# Dokumentasi API Chat
## Ekuitraplan.ai — Chat API Specification

**Versi API:** 1.0.0  
**Base URL:** `/api/chat`  
**Method:** `POST`  

---

## Endpoint

### POST `/api/chat`

Mengirim pesan ke AI assistant dan menerima itinerary perjalanan.

#### Request

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Rekomendasi liburan ke Sabang selama seminggu"
    }
  ]
}
```

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `messages` | Array | Array of message objects |
| `messages[].role` | String | `"user"` atau `"assistant"` |
| `messages[].content` | String | Isi pesan |

#### Response

**Sukses (200):**
```json
{
  "chat_response": "Berikut itinerary perjalanan Anda ke Sabang...",
  "itinerary_data": {
    "trip_metadata": {
      "title": "Petualangan di Sabang",
      "region": "Sabang",
      "from_location": "Jakarta",
      "duration_days": 7,
      "total_eco_score": 92
    },
    "itinerary": [
      {
        "day": 1,
        "theme": "Kedatangan dan Relaksasi",
        "activities": [
          {
            "time": "Pagi",
            "activity": "Tiba di Sabang",
            "location": "Sabang",
            "latitude": 5.8927453,
            "longitude": 95.3225751,
            "transport": "flight",
            "description": "Tiba di Bandara Maimun Saleh..."
          }
        ]
      }
    ],
    "recommended_activities": [
      {
        "name": "Wisata Gua Sarang",
        "location": "Sabang",
        "description": "Sistem gua alami...",
        "eco_score": 85
      }
    ]
  },
  "carbon_data": {
    "total_emissions_kg": 170,
    "emissions_with_buffer_kg": 187,
    "total_saved_kg": 15.2,
    "distance_km": 840,
    "transport_type": "flight"
  },
  "eco_activity": {
    "name": "Tree Planting Program",
    "type": "tree-planting",
    "location": "Indonesia",
    "description": "Tanam pohon di program reforestasi...",
    "impact": "1 pohon menyerap 10-22kg CO2/tahun"
  },
  "enriched_data": {
    "hotels": [...],
    "flights": [...]
  },
  "eco_comparisons": [
    {
      "activity": "Snorkeling di Pantai Gapang",
      "transport": "sewa mobil",
      "actual_carbon_kg": 0.45,
      "saved_carbon_kg": 0,
      "message": "Pilihan yang schon!"
    }
  ],
  "recommended_activities": [...],
  "maps_grounded": true
}
```

**Validasi Gagal - Perlu Info Tambahan (200):**
```json
{
  "chat_response": "Hai! Sebelum aku buatkan itinerary Sabang yang seru, boleh tahu dari mana lokasinya dan budget-nya?",
  "needs_more_info": true,
  "missing_info": ["from_location", "budget", "jumlah_orang"],
  "itinerary_data": null,
  "carbon_data": null,
  "eco_activity": null,
  "enriched_data": null,
  "recommended_activities": [],
  "eco_comparisons": [],
  "maps_grounded": false
}
```

**Error (500):**
```json
{
  "error": "Gagal memproses permintaan AI"
}
```

---

## Field Response Detail

### trip_metadata

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `title` | String | Judul trip |
| `region` | String | Wilayah tujuan |
| `from_location` | String | Lokasi asal |
| `duration_days` | Number | Jumlah hari |
| `total_eco_score` | Number | Skor eco (0-100) |

### itinerary[].activities[]

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `time` | String | "Pagi", "Siang", "Sore", "Malam" |
| `activity` | String | Nama aktivitas |
| `location` | String | Lokasi aktivitas |
| `latitude` | Number | Koordinat lintang |
| `longitude` | Number | Koordinat bujur |
| `transport` | String | Transportasi yang digunakan |
| `description` | String | Deskripsi aktivitas |
| `eco_impact` | String | Dampak eco |
| `eco_message` | String | Pesan eco comparison |
| `eco_saved_kg` | Number | Kg CO2 yang dihemat |

### carbon_data

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `total_emissions_kg` | Number | Total emisi CO2 (kg) |
| `emissions_with_buffer_kg` | Number | Emisi + 10% buffer (kg) |
| `total_saved_kg` | Number | Total CO2 yang dihemat (kg) |
| `distance_km` | Number | Total jarak (km) |
| `transport_type` | String | "flight", "car", dll |

### eco_activity

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `name` | String | Nama aktivitas eco |
| `type` | String | Tipe: "tree-planting", "mangrove", dll |
| `location` | String | Lokasi |
| `description` | String | Deskripsi |
| `impact` | String | Dampak lingkungan |

---

## Contoh Penggunaan

### cURL

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Rekomendasi liburan ke Bali 4 hari"}
    ]
  }'
```

### JavaScript (Fetch)

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Rekomendasi liburan ke Bali 4 hari' }
    ]
  })
});

const data = await response.json();

if (data.needs_more_info) {
  console.log('AI butuh info:', data.missing_info);
  // Tampilkan pertanyaan AI
  displayMessage(data.chat_response);
} else if (data.itinerary_data) {
  // Tampilkan itinerary
  displayItinerary(data.itinerary_data);
}
```

### Python (Requests)

```python
import requests

response = requests.post(
    'http://localhost:3000/api/chat',
    json={
        'messages': [
            {'role': 'user', 'content': 'Rekomendasi liburan ke Bali 4 hari'}
        ]
    }
)

data = response.json()
print(data.get('chat_response'))
```

---

## Rate Limiting

Tidak ada rate limiting khusus untuk development. Untuk production, implementasi rate limiting disarankan di level Next.js middleware atau reverse proxy.

---

## Error Codes

| HTTP Status | Error Message | Penjelasan |
|-------------|---------------|------------|
| 400 | "Format pesan tidak valid" | Body request tidak sesuai format |
| 500 | "Konfigurasi AI belum lengkap" | GOOGLE_API_KEY tidak ada |
| 500 | "Gagal memproses permintaan AI" | Error internal AI/Gemini |
| 500 | "Missing GOOGLE_API_KEY" | API key tidak dikonfigurasi |
