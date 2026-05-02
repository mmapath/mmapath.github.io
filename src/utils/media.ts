export function isValidUrl(url) {
  try {
    new URL(url)
    return /^https?:\/\/.+/.test(url)
  } catch {
    return false
  }
}

export function isYouTubeUrl(url) {
  if (!url) return false
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/
  ]
  return patterns.some(p => p.test(url))
}

export function extractYouTubeVideoId(url) {
  if (!url) return null
  let match = url.match(/youtube\.com\/watch\?v=([\w-]+)/)
  if (match) return match[1]
  match = url.match(/youtube\.com\/shorts\/([\w-]+)/)
  if (match) return match[1]
  match = url.match(/youtu\.be\/([\w-]+)/)
  if (match) return match[1]
  match = url.match(/youtube\.com\/embed\/([\w-]+)/)
  if (match) return match[1]
  return null
}

export function getYouTubeEmbedUrl(url) {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}`
}

export function isInstagramUrl(url) {
  if (!url) return false
  const patterns = [
    /^https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+\/?/,
    /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+\/?/,
    /^https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+\/?/,
    /^https?:\/\/instagram\.com\/reel\/[\w-]+\/?/,
    /^https?:\/\/instagram\.com\/p\/[\w-]+\/?/,
    /^https?:\/\/instagram\.com\/tv\/[\w-]+\/?/
  ]
  return patterns.some(p => p.test(url))
}

export function extractInstagramShortcode(url) {
  if (!url) return null
  let match = url.match(/instagram\.com\/reel\/([\w-]+)/)
  if (match) return match[1]
  match = url.match(/instagram\.com\/p\/([\w-]+)/)
  if (match) return match[1]
  match = url.match(/instagram\.com\/tv\/([\w-]+)/)
  if (match) return match[1]
  return null
}

export function getInstagramEmbedUrl(url) {
  const shortcode = extractInstagramShortcode(url)
  if (!shortcode) return null
  if (url.includes('/reel/')) return `https://www.instagram.com/reel/${shortcode}/embed`
  if (url.includes('/p/')) return `https://www.instagram.com/p/${shortcode}/embed`
  if (url.includes('/tv/')) return `https://www.instagram.com/tv/${shortcode}/embed`
  return `https://www.instagram.com/reel/${shortcode}/embed`
}

export function isTikTokUrl(url) {
  if (!url) return false
  const patterns = [
    /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
    /^https?:\/\/vm\.tiktok\.com\/[\w-]+/,
    /^https?:\/\/vt\.tiktok\.com\/[\w-]+/,
    /^https?:\/\/(www\.)?tiktok\.com\/embed\/v2\/[\w-]+/
  ]
  return patterns.some(p => p.test(url))
}

export function extractTikTokVideoId(url) {
  if (!url) return null
  let match = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/)
  if (match) return match[1]
  match = url.match(/tiktok\.com\/embed\/v2\/([\w-]+)/)
  if (match) return match[1]
  return null
}

export function getTikTokEmbedUrl(url) {
  const videoId = extractTikTokVideoId(url)
  if (!videoId) return null
  return `https://www.tiktok.com/embed/v2/${videoId}`
}

export function detectMediaProvider(url) {
  if (!url || !isValidUrl(url)) return 'direct'
  
  if (isYouTubeUrl(url)) return 'youtube'
  if (isInstagramUrl(url)) return 'instagram'
  if (isTikTokUrl(url)) return 'tiktok'
  
  const urlLower = url.toLowerCase()
  if (/\.(mp4|webm|mov|avi|m4v)(\?.*)?$/.test(urlLower)) return 'direct'
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/.test(urlLower)) return 'direct'
  
  return 'direct'
}

export function getMediaType(url, selectedType) {
  if (selectedType === 'image') return 'image'
  if (isYouTubeUrl(url) || isInstagramUrl(url) || isTikTokUrl(url)) return 'video'
  
  const urlLower = (url || '').toLowerCase()
  if (/\.(mp4|webm|mov|avi|m4v)(\?.*)?$/.test(urlLower)) return 'video'
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/.test(urlLower)) return 'image'
  
  return selectedType || 'image'
}

export function getProviderBadge(provider) {
  const badges = {
    youtube: 'YouTube',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    direct: 'Direct'
  }
  return badges[provider] || 'Direct'
}