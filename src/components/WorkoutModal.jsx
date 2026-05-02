import { useState } from 'react'
import { X, Play, CheckCircle, Clock, Zap } from 'lucide-react'

function WorkoutModal({ workout, onClose, onComplete }) {
  const [checklist, setChecklist] = useState({
    watched: false,
    practiced: false,
    noted: false
  })

  const allChecked = checklist.watched && checklist.practiced && checklist.noted

  const handleCheck = (item) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg mx-4 card-premium p-6 animate-in fade-in zoom-in duration-200">
        <button 
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-mma-gray transition-colors"
          onClick={onClose}
        >
          <X className="text-gray-400" size={20} />
        </button>
        
        <div className="mb-6">
          <h2 className="font-oswald text-2xl font-bold text-white">
            {workout.title}
          </h2>
          <p className="text-gray-400 mt-1">{workout.description}</p>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Clock size={14} />
              {workout.duration} dk
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Zap size={14} />
              {workout.focus}
            </div>
          </div>
        </div>
        
        <div className="aspect-video rounded-xl bg-gradient-to-br from-mma-gray to-mma-dark mb-6 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.1),transparent_70%)]" />
          <div className="w-20 h-20 rounded-full bg-mma-red/20 flex items-center justify-center cursor-pointer hover:bg-mma-red/30 transition-colors">
            <Play className="text-mma-red ml-1" size={32} />
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-400 mb-3">Antrenmanı tamamlamak için:</p>
          
          <div 
            onClick={() => handleCheck('watched')}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              checklist.watched 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-mma-gray bg-mma-dark'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              checklist.watched ? 'bg-green-500 border-green-500' : 'border-gray-600'
            }`}>
              {checklist.watched && <CheckCircle size={12} className="text-white" />}
            </div>
            <span className={checklist.watched ? 'text-green-400' : 'text-gray-300'}>
              Antrenman videosunu izledim
            </span>
          </div>
          
          <div 
            onClick={() => handleCheck('practiced')}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              checklist.practiced 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-mma-gray bg-mma-dark'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              checklist.practiced ? 'bg-green-500 border-green-500' : 'border-gray-600'
            }`}>
              {checklist.practiced && <CheckCircle size={12} className="text-white" />}
            </div>
            <span className={checklist.practiced ? 'text-green-400' : 'text-gray-300'}>
              Antrenmanı tamamladyım
            </span>
          </div>
          
          <div 
            onClick={() => handleCheck('noted')}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              checklist.noted 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-mma-gray bg-mma-dark'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              checklist.noted ? 'bg-green-500 border-green-500' : 'border-gray-600'
            }`}>
              {checklist.noted && <CheckCircle size={12} className="text-white" />}
            </div>
            <span className={checklist.noted ? 'text-green-400' : 'text-gray-300'}>
              Not aldım
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            className={`flex-1 btn-primary flex items-center justify-center gap-2 ${!allChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={allChecked ? onComplete : undefined}
            disabled={!allChecked}
          >
            <CheckCircle size={18} />
            Antrenmanı Tamamla
          </button>
          <button 
            className="px-6 py-3 rounded-xl border border-mma-gray text-gray-400 hover:text-white hover:border-mma-light-gray transition-colors"
            onClick={onClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}

export default WorkoutModal