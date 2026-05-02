import { Check } from 'lucide-react'

function PathProgress({ stages }) {
  return (
    <div className="card-premium p-6">
      <h3 className="font-oswald text-xl font-bold text-white mb-6">Path İlerlemen</h3>
      
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-mma-gray -z-10" />
        
        <div 
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-mma-red to-mma-red-light -z-10 transition-all duration-500"
          style={{ width: '37.5%' }}
        />
        
        {stages.map((stage, index) => {
          const getStatus = () => {
            if (stage.status === 'completed') return 'completed'
            if (stage.status === 'active') return 'active'
            return 'locked'
          }
          
          const status = getStatus()
          
          return (
            <div key={stage.id} className="flex flex-col items-center">
              <div className={`progress-step ${status}`}>
                {stage.status === 'completed' ? (
                  <Check size={20} />
                ) : (
                  stage.id
                )}
              </div>
              
              <div className="mt-3 text-center">
                <p className={`text-sm font-medium ${status === 'locked' ? 'text-gray-500' : 'text-white'}`}>
                  {stage.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stage.progress}%
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PathProgress