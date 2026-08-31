/* ------------------------------------------------------------------
   Thin fetch wrapper for the NestJS API. No auth headers yet — sign
   in/sign up are vanilla for now, so there's no token to attach.
   ------------------------------------------------------------------ */

import { API_BASE_URL } from '../config'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, options)
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json() : null

  if (!res.ok) {
    throw new Error(body?.message || `Request failed (${res.status})`)
  }

  return body
}

export function postJson(path, data) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function postForm(path, formData) {
  return request(path, { method: 'POST', body: formData })
}

export function getJson(path) {
  return request(path)
}

export function putJson(path, data) {
  return request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function deleteJson(path) {
  return request(path, { method: 'DELETE' })
}
