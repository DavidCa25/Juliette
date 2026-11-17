/**
 * Guarda el contenido de la tienda en el repositorio de GitHub con un token del servidor.
 * La dueña nunca necesita una cuenta de GitHub: el panel publica por ella y Vercel
 * vuelve a desplegar el sitio automáticamente con cada commit en main.
 */
const API = 'https://api.github.com'

function cfg() {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO ?? 'DavidCa25/Juliette'
  const branch = process.env.GITHUB_BRANCH ?? 'main'
  if (!token) throw new Error('Falta configurar GITHUB_TOKEN en Vercel.')
  return { token, repo, branch }
}

async function gh<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = cfg()
  const r = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'juliette-admin',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  })
  if (!r.ok) {
    const text = await r.text()
    throw new Error(`GitHub ${r.status}: ${text.slice(0, 300)}`)
  }
  return (await r.json()) as T
}

type Entry = { name: string; path: string; type: string; sha: string }

async function readJsonFile(path: string): Promise<unknown> {
  const { repo, branch } = cfg()
  const file = await gh<{ content: string; encoding: string }>(`/repos/${repo}/contents/${encodeURI(path)}?ref=${branch}`)
  return JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'))
}

export async function readContent() {
  const { repo, branch } = cfg()
  const [settings, list] = await Promise.all([
    readJsonFile('content/settings.json'),
    gh<Entry[]>(`/repos/${repo}/contents/content/products?ref=${branch}`).catch(() => [] as Entry[]),
  ])
  const files = list.filter((e) => e.type === 'file' && e.name.endsWith('.json'))
  const products = await Promise.all(
    files.map(async (f) => ({ slug: f.name.replace(/\.json$/, ''), ...((await readJsonFile(f.path)) as object) })),
  )
  return { settings, products }
}

export async function publishContent(input: { settings: unknown; products: { slug: string; [k: string]: unknown }[] }, author: { name: string; email: string }) {
  const { repo, branch } = cfg()
  const ref = await gh<{ object: { sha: string } }>(`/repos/${repo}/git/ref/heads/${branch}`)
  const head = ref.object.sha
  const commit = await gh<{ tree: { sha: string } }>(`/repos/${repo}/git/commits/${head}`)
  const existing = await gh<Entry[]>(`/repos/${repo}/contents/content/products?ref=${head}`).catch(() => [] as Entry[])

  const keep = new Set(input.products.map((p) => `content/products/${p.slug}.json`))
  const tree: { path: string; mode: '100644'; type: 'blob'; content?: string; sha?: null }[] = [
    { path: 'content/settings.json', mode: '100644', type: 'blob', content: JSON.stringify(input.settings, null, 2) + '\n' },
    ...input.products.map((p) => {
      const { slug, ...data } = p
      return { path: `content/products/${slug}.json`, mode: '100644' as const, type: 'blob' as const, content: JSON.stringify(data, null, 2) + '\n' }
    }),
    ...existing.filter((e) => e.type === 'file' && e.name.endsWith('.json') && !keep.has(e.path)).map((e) => ({ path: e.path, mode: '100644' as const, type: 'blob' as const, sha: null })),
  ]

  const newTree = await gh<{ sha: string }>(`/repos/${repo}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: commit.tree.sha, tree }) })
  if (newTree.sha === commit.tree.sha) return { sha: head, changed: false }

  const created = await gh<{ sha: string; html_url: string }>(`/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: `Contenido actualizado desde el panel por ${author.name || author.email}`,
      tree: newTree.sha,
      parents: [head],
      author: { name: author.name || 'Panel Julietté', email: author.email, date: new Date().toISOString() },
    }),
  })
  await gh(`/repos/${repo}/git/refs/heads/${branch}`, { method: 'PATCH', body: JSON.stringify({ sha: created.sha, force: false }) })
  return { sha: created.sha, changed: true }
}
