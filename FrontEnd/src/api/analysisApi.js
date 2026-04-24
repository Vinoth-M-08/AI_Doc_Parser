import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
})

export async function analyzeDocument(file, { useAi, model, onProgress } = {}) {
  const formData = new FormData()
  formData.append('file', file)

  const params = {}
  if (typeof useAi === 'boolean') params.useAi = useAi
  if (model) params.model = model

  const { data } = await client.post('/api/analyze', formData, {
    params,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total))
      }
    },
  })
  return data
}

export async function getSettings() {
  const { data } = await client.get('/api/settings')
  return data
}

export async function ping() {
  const { data } = await client.get('/api/health')
  return data
}
