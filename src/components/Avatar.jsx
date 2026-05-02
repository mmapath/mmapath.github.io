import { useState } from 'react'

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const [error, setError] = useState(false)
  const initial = name?.[0]?.toUpperCase() || '?'
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl'
  }
  
  if (src && !error) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onError={() => setError(true)}
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover bg-mma-charcoal ${className}`}
      />
    )
  }

  return (
    <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-mma-red flex items-center justify-center text-white font-bold ${className}`}>
      {initial}
    </div>
  )
}