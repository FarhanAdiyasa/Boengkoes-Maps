<div align="center">
  <img src="./public/icon.svg" width="128" height="128" alt="Ikutin Boengkoes Logo" />
  <h1>Ikutin Boengkoes</h1>
  <p><strong>Peta Kuliner Terpercaya ala Boengkoes Network</strong></p>
  
  [![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://ikutin-boengkoes.farhan-adiyasa.site)
  [![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
</div>

---

## 🎯 About The Project

**Ikutin Boengkoes** adalah aplikasi katalog kuliner interaktif yang memetakan rekomendasi makanan dari kanal YouTube **Boengkoes Network**. Aplikasi ini dirancang untuk memudahkan penonton dalam menemukan lokasi persis tempat makan yang telah direview, lengkap dengan tautan video dan metadata yang relevan.

Bukan sekadar peta biasa, aplikasi ini fokus pada pengalaman "Blusukan" yang efisien dan informatif.

## ✨ Key Features

- 📍 **Real-time Map Integration**: Menggunakan Leaflet.js untuk navigasi yang ringan dan responsif.
- 🍗 **Bebek Goreng Iconography**: Icon kustom yang unik dan menggugah selera (Fresh from the pan!).
- 🤖 **Auto-Enrichment**: Mendukung ekstraksi koordinat otomatis dari Google Maps short links via Supabase Edge Functions.
- 📱 **PWA Ready**: Dapat di-install langsung ke Home Screen HP layaknya aplikasi native.
- 🤳 **User Submission**: Form input khusus untuk kontribusi data baru dengan validasi duplikasi.
- 🎬 **YouTube Metadata Integration**: Mendapatkan informasi video secara real-time.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4.
- **Mapping**: Leaflet.js.
- **Backend & Database**: Supabase (PostgreSQL).
- **Functions**: Supabase Edge Functions (Deno).

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS)
- Supabase Account (for DB)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/FarhanAdiyasa/Boengkoes-maps.git
   cd Boengkoes-maps
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Buat file `.env` di root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Made with ❤️ for the Boengkoes community.
</div>
