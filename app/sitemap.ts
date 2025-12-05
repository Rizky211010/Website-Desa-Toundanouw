import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://websitedesatoundanouw.site'
  
  // Halaman statis
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/profil`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/berita`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/galeri`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/surat`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/potensi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/jelajahi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/jelajahi/sejarah`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/jelajahi/penduduk`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/jelajahi/wilayah`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/jelajahi/organisasi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Ambil halaman berita dinamis dari database
  let beritaPages: MetadataRoute.Sitemap = []
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data: beritaList } = await supabase
      .from('berita')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(100)

    if (beritaList) {
      beritaPages = beritaList.map((berita) => ({
        url: `${baseUrl}/berita/${berita.slug}`,
        lastModified: new Date(berita.updated_at || berita.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Error fetching berita for sitemap:', error)
  }

  // Ambil halaman surat dinamis
  let suratPages: MetadataRoute.Sitemap = []
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data: suratList } = await supabase
      .from('surat_templates')
      .select('slug, updated_at, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (suratList) {
      suratPages = suratList.map((surat) => ({
        url: `${baseUrl}/surat/${surat.slug}`,
        lastModified: new Date(surat.updated_at || surat.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error('Error fetching surat for sitemap:', error)
  }

  // Ambil halaman potensi dinamis
  let potensiPages: MetadataRoute.Sitemap = []
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data: potensiList } = await supabase
      .from('potensi')
      .select('slug, updated_at, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (potensiList) {
      potensiPages = potensiList.map((potensi) => ({
        url: `${baseUrl}/potensi/${potensi.slug}`,
        lastModified: new Date(potensi.updated_at || potensi.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error('Error fetching potensi for sitemap:', error)
  }

  return [...staticPages, ...beritaPages, ...suratPages, ...potensiPages]
}
