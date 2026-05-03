// Simulator data travel untuk Ekuitraplan
// Mensimulasikan data dari Google Places & Amadeus API

export const getEnrichedData = (location: string, type: 'hotel' | 'activity' | 'flight') => {
  // Database simulasi untuk destinasi populer
  const db: any = {
    'bali': {
      hotels: [
        {
          id: 'h1',
          name: 'Alila Villas Uluwatu',
          rating: 4.9,
          reviews_count: 1240,
          price: 'Rp 12.500.000',
          eco_badge: 'Platinum Eco-Leaf',
          description: 'Resor mewah bertenaga surya sepenuhnya dengan sistem daur ulang air tercanggih di Bali.',
          reviews: [
            "Pemandangannya luar biasa dan komitmen mereka terhadap lingkungan sangat terasa.",
            "Hotel paling ramah lingkungan yang pernah saya kunjungi tanpa mengurangi kemewahan."
          ],
          image: '/images/bali-resort.png'
        },
        {
          id: 'h2',
          name: 'Bambu Indah Ubud',
          rating: 4.7,
          reviews_count: 850,
          price: 'Rp 4.200.000',
          eco_badge: 'Gold Regenerative',
          description: 'Hotel bambu ikonik yang menyatu dengan alam, mendukung petani lokal secara langsung.',
          reviews: [
            "Tidur dengan suara sungai dan makan sayur segar dari kebun mereka sendiri.",
            "Unik dan sangat menginspirasi. Pengalaman yang benar-benar regeneratif."
          ],
          image: '/images/ubud-bamboo.png'
        }
      ],
      flights: [
        { airline: 'Garuda Indonesia', from: 'Jakarta', to: 'Bali', price: 'Rp 1.850.000', carbon: 'Low' },
        { airline: 'AirAsia', from: 'Jakarta', to: 'Bali', price: 'Rp 850.000', carbon: 'Medium' }
      ]
    },
    'raja ampat': {
      hotels: [
        {
          id: 'r1',
          name: 'Misool Eco Resort',
          rating: 5.0,
          reviews_count: 450,
          price: 'Rp 8.900.000',
          eco_badge: 'Marine Conservation Leader',
          description: 'Pusat konservasi laut yang menyamar menjadi resor mewah. Setiap dolar Anda digunakan untuk melindungi hiu.',
          reviews: [
            "Bukan sekadar liburan, ini adalah kontribusi nyata untuk bumi.",
            "Surga di dunia yang benar-benar dijaga kelestariannya."
          ],
          image: '/images/misool.png'
        }
      ]
    }
  };

  const normalizedLoc = location.toLowerCase();
  const found = Object.keys(db).find(key => normalizedLoc.includes(key));
  
  if (found) {
    return db[found][type + 's'] || [];
  }

  // Generic fallback if location not in DB
  return [
    {
      name: `Eco Lodge ${location}`,
      rating: 4.5,
      reviews_count: 120,
      price: 'Rp 1.200.000',
      eco_badge: 'Eco-Certified',
      description: `Penginapan ramah lingkungan pilihan di ${location} yang mendukung komunitas lokal.`,
      reviews: ["Sangat bersih dan asri.", "Stafnya sangat membantu dan peduli lingkungan."],
      image: '/images/generic-eco.png'
    }
  ];
};
