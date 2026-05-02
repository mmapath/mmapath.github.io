import { Play, Check, Lock, Clock } from 'lucide-react'

function LessonList({ currentStage, lessons, onLessonSelect }) {
  return (
    <div className="card-premium p-6">
      <div className="mb-6">
        <h3 className="font-oswald text-xl font-bold text-white mb-2">
          Şu Anki Aşama: {currentStage.name}
        </h3>
        <p className="text-gray-400 text-sm">{currentStage.description}</p>
      </div>

      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`lesson-row ${lesson.status === 'active' ? 'active' : ''} ${lesson.status === 'completed' ? 'completed' : ''} ${lesson.status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => onLessonSelect(lesson)}
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-mma-gray to-mma-dark flex items-center justify-center flex-shrink-0">
              {lesson.status === 'completed' ? (
                <Check className="text-green-500" size={24} />
              ) : lesson.status === 'active' ? (
                <Play className="text-mma-red" size={24} />
              ) : (
                <Lock className="text-gray-500" size={24} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">{lesson.id}</span>
                <h4 className="text-white font-medium truncate">{lesson.title}</h4>
              </div>
              <p className="text-sm text-gray-400 line-clamp-2">{lesson.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Clock size={12} className="text-gray-500" />
                <span className="text-xs text-gray-500">{lesson.duration}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {lesson.status !== 'locked' && (
                <>
                  <div className="w-24 h-2 bg-mma-gray rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        lesson.status === 'completed' 
                          ? 'bg-green-500' 
                          : 'bg-gradient-to-r from-mma-red to-mma-red-light'
                      }`}
                      style={{ width: `${lesson.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{lesson.progress}%</span>
                </>
              )}
              {lesson.status === 'active' && (
                <button className="btn-primary py-2 px-4 text-sm">
                  Devam Et
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LessonList