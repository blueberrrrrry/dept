/**
 * Supabase products.image_urls / image_url → 실제 표시용 URL.
 * - JSON 문자열, PostgreSQL text[] 리터럴, 객체 형태 등 방어적으로 파싱
 * - 상대 스토리지 경로는 Supabase getPublicUrl과 동일 규칙으로 조합
 */
import { supabase } from '../services/supabase'

const STORAGE_BUCKET = 'product-images' as const

export const PRODUCT_IMAGE_PLACEHOLDER =
  'https://images.unsplash.com/photo-1560472354-b33ff0c47444?auto=format&fit=crop&w=800&q=80'

/** CSS background-image 등에 넣을 때 특수문자로 깨지지 않게 */
export function cssUrlValue(imageUrl: string): string {
  const escaped = imageUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `url("${escaped}")`
}

function extractUrlsFromPostgresArrayLiteral(s: string): string[] {
  const quoted = s.match(/"((?:[^"\\]|\\.)*)"/g) || []
  const out: string[] = []
  for (const q of quoted) {
    const inner = q.slice(1, -1).replace(/\\"/g, '"').trim()
    if (inner.startsWith('http')) out.push(inner)
  }
  if (out.length) return out
  return s.match(/https?:\/\/[^,\s}"']+/g) || []
}

function pickFirstRawUrl(imageUrls: unknown): string | undefined {
  if (imageUrls == null) return undefined

  if (typeof imageUrls === 'string') {
    const t = imageUrls.trim()
    if (!t) return undefined

    if (t.startsWith('[')) {
      try {
        return pickFirstRawUrl(JSON.parse(t) as unknown)
      } catch {
        return t
      }
    }

    if (t.startsWith('{')) {
      try {
        return pickFirstRawUrl(JSON.parse(t) as unknown)
      } catch {
        if (t.endsWith('}') && t.includes('http')) {
          const fromPg = extractUrlsFromPostgresArrayLiteral(t)
          if (fromPg[0]) return fromPg[0]
        }
        return t
      }
    }

    return t
  }

  if (Array.isArray(imageUrls)) {
    for (const u of imageUrls) {
      if (u == null) continue
      if (typeof u === 'string') {
        const x = u.trim()
        if (x) return x
        continue
      }
      const nested = pickFirstRawUrl(u)
      if (nested) return nested
    }
    return undefined
  }

  if (typeof imageUrls === 'object') {
    const o = imageUrls as Record<string, unknown>
    if (typeof o.url === 'string' && o.url.trim()) return o.url.trim()
    if (typeof o.src === 'string' && o.src.trim()) return o.src.trim()
    const keys = Object.keys(o).sort((a, b) => {
      const na = Number(a)
      const nb = Number(b)
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
      return a.localeCompare(b)
    })
    for (const k of keys) {
      const nested = pickFirstRawUrl(o[k])
      if (nested) return nested
    }
  }

  return undefined
}

function normalizeBucketRelativePath(path: string): string {
  let p = path.trim().replace(/^\/+/, '')
  const bucketPrefix = `${STORAGE_BUCKET}/`
  if (p.startsWith(bucketPrefix)) p = p.slice(bucketPrefix.length)
  const marker = `object/public/${STORAGE_BUCKET}/`
  const idx = p.indexOf(marker)
  if (idx >= 0) p = p.slice(idx + marker.length)
  return p
}

function hostnameLooksLikeImageFilename(host: string): boolean {
  const parts = host.split('.').filter(Boolean)
  if (parts.length !== 2) return false
  return /^(jpe?g|png|webp|gif)$/i.test(parts[1])
}

function publicUrlForStoragePath(relativePath: string): string {
  const clean = normalizeBucketRelativePath(relativePath)
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(clean)
  return data.publicUrl
}

export function resolveProductImageUrl(
  imageUrls: unknown,
  legacySingleUrl?: unknown
): string {
  const raw = pickFirstRawUrl(imageUrls) ?? pickFirstRawUrl(legacySingleUrl)
  if (raw == null || raw.trim() === '') return PRODUCT_IMAGE_PLACEHOLDER

  let t = raw.trim()
  if (t.startsWith('//')) t = `https:${t}`

  if (/^https?:\/\//i.test(t)) {
    try {
      const u = new URL(t)
      if (hostnameLooksLikeImageFilename(u.hostname)) {
        const combined = `${u.hostname}${u.pathname === '/' ? '' : u.pathname}`.replace(
          /^\/+/,
          ''
        )
        return publicUrlForStoragePath(combined)
      }
      return t
    } catch {
      return publicUrlForStoragePath(t.replace(/^https?:\/\//i, ''))
    }
  }

  return publicUrlForStoragePath(t)
}
