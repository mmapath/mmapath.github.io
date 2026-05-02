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
  { id: 'path', label: 'Path', icon: 'Map' },
  { id: 'antrenmanlar', label: 'Antrenmanlar', icon: 'Dumbbell' },
  { id: 'teknikler', label: 'Teknikler', icon: 'Box' },
  { id: 'ilerleme', label: 'İlerleme', icon: 'TrendingUp' },
  { id: 'profil', label: 'Profil', icon: 'User' },
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

export const workouts = [
  {
    id: 'striking-drill',
    title: 'Striking Drill',
    description: 'Yumruk ve tekme kombinasyonları çalışmas��',
    duration: 30,
    difficulty: 'Orta',
    focus: 'Striking',
  },
  {
    id: 'grappling-drill',
    title: 'Grappling Drill',
    description: 'Yerde mücadele ve savunma teknikleri',
    duration: 45,
    difficulty: 'İleri',
    focus: 'Grappling',
  },
  {
    id: 'conditioning',
    title: 'Conditioning',
    description: 'Kardiyo ve dayanıklılık antrenmanı',
    duration: 20,
    difficulty: 'Başlangıç',
    focus: 'Kondition',
  },
  {
    id: 'mobility',
    title: 'Mobility',
    description: 'Esneme ve mobilite çalışması',
    duration: 15,
    difficulty: 'Başlangıç',
    focus: 'Mobility',
  },
];

export const techniques = [
  { id: 'jab', title: 'Jab', category: 'Striking', difficulty: 'Başlangıç', explanation: 'Önden direkt yumruk' },
  { id: 'cross', title: 'Cross', category: 'Striking', difficulty: 'Başlangıç', explanation: 'Arka kol direkt yumruk' },
  { id: 'hook', title: 'Hook', category: 'Striking', difficulty: 'Orta', explanation: 'Yan yumruk' },
  { id: 'uppercut', title: 'Uppercut', category: 'Striking', difficulty: 'Orta', explanation: 'Yukarı yumruk' },
  { id: 'low-kick', title: 'Low Kick', category: 'Striking', difficulty: 'Orta', explanation: 'Alttan tekme' },
  { id: 'body-kick', title: 'Body Kick', category: 'Striking', difficulty: 'İleri', explanation: 'Gövde tekmesi' },
  { id: 'high-kick', title: 'High Kick', category: 'Striking', difficulty: 'İleri', explanation: 'Yüksek tekme' },
  { id: 'guillotine', title: 'Guillotine', category: 'Grappling', difficulty: 'Başlangıç', explanation: 'Boyun boğaz kilidi' },
  { id: 'rear-naked', title: 'Rear Naked Choke', category: 'Grappling', difficulty: 'Orta', explanation: 'Arka taraf sıkma' },
  { id: 'armbar', title: 'Armbar', category: 'Grappling', difficulty: 'Orta', explanation: 'Kol kilidi' },
  { id: 'triangle', title: 'Triangle Choke', category: 'Grappling', difficulty: 'İleri', explanation: 'Üçgen kilit' },
  { id: 'takedown', title: 'Single Leg Takedown', category: 'Wrestling', difficulty: 'Orta', explanation: 'Tek bacak alma' },
  { id: 'double-leg', title: 'Double Leg Takedown', category: 'Wrestling', difficulty: 'İleri', explanation: 'Çift bacak alma' },
  { id: ' sprawl', title: 'Sprawl', category: 'Defense', difficulty: 'Başlangıç', explanation: 'Yere düşme savunması' },
  { id: 'guard', title: 'Closed Guard', category: 'Grappling', difficulty: 'Orta', explanation: 'Kapalı gard pozisyonu' },
  { id: 'mount', title: 'Mount', category: 'Grappling', difficulty: 'Başlangıç', explanation: 'Üst pozisyon' },
  { id: 'back-mount', title: 'Back Mount', category: 'Grappling', difficulty: 'Orta', explanation: 'Sırt pozisyonu' },
  { id: 'side-control', title: 'Side Control', category: 'Grappling', difficulty: 'Başlangıç', explanation: 'Yan kontrol' },
];

export const experienceLevels = [
  { value: 'Beginner', label: 'Başlangıç' },
  { value: 'Intermediate', label: 'Orta' },
  { value: 'Advanced', label: 'İleri' },
];

export const goalOptions = [
  'Profesyonel MMA Dövüşçüsü',
  'Amatör Dövüşçü',
  'Fitness için',
  'Öz Savunma',
  'Spor olarak',
];