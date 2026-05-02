export const userData = {
  name: 'Fighter',
  goal: 'Profesyonel MMA Dövüşçüsü',
  goalProgress: 68,
  streak: 12,
  totalTrainingHours: 32,
  techniqueCount: 128,
  sparringRounds: 24,
};

export const navItems = [
  { id: 'ana-sayfa', label: 'Ana Sayfa', icon: 'Home' },
  // { id: 'path', label: 'Path', icon: 'Map' },
  { id: 'antrenmanlar', label: 'Antrenmanlar', icon: 'Dumbbell' },
  { id: 'teknikler', label: 'Teknikler', icon: 'Box' },
  { id: 'sparring', label: 'Sparring', icon: 'Users' },
  { id: 'ilerleme', label: 'İlerleme', icon: 'TrendingUp' },
  { id: 'mac-analizi', label: 'Maç Analizi', icon: 'Video' },
  { id: 'beslenme', label: 'Beslenme', icon: 'Apple' },
  { id: 'topluluk', label: 'Topluluk', icon: 'Users' },
  { id: 'ayarlar', label: 'Ayarlar', icon: 'Settings' },
];

export const pathStages = [
  { id: 1, name: 'Temel', progress: 100, status: 'completed' },
  { id: 2, name: 'Striking', progress: 60, status: 'active' },
  { id: 3, name: 'Grappling', progress: 0, status: 'locked' },
  { id: 4, name: 'Fight IQ', progress: 0, status: 'locked' },
  { id: 5, name: 'Şampiyon', progress: 0, status: 'locked' },
];

export const currentStage = {
  id: 2,
  name: 'Striking',
  description: 'Duruş, yumruk teknikleri, tekme teknikleri ve kombinasyonlar üzerine odaklan.',
};

export const lessons = [
  {
    id: '2.1',
    title: 'Duruş ve Mesafe',
    description: 'MMA\'da doğru duruş pozisyonu ve mesafe yönetimi. Dövüşçünün temel duruş açısı, ayak pozisyonu ve savunma pozisyonları.',
    progress: 100,
    status: 'completed',
    duration: '20 dk',
  },
  {
    id: '2.2',
    title: 'Yumruk Teknikleri',
    description: 'Jab, cross, hook ve uppercut teknikleri. Doğru form, güç üretimi ve kombinasyonlar.',
    progress: 60,
    status: 'active',
    duration: '35 dk',
  },
  {
    id: '2.3',
    title: 'Tekme Teknikleri',
    description: 'Low kick, mid kick, high kick ve teqwan teknikleri. Yumrukla kombinasyonlar ve tekmeli saldırılar.',
    progress: 0,
    status: 'locked',
    duration: '40 dk',
  },
  {
    id: '2.4',
    title: 'Kombinasyonlar',
    description: 'Temel ve ileri düzey saldırı kombinasyonları. Settişme,Counter ve kombo dövüş stratejileri.',
    progress: 0,
    status: 'locked',
    duration: '45 dk',
  },
];

export const dailyGoals = [
  { id: 1, text: '1 antrenmanını tamamla', completed: false },
  { id: 2, text: '1 teknik çalış', completed: false },
  { id: 3, text: '10 dakika esneme yap', completed: false },
];

export const lastTraining = {
  name: 'Striking',
  focus: 'Yumruk Kombinasyonları',
  duration: '45 dk',
  date: 'Bugün',
};

export const calendarDays = [
  { day: 1, status: 'completed' },
  { day: 2, status: 'completed' },
  { day: 3, status: 'completed' },
  { day: 4, status: 'completed' },
  { day: 5, status: 'rest' },
  { day: 6, status: 'completed' },
  { day: 7, status: 'completed' },
  { day: 8, status: 'completed' },
  { day: 9, status: 'rest' },
  { day: 10, status: 'completed' },
  { day: 11, status: 'completed' },
  { day: 12, status: 'completed' },
  { day: 13, status: 'completed' },
  { day: 14, status: 'rest' },
  { day: 15, status: 'completed' },
  { day: 16, status: 'completed' },
  { day: 17, status: 'completed' },
  { day: 18, status: 'completed' },
  { day: 19, status: 'rest' },
  { day: 20, status: 'completed' },
  { day: 21, status: 'completed' },
  { day: 22, status: 'completed' },
  { day: 23, status: null },
  { day: 24, status: null },
  { day: 25, status: null },
  { day: 26, status: null },
  { day: 27, status: null },
  { day: 28, status: null },
  { day: 29, status: null },
  { day: 30, status: null },
];

export const monthlyLabels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];