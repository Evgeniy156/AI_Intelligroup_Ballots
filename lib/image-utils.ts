const MAX_DIMENSION = 1600

export function resizeImageBase64(base64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      let { width, height } = img

      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        resolve(base64)
        return
      }

      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, width, height)

      const resized = canvas.toDataURL("image/jpeg", 0.85)
      canvas.width = 0
      canvas.height = 0
      resolve(resized)
    }
    img.onerror = reject
    img.src = base64
  })
}

export function stripBase64Header(base64: string): string {
  const idx = base64.indexOf(",")
  return idx >= 0 ? base64.substring(idx + 1) : base64
}
