# MMA PATH - MMA Eğitim Platformu

Modern ve premium bir MMA eğitim platformu dashboard'u.

## Teknolojiler

- React 18 + Vite
- Tailwind CSS
- react-router-dom v6
- Firebase Authentication v9
- localStorage (progress verileri)

## Kurulum

```bash
cd mma-path
npm install
npm run dev
```

## Routes

- `/login` - Giriş sayfası
- `/register` - Kayıt sayfası
- `/forgot-password` - Şifremi unuttum
- `/dashboard` - Ana sayfa (varsayılan)
- `/path` - Eğitim path
- `/workouts` - Antrenmanlar
- `/techniques` - Teknikler
- `/progress` - İlerleme
- `/settings` - Profil ayarları

## Özellikler

### Firebase Kimlik Doğrulama
- Kayıt ol (email/password)
- Giriş yap
- Soft email doğrulama
- Şifre sıfırlama
- Oturum kalıcılığı (browser refresh'te korunur)

### Email Doğrulama
- Kayıt sonrası otomatik doğrulama maili gönderimi
- Doğrulanmamış kullanıcılar için uyarı banner'ı
- "Doğrulama mailini tekrar gönder" butonu

### Dashboard Fonksiyonellik
- Ders tamamlama → sonraki dersi aç
- Antrenman tamamlama → süre ve sayı güncelleme
- Teknik işaretleme → sayı güncelleme
- localStorage'da progress kalıcılığı

## Not

- Firebase SADECE kimlik doğrulama için kullanılır.
- Ders/workout/technique progress localStorage'da saklanır.
- Gerçek güvenlik için Firebase kuralları yapılandırılmalıdır.

## Proje Yapısı

```
mma-path/
├── src/
│   ├── components/
│   │   ├── AppLayout.jsx
│   │   ├── Header.jsx
│   │   ├── PathProgress.jsx
│   │   ├── LessonList.jsx
│   │   ├── RightPanel.jsx
│   │   ├── Sidebar.jsx
│   │   └── VerificationBanner.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── firebase/
│   │   └── firebase.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Login.jsx
│   │   ├── Path.jsx
│   │   ├── Progress.jsx
│   │   ├── Register.jsx
│   │   ├── Settings.jsx
│   │   ├── Techniques.jsx
│   │   └── Workouts.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   ├── utils/
│   │   └── storage.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
```