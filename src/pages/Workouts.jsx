import { useState, useEffect } from 'react'
import { Clock, Zap, Play, ArrowLeft, Dumbbell, Hand, Box, Footprints, X, Youtube, Video } from 'lucide-react'
import { getCurrentUser, updateUserData } from '../utils/storage'

function getYoutubeEmbedUrl(url) {
  if (!url) return ''
  const videoId = url.split('v=')[1]?.split('&')[0]
  return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
}

const workoutCategories = [
  {
    id: 'striking',
    title: 'Striking',
    description: ' Yumruk, tekme, dirsek ve diz teknikleri ile saldırı becerilerini geliştir.',
    icon: <Box size={32} />,
    styleCount: 4,
    styles: [
      {
        id: 'boks',
        title: 'Boks',
        description: 'Nakit teknikleri ve kombinasyonlar.',
        focusAreas: ['Footwork', 'Head movement', 'Punch combinations'],
        difficulty: 'Orta',
        techniques: [
          { id: 'jab', title: 'Jab', description: 'Sol direk, mesafe kontrolü için temel vuruş.', youtubeUrl: 'https://www.youtube.com/watch?v=kzzZcyUFyfk' },
          { id: 'cross', title: 'Cross', description: 'Sağ direk, en güçlü vuruş.', youtubeUrl: 'https://www.youtube.com/watch?v=h6mcWRalYDY' },
          { id: 'lead_hook', title: 'Lead Hook', description: 'Ön elleyan vuruş.', youtubeUrl: 'https://www.youtube.com/watch?v=_WIPhBIgNik' },
          { id: 'rear_hook', title: 'Rear Hook', description: 'Arka elleyan vuruş.', youtubeUrl: 'https://www.youtube.com/watch?v=MJmHnyBjC6s' },
          { id: 'lead_uppercut', title: 'Lead Uppercut', description: 'Ön elle yukarı doğru vuruş, alt seviye.', youtubeUrl: 'https://www.youtube.com/watch?v=zl2bZwxM_ws' },
          { id: 'rear_uppercut', title: 'Rear Uppercut', description: 'Arka elle yukarı doğru vuruş, alt seviye.', youtubeUrl: 'https://www.youtube.com/watch?v=iInkodqd5pE' },
          { id: 'roll', title: 'Roll', description: 'Vücut hareketi ile savunma.', youtubeUrl: 'https://www.youtube.com/watch?v=XIja1S9SXI4' },
        ],
        workouts: [
          { id: 'jab-cross', title: 'Jab-Cross Fundamentals', duration: 20, difficulty: 'Başlangıç', equipment: 'İp', focus: 'Nakit kombinasyonu', steps: ['Isınma', 'Jab-Cross tekrarı', 'Hız artırma', 'Soğuma'] },
          { id: 'slip-counter', title: 'Slip & Counter Drill', duration: 25, difficulty: 'Orta', equipment: 'Miss', focus: 'Karşı atak', steps: ['Isınma', 'Slip egzersizleri', 'Counter vuruş', 'Kombinasyon', 'Soğuma'] },
          { id: 'footwork', title: 'Footwork Ladder', duration: 15, difficulty: 'Orta', equipment: 'Merdivensiz', focus: 'Ayak işi', steps: ['Isınma', 'İleri-geri', 'Yan movement', 'Angling', 'Soğuma'] },
          { id: 'shadow', title: '3-Round Shadow Boxing', duration: 30, difficulty: 'Orta', equipment: 'Yok', focus: 'Kombinasyon', steps: ['1. round', '2. round', '3. round', 'Soğuma'] },
        ]
      },
      {
        id: 'kick-boks',
        title: 'Kick Boks',
        description: 'Nakit ve tekme kombinasyonları.',
        focusAreas: ['Punch-kick combinations', 'Distance control', 'Defense'],
        difficulty: 'Orta',
        techniques: [
          { id: 'teep', title: 'Teep (Push Kick)', description: 'İleri itme tekmesi, mesafe kontrolü.', youtubeUrl: 'https://www.youtube.com/watch?v=xoxnkg_poU8' },
          { id: 'roundhouse', title: 'Roundhouse Kick', description: 'Yuvarlak tekme, ana tekme.', youtubeUrl: 'https://www.youtube.com/watch?v=sOPFUfXpxVI' },
          { id: 'low-kick', title: 'Low Kick', description: 'Bacak tekmesi, soğukta etkili.', youtubeUrl: 'https://www.youtube.com/watch?v=k4flqVlub6c' },
          { id: 'body-kick', title: 'Body Kick', description: 'Gövde tekmesi, koruma.', youtubeUrl: 'https://www.youtube.com/watch?v=S2I5O92wXpI' },
          { id: 'switch-kick', title: 'Switch Kick', description: 'Ayak değiştirme tekmesi.', youtubeUrl: 'https://www.youtube.com/watch?v=uG886ObWwU4' },
          { id: 'leg-check', title: 'Leg Check', description: 'Bacak savunması, tekme engelleme.', youtubeUrl: 'https://www.youtube.com/watch?v=onf6qfSOxB8' },
        ],
        workouts: [
          { id: 'punch-kick', title: 'Punch-Kick Combinations', duration: 25, difficulty: 'Orta', equipment: 'İp', focus: 'Kombinasyon', steps: ['Isınma', 'Jab-tep', 'Cross-tep', 'Ayak tekniği', 'Soğuma'] },
          { id: 'distance', title: 'Distance Control Drill', duration: 20, difficulty: 'İleri', equipment: 'İp', focus: 'Mesafe', steps: ['Isınma', 'İleri adım', 'Gerí adım', 'Angle çıkış', 'Soğuma'] },
          { id: 'defense', title: 'Kick Defense', duration: 20, difficulty: 'Orta', equipment: 'X', focus: 'Savunma', steps: ['Blocking', 'Check', 'Catch', 'Counter', 'Soğuma'] },
        ]
      },
      {
        id: 'muay-thai',
        title: 'Muay Thai',
        description: 'THAI boksu teknikleri: clinch, dirsek, diz.',
        focusAreas: ['Clinch', 'Elbows', 'Knees', 'Low kicks'],
        difficulty: 'İleri',
        techniques: [
          { id: 'clinch', title: 'Clinch', description: 'Kucaklaşma pozisyonu, kontrol.', youtubeUrl: 'https://www.youtube.com/watch?v=SD2PvP-jVds' },
          { id: 'knee', title: 'Knee Strike', description: 'Diz vuruşu, clinch içi.', youtubeUrl: 'https://www.youtube.com/watch?v=-9GdYh_YoJo' },
          { id: 'elbow', title: 'Elbow Strike', description: 'Dirsek vuruşu, kesme.', youtubeUrl: 'https://www.youtube.com/watch?v=XxwrVK1z1go' },
          { id: 'sweep', title: 'Sweep', description: 'Ayak alma, denge bozma.', youtubeUrl: 'https://www.youtube.com/watch?v=HsDWAS2YqJs' },
        ],
        workouts: [
          { id: 'low-kick', title: 'Low Kick Setup', duration: 25, difficulty: 'Orta', equipment: 'X', focus: 'Low kick', steps: ['Isınma', 'Kick-setup-combo', 'Sweep', 'Tekrar', 'Soğuma'] },
          { id: 'teep', title: 'Teep Control', duration: 20, difficulty: 'Orta', equipment: 'X', focus: 'Teep', steps: ['Isınma', 'Teep-atış', 'Mesafe kontrol', 'Savunma', 'Soğuma'] },
          { id: 'clinch-knees', title: 'Clinch Knees', duration: 25, difficulty: 'İleri', equipment: 'X', focus: 'Clinch', steps: ['Clinch pozisyonu', 'Diz tekniği', 'Kaçış', 'Tekrar', 'Soğuma'] },
          { id: 'elbow', title: 'Elbow Entry Drill', duration: 20, difficulty: 'İleri', equipment: 'X', focus: 'Dirsek', steps: ['Yaklaşma', 'Elbow mesafesi', 'Teknik', 'Kombo', 'Soğuma'] },
        ]
      },
      {
        id: 'taekwondo',
        title: 'Taekwondo',
        description: 'Tekme ağırlıklı spor.',
        focusAreas: ['Kicks', 'Speed', 'Range control'],
        difficulty: 'Başlangıç',
        techniques: [
          { id: 'roundhouse-tkd', title: 'Roundhouse (Dollyo Chagi)', description: 'Temel yuvarlak tekme.', youtubeUrl: 'https://www.youtube.com/watch?v=NAzzpTtQE50' },
          { id: 'push-tkd', title: 'Front Kick (Ap Chagi)', description: 'Öne tekme.', youtubeUrl: 'https://www.youtube.com/watch?v=BSUPraGS_vo' },
          { id: 'side-tkd', title: 'Side Kick (Yop Chagi)', description: 'Yan tekme, güç.', youtubeUrl: 'https://www.youtube.com/watch?v=wrNWrXh7wU8' },
          { id: 'back-kick', title: 'Back Kick (Dwi Huryeo Chagi)', description: 'Geri tekme.', youtubeUrl: 'https://www.youtube.com/watch?v=MR2g6zOEicw' },
          { id: 'tornado-kick', title: 'Tornado Kick', description: 'Dönerek tekme.', youtubeUrl: 'https://www.youtube.com/watch?v=Y1rmsLtq96Y' },
          { id: 'hook-kick', title: 'Hook Kick', description: 'Kanca tekmesi.', youtubeUrl: 'https://www.youtube.com/watch?v=BJPs2vUER74' },
        ],
        workouts: [
          { id: 'kick-speed', title: 'Roundhouse Speed', duration: 15, difficulty: 'Başlangıç', equipment: 'X', focus: 'Tekme hızı', steps: ['Isınma', 'Tekme tekrarı', 'Hız artırma', 'Soğuma'] },
          { id: 'push-kick', title: 'Push Kick Control', duration: 20, difficulty: 'Orta', equipment: 'X', focus: 'Mesafe', steps: ['Isınma', 'Push-tep', 'Mesafe ayarı', 'Counter', 'Soğuma'] },
          { id: 'spinning', title: 'Spinning Kick Basics', duration: 25, difficulty: 'İleri', equipment: 'X', focus: 'Dönüş tekniği', steps: ['Isınma', 'Spin setup', 'Tek tekme', 'Kombo', 'Soğuma'] },
        ]
      },
    ]
  },
  {
    id: 'grappling',
    title: 'Grappling',
    description: 'Güreş, BJJ ve Judo teknikleri ile yerde ve ayakta mücadele.',
    icon: <Hand size={32} />,
    styleCount: 5,
    styles: [
      {
        id: 'gures',
        title: 'Güreş',
        description: 'Ayakta güreş ve serbest stil.',
        focusAreas: ['Takedown', 'Scramble', 'Control'],
        difficulty: 'İleri',
        techniques: [
          { id: 'double-leg', title: 'Double Leg Takedown', description: 'İki bacak alma, temel alma.', youtubeUrl: 'https://www.youtube.com?v=3g6L8r6g9jU' },
          { id: 'single-leg', title: 'Single Leg Pick', description: 'Tek bacak alma.', youtubeUrl: 'https://www.youtube.com?v=2L5i6K9r8tY' },
          { id: 'sprawl', title: 'Sprawl', description: 'Ayağa kalkma savunması.', youtubeUrl: 'https://www.youtube.com?v=8f9lK0s4m7X' },
          { id: 'snap-down', title: 'Snap Down', description: 'Baş çekme, yere alma.', youtubeUrl: 'https://www.youtube.com?v=1g4L8r9k6hY' },
          { id: 'underhook', title: 'Underhook', description: 'Kol altına girme.', youtubeUrl: 'https://www.youtube.com?v=4r7hL6s3k8Z' },
          { id: 'gut-wrench', title: 'Gut Wrench', description: 'Karın germe, ters alma.', youtubeUrl: 'https://www.youtube.com?v=5s8mK1t2j9A' },
        ],
        workouts: [
          { id: 'double-leg', title: 'Double Leg Entries', duration: 25, difficulty: 'Orta', equipment: 'X', focus: 'Alçak', steps: ['Isınma', 'Penetrasyon', 'Ele geçirme', 'Kontrol', 'Soğuma'] },
          { id: 'sprawl', title: 'Sprawl Reaction', duration: 20, difficulty: 'Orta', equipment: 'X', focus: 'Savunma', steps: ['Isınma', 'Sprawl', 'Hip sweep', 'Tekrar', 'Soğuma'] },
          { id: 'chain-wrestle', title: 'Chain Wrestling Drill', duration: 30, difficulty: 'İleri', equipment: 'X', focus: 'Zincirleme', steps: ['Isınma', 'Takedown giriş', 'Scramble', 'Tekrar', 'Soğuma'] },
          { id: 'wall-wrestle', title: 'Wall Wrestling Control', duration: 20, difficulty: 'İleri', equipment: 'Duvar', focus: 'Duvar kontrolü', steps: ['Isınma', 'Duvar pozisyonu', 'Kontrol', 'Tekrar', 'Soğuma'] },
        ]
      },
      {
        id: 'no-gi-bjj',
        title: 'No-Gi BJJ',
        description: 'Kimono olmadan BJJ.',
        focusAreas: ['Submissions', 'Guard passing', 'Leg locks'],
        difficulty: 'Orta',
        techniques: [
          { id: 'rear-naked', title: 'Rear Naked Choke', description: 'Arkadan boğaz kelepçesi.', youtubeUrl: 'https://www.youtube.com?v=6g8L9r4k2hY' },
          { id: 'guillotine', title: 'Guillotine Choke', description: 'Boyun kelepçesi.', youtubeUrl: 'https://www.youtube.com?v=3f7hK5t1j8U' },
          { id: 'triangle', title: 'Triangle Choke', description: 'Üçgen boğaz.', youtubeUrl: 'https://www.youtube.com?v=8s5L9r3k4X' },
          { id: 'armbar', title: 'Armbar', description: 'Kol kilidi, dirsek.', youtubeUrl: 'https://www.youtube.com?v=2s8L7r4m9gZ' },
          { id: 'omoplata', title: 'Omoplata', description: 'Kol ters kilit.', youtubeUrl: 'https://www.youtube.com?v=5t9L8r3k2Y' },
          { id: 'leg-lock', title: 'Leg Lock', description: 'Bacak kilidi.', youtubeUrl: 'https://www.youtube.com?v=4r8L5s2k3X' },
        ],
        workouts: [
          { id: 'guard-pass', title: 'Guard Passing Basics', duration: 25, difficulty: 'Orta', equipment: 'X', focus: 'Guard geçme', steps: ['Isınma', 'Pass tekniği', 'Pressure', 'Tekrar', 'Soğuma'] },
          { id: 'back-take', title: 'Back Take Chain', duration: 30, difficulty: 'İleri', equipment: 'X', focus: 'Sırt alma', steps: ['Isınma', 'Back kontrol', 'Teknik', 'Submission giriş', 'Soğuma'] },
          { id: 'sub-def', title: 'Submission Defense', duration: 20, difficulty: 'İleri', equipment: 'X', focus: 'Savunma', steps: ['Pozisyon', 'Frame', 'Kaçış', 'Tekrar', 'Soğuma'] },
          { id: 'leg-lock', title: 'Leg Lock Awareness', duration: 25, difficulty: 'İleri', equipment: 'X', focus: 'Leg lock', steps: ['Isınma', 'Pozisyon', 'Teknik', 'Savunma', 'Soğuma'] },
        ]
      },
      {
        id: 'gi-bjj',
        title: 'Gi BJJ',
        description: 'Gi ile BJJ teknikleri.',
        focusAreas: ['Grip fighting', 'Guard', 'Sweeps'],
        difficulty: 'Orta',
        techniques: [
          { id: 'lapel-grip', title: 'Lapel Grip', description: 'Yaka kavrama.', youtubeUrl: 'https://www.youtube.com?v=1g7L9r4k3X' },
          { id: 'sleeve-grip', title: 'Sleeve Grip', description: 'Kol kavrama.', youtubeUrl: 'https://www.youtube.com?v=3s8L6r2k9Y' },
          { id: 'collar-pull', title: 'Collar Pull', description: 'Yaka çekme.', youtubeUrl: 'https://www.youtube.com?v=5s9L7r3k2Z' },
          { id: 'break-grip', title: 'Break Grip', description: 'Kavrama kırma.', youtubeUrl: 'https://www.youtube.com?v=8r4L8r4k1X' },
          { id: 'guard-pull', title: 'Pull to Guard', description: 'Guard\'a çekme.', youtubeUrl: 'https://www.youtube.com?v=2r8L5s3k4Y' },
          { id: 'hip-sweep', title: 'Hip Sweep', description: 'Kalça silme.', youtubeUrl: 'https://www.youtube.com?v=4r9L7s4k3X' },
        ],
        workouts: [
          { id: 'grip-fight', title: 'Grip Fighting', duration: 20, difficulty: 'Orta', equipment: 'Gi', focus: 'Kavrama', steps: ['Isınma', 'Lapel kavrama', 'Sleeve kontrol', 'Tekrar', 'Soğuma'] },
          { id: 'guard-gi', title: 'Guard Retention', duration: 25, difficulty: 'Orta', equipment: 'Gi', focus: 'Guard koruma', steps: ['Isınma', 'Guard pozisyonu', 'Teknik', 'Kaçış', 'Soğuma'] },
          { id: 'sweeps', title: 'Gi Sweeps', duration: 25, difficulty: 'İleri', equipment: 'Gi', focus: 'Sweep', steps: ['Isınma', 'Sweep seçenekleri', 'Teknik', 'Kombo', 'Soğuma'] },
        ]
      },
      {
        id: 'gi-judo',
        title: 'Gi Judo',
        description: 'Gi ile judo atışları.',
        focusAreas: ['Throws', 'Grip control', 'Kuzushi'],
        difficulty: 'İleri',
        techniques: [
          { id: 'seoi-nage', title: 'Seoi Nage', description: 'Sırt atış, temel.', youtubeUrl: 'https://www.youtube.com?v=1g8L9r5k4Y' },
          { id: 'o-goshi', title: 'O Goshi', description: 'Kalça atışı.', youtubeUrl: 'https://www.youtube.com?v=3r5L7s4k2Z' },
          { id: 'uchi-mata', title: 'Uchi Mata', description: 'İç bacak atışı.', youtubeUrl: 'https://www.youtube.com?v=8s4L7r5k3X' },
          { id: 'sasae', title: 'Sasae Tsurikomi', description: 'Ayak vuruş atış.', youtubeUrl: 'https://www.youtube.com?v=2s7L8s3k4Y' },
          { id: 'ko-uchi', title: 'Ko Uchi Gari', description: 'İç ayak süpürme.', youtubeUrl: 'https://www.youtube.com?v=4s8L9s2k5X' },
          { id: 'osoto', title: 'Osoto Gari', description: 'Dış ayak süpürme.', youtubeUrl: 'https://www.youtube.com?v=5r9L8s4k1Z' },
        ],
        workouts: [
          { id: 'throw-setup', title: 'Throw Setup', duration: 25, difficulty: 'Orta', equipment: 'Gi', focus: 'Atış', steps: ['Isınma', 'Approach', 'Kuzushi', 'Atış', 'Soğuma'] },
          { id: 'grip-judo', title: 'Grip Control', duration: 20, difficulty: 'Orta', equipment: 'Gi', focus: 'Kavrama', steps: ['Isınma', 'Lapelpull', 'Cross grip', 'Tekrar', 'Soğuma'] },
          { id: 'newaza', title: 'Newaza Basics', duration: 25, difficulty: 'Orta', equipment: 'Gi', focus: 'Yerde çalışma', steps: ['Pinzon', 'Pinzon geçme', 'Tecnik', 'Soğuma'] },
        ]
      },
      {
        id: 'no-gi-judo',
        title: 'No-Gi Judo',
        description: 'Gi olmadan judo.',
        focusAreas: ['Clinch throws', 'Trips', 'Body lock entries'],
        difficulty: 'Orta',
        techniques: [
          { id: 'hip-toss-nogi', title: 'Hip Toss (No-Gi)', description: 'Kalça atışı, no-gi.', youtubeUrl: 'https://www.youtube.com?v=3r6L8s5k4Z' },
          { id: 'sacrifice-nogi', title: 'Sacrifice Throw', description: 'Fedakar atış.', youtubeUrl: 'https://www.youtube.com?v=5r7L9s1k2Y' },
          { id: 'trip-nogi', title: 'Ashi Garami', description: 'Ayak kilitleme.', youtubeUrl: 'https://www.youtube.com?v=8s4L6s3k9X' },
          { id: 'body-lock-nogi', title: 'Body Lock', description: 'Vücut kilitleme.', youtubeUrl: 'https://www.youtube.com?v=2s8L7s4k1Y' },
          { id: 'arm-lock-nogi', title: 'Arm Lock', description: 'Kol kilitleme.', youtubeUrl: 'https://www.youtube.com?v=4s9L8s2k5X' },
          { id: ' turnover', title: 'Turn Over', description: 'Çevirme.', youtubeUrl: 'https://www.youtube.com?v=5s8L9s3k4Z' },
        ],
        workouts: [
          { id: 'clinch', title: 'Clinch Throws', duration: 25, difficulty: 'Orta', equipment: 'X', focus: 'Clinch', steps: ['Isınma', 'Clinch giriş', 'Teknik', 'Tekrar', 'Soğuma'] },
          { id: 'trips', title: 'Ashi Garami Trips', duration: 20, difficulty: 'Orta', equipment: 'X', focus: 'Trip', steps: ['Isınma', 'Trip pozisyonu', 'Teknik', 'Soğuma'] },
          { id: 'body-lock', title: 'Body Lock Entries', duration: 20, difficulty: 'İleri', equipment: 'X', focus: 'Body lock', steps: ['Isınma', 'Yaklaşma', 'Kavrama', 'Teknik', 'Soğuma'] },
        ]
      },
    ]
  },
]

export default function Workouts() {
  const [localUser, setLocalUser] = useState(null)
  const [view, setView] = useState('main')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [selectedTechnique, setSelectedTechnique] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [techniqueModalOpen, setTechniqueModalOpen] = useState(false)
  const [checklist, setChecklist] = useState({ watched: false, practiced: false, noted: false })

  useEffect(() => {
    const savedUser = getCurrentUser()
    setLocalUser(savedUser)
  }, [])

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    setView('styles')
  }

  const handleStyleClick = (style) => {
    setSelectedStyle(style)
    setView('workouts')
  }

  const handleTechniqueClick = (technique) => {
    setSelectedTechnique(technique)
    setTechniqueModalOpen(true)
  }

  const handleStart = (workout) => {
    setSelectedWorkout(workout)
    setModalOpen(true)
    setChecklist({ watched: false, practiced: false, noted: false })
  }

  const handleComplete = () => {
    if (selectedWorkout && localUser) {
      const workouts = [...(localUser.workouts || []), { 
        ...selectedWorkout, 
        completedAt: new Date().toISOString() 
      }]
      
      const totalMinutes = (localUser.progress?.totalTrainingMinutes || 0) + selectedWorkout.duration
      const completedWorkouts = (localUser.progress?.completedWorkouts || 0) + 1
      
      updateUserData(localUser.id, {
        workouts,
        progress: {
          ...localUser.progress,
          totalTrainingMinutes: totalMinutes,
          completedWorkouts
        }
      })
      
      setLocalUser(prev => ({
        ...prev,
        workouts,
        progress: {
          ...prev.progress,
          totalTrainingMinutes: totalMinutes,
          completedWorkouts
        }
      }))
      
      setModalOpen(false)
      setSelectedWorkout(null)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Başlangıç': return 'text-green-400 bg-green-500/10'
      case 'Orta': return 'text-yellow-400 bg-yellow-500/10'
      case 'İleri': return 'text-red-400 bg-red-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  const goBack = () => {
    if (view === 'workouts') {
      setView('styles')
      setSelectedStyle(null)
    } else if (view === 'styles') {
      setView('main')
      setSelectedCategory(null)
    }
  }

  const allChecked = checklist.watched && checklist.practiced && checklist.noted

  return (
    <div className="flex flex-col gap-6">
      <div className="card-premium p-6">
        <h2 className="font-oswald text-2xl font-bold text-white mb-2">Antrenmanlar</h2>
        <p className="text-gray-400">
          Stili seç ve antrenmanlara başla.
        </p>
      </div>

      {view !== 'main' && (
        <button onClick={goBack} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
          Geri
        </button>
      )}

      {view === 'main' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workoutCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="card-premium p-6 hover:border-mma-red hover:shadow-lg hover:shadow-mma-red/20 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-mma-red/20 text-mma-red">
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-oswald text-xl font-bold text-white">{category.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{category.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-gray-500 text-sm">{category.styleCount} stil</span>
                    <span className="text-mma-red text-sm font-medium">Stilleri Gör →</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {view === 'styles' && selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedCategory.styles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleClick(style)}
              className="card-premium p-5 hover:border-mma-red hover:shadow-lg hover:shadow-mma-red/20 transition-all text-left"
            >
              <h3 className="font-oswald text-lg font-bold text-white">{style.title}</h3>
              <p className="text-gray-400 text-sm mt-1 mb-3">{style.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {style.focusAreas.slice(0, 3).map((area, i) => (
                  <span key={i} className="px-2 py-1 bg-mma-dark rounded-lg text-xs text-gray-400">
                    {area}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mma-red text-sm font-medium">Antrenmanları Gör →</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {view === 'workouts' && selectedStyle && (
        <div className="space-y-6">
          <div className="card-premium p-4">
            <div className="flex items-center gap-2 mb-3">
              <Video size={20} className="text-mma-red" />
              <h3 className="font-oswald text-lg font-bold text-white">Teknikler</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {selectedStyle.techniques?.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => handleTechniqueClick(tech)}
                  className="p-3 bg-mma-dark rounded-xl hover:bg-mma-gray/50 hover:border-mma-red border border-transparent transition-all text-left"
                >
                  <h4 className="text-white text-sm font-medium truncate">{tech.title}</h4>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{tech.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell size={20} className="text-mma-red" />
              <h3 className="font-oswald text-lg font-bold text-white">Antrenmanlar</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedStyle.workouts.map((workout) => (
                <div key={workout.id} className="card-premium p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-oswald text-lg font-bold text-white">{workout.title}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs ${getDifficultyColor(workout.difficulty)}`}>
                      {workout.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {workout.duration} dk
                    </div>
                    {workout.equipment !== 'X' && (
                      <div className="flex items-center gap-1">
                        <Dumbbell size={14} />
                        {workout.equipment}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Zap size={14} />
                      {workout.focus}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStart(workout)}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Play size={18} />
                    Başlat
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {techniqueModalOpen && selectedTechnique && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTechniqueModalOpen(false)} />
          <div className="relative w-full max-w-2xl mx-4 card-premium p-6">
            <button 
              onClick={() => setTechniqueModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h2 className="font-oswald text-2xl font-bold text-white mb-2">
              {selectedTechnique.title}
            </h2>
            <p className="text-gray-400 mb-4">{selectedTechnique.description}</p>
            
            <iframe
              src={getYoutubeEmbedUrl(selectedTechnique.youtubeUrl)}
              title={selectedTechnique.title}
              className="w-full h-[400px] rounded-xl"
              allowFullScreen
            />
            
            <button 
              onClick={() => setTechniqueModalOpen(false)}
              className="mt-4 w-full btn-primary"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {modalOpen && selectedWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg mx-4 card-premium p-6">
            <h2 className="font-oswald text-2xl font-bold text-white mb-2">
              {selectedWorkout.title}
            </h2>
            <p className="text-gray-400 mb-4">{selectedWorkout.focus}</p>
            
            <div className="flex gap-4 mb-4 text-sm text-gray-400">
              <span>{selectedWorkout.duration} dk</span>
              <span>{selectedWorkout.difficulty}</span>
            </div>
            
            <div className="space-y-2 mb-4">
              {selectedWorkout.steps?.map((step, i) => (
                <div key={i} className="p-3 rounded-xl bg-mma-dark text-gray-300 text-sm">
                  {i + 1}. {step}
                </div>
              ))}
            </div>
            
            <div className="space-y-2 mb-4">
              <div 
                onClick={() => setChecklist(c => ({...c, watched: !c.watched}))}
                className={`p-3 rounded-xl border cursor-pointer ${checklist.watched ? 'border-green-500/50 bg-green-500/10' : 'border-mma-gray bg-mma-dark'}`}
              >
                <span className={checklist.watched ? 'text-green-400' : 'text-gray-300'}>
                  Videoyu izledim
                </span>
              </div>
              <div 
                onClick={() => setChecklist(c => ({...c, practiced: !c.practiced}))}
                className={`p-3 rounded-xl border cursor-pointer ${checklist.practiced ? 'border-green-500/50 bg-green-500/10' : 'border-mma-gray bg-mma-dark'}`}
              >
                <span className={checklist.practiced ? 'text-green-400' : 'text-gray-300'}>
                  Antrenmanı tamamladım
                </span>
              </div>
              <div 
                onClick={() => setChecklist(c => ({...c, noted: !c.noted}))}
                className={`p-3 rounded-xl border cursor-pointer ${checklist.noted ? 'border-green-500/50 bg-green-500/10' : 'border-mma-gray bg-mma-dark'}`}
              >
                <span className={checklist.noted ? 'text-green-400' : 'text-gray-300'}>
                  Not aldım
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleComplete}
                disabled={!allChecked}
                className={`flex-1 btn-primary ${!allChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Antrenmanı Tamamla
              </button>
              <button 
                onClick={() => setModalOpen(false)}
                className="px-6 py-3 rounded-xl border border-mma-gray text-gray-400 hover:text-white"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}