import { Users, Award, Briefcase, Phone, Mail, Building2 } from "lucide-react";
import { Container, Card, Badge } from "@/components";
import { PageHeader } from "@/components/page-header";
import { supabase } from "@/lib/supabase";

// Force dynamic rendering - selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Types
interface Organisasi {
  id: string;
  nama: string;
  singkatan: string | null;
  ketua: string;
  wakil_ketua: string | null;
  sekretaris: string | null;
  bendahara: string | null;
  jumlah_anggota: number;
  deskripsi: string | null;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  foto_url: string | null;
  kategori: string;
  urutan: number;
  is_active: boolean;
}

interface StrukturPemerintahan {
  id: string;
  jabatan: string;
  nama: string;
  nip: string | null;
  email: string | null;
  telepon: string | null;
  foto_url: string | null;
  deskripsi: string | null;
  urutan: number;
  is_active: boolean;
}

// Fetch data dari database
async function getOrganisasiList(): Promise<Organisasi[]> {
  const { data, error } = await supabase
    .from('organisasi_desa')
    .select('*')
    .eq('is_active', true)
    .order('urutan', { ascending: true });

  if (error) {
    console.error('Error fetching organisasi:', error);
    return [];
  }
  return data || [];
}

async function getStrukturPemerintahan(): Promise<StrukturPemerintahan[]> {
  const { data, error } = await supabase
    .from('struktur_pemerintahan')
    .select('*')
    .eq('is_active', true)
    .order('urutan', { ascending: true });

  if (error) {
    console.error('Error fetching struktur:', error);
    return [];
  }
  return data || [];
}

export default async function OrganisasiPage() {
  // Fetch data dari database
  const [organisasiList, strukturList] = await Promise.all([
    getOrganisasiList(),
    getStrukturPemerintahan()
  ]);

  // Kelompokkan struktur berdasarkan jabatan
  const kepalaDesa = strukturList.find(s => s.jabatan.toLowerCase().includes('kepala desa'));
  const sekretarisDesa = strukturList.find(s => s.jabatan.toLowerCase().includes('sekretaris'));
  const kaur = strukturList.filter(s => s.jabatan.toLowerCase().includes('kaur') || s.jabatan.toLowerCase().includes('urusan'));
  const kasi = strukturList.filter(s => s.jabatan.toLowerCase().includes('kasi') || s.jabatan.toLowerCase().includes('seksi'));

  // Kelompokkan organisasi berdasarkan kategori
  const lembagaDesa = organisasiList.filter(o => o.kategori === 'lembaga_desa');
  const organisasiMasyarakat = organisasiList.filter(o => o.kategori === 'organisasi_masyarakat');
  const kelompokUsaha = organisasiList.filter(o => o.kategori === 'kelompok_usaha');

  return (
    <>
      <PageHeader
        title="Struktur Organisasi"
        subtitle="Struktur pemerintahan dan lembaga desa Toundanouw"
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Jelajahi" },
          { label: "Organisasi" },
        ]}
      />

      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <Container className="relative">
          {/* Kepala Desa */}
          {kepalaDesa && (
            <div className="max-w-2xl mx-auto mb-16 animate-fadeInUp">
              <Card className="text-center border-t-4 border-t-orange-500 shadow-2xl p-8 relative overflow-hidden">
                {/* Decorative Gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-orange-100 via-orange-50 to-yellow-50 dark:from-orange-900/20 dark:via-orange-800/10 dark:to-yellow-900/10 -z-10" />
                
                <div className="w-36 h-36 mx-auto mb-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center overflow-hidden shadow-xl shadow-orange-500/30 ring-4 ring-white dark:ring-slate-700">
                  {kepalaDesa.foto_url ? (
                    <img src={kepalaDesa.foto_url} alt={kepalaDesa.nama} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-20 h-20 text-white" />
                  )}
                </div>
                <Badge variant="primary" className="mb-4 px-4 py-2">
                  Pimpinan Desa
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {kepalaDesa.nama}
                </h2>
                <p className="text-orange-600 dark:text-orange-400 font-semibold text-lg mb-2">
                  {kepalaDesa.jabatan}
                </p>
                {kepalaDesa.nip && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-mono bg-gray-100 dark:bg-slate-700 inline-block px-4 py-1 rounded-lg">
                    NIP: {kepalaDesa.nip}
                  </p>
                )}
              </Card>
            </div>
          )}

          {/* Sekretaris Desa */}
          {sekretarisDesa && (
            <div className="max-w-lg mx-auto mb-16 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              <Card className="text-center border-l-4 border-l-blue-500 shadow-xl hover:shadow-2xl transition-shadow duration-500">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/30">
                  {sekretarisDesa.foto_url ? (
                    <img src={sekretarisDesa.foto_url} alt={sekretarisDesa.nama} className="w-full h-full object-cover" />
                  ) : (
                    <Briefcase className="w-12 h-12 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {sekretarisDesa.nama}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {sekretarisDesa.jabatan}
                </p>
                {sekretarisDesa.nip && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-mono">
                    NIP: {sekretarisDesa.nip}
                  </p>
                )}
              </Card>
            </div>
          )}

          {/* Kepala Urusan */}
          {kaur.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center animate-fadeInUp">
                <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Kepala Urusan (Kaur)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kaur.map((item, index) => (
                  <Card 
                    key={item.id} 
                    hoverable 
                    className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-green-500/30">
                      {item.foto_url ? (
                        <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                      {item.nama}
                    </h4>
                    <p className="text-green-600 dark:text-green-400 font-medium text-sm mb-2 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full inline-block">
                      {item.jabatan}
                    </p>
                    {item.deskripsi && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                        {item.deskripsi}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Kepala Seksi */}
          {kasi.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center animate-fadeInUp">
                <span className="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                  Kepala Seksi (Kasi)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kasi.map((item, index) => (
                  <Card 
                    key={item.id} 
                    hoverable 
                    className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-purple-500/30">
                      {item.foto_url ? (
                        <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                      {item.nama}
                    </h4>
                    <p className="text-purple-600 dark:text-purple-400 font-medium text-sm mb-2 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full inline-block">
                      {item.jabatan}
                    </p>
                    {item.deskripsi && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                        {item.deskripsi}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Lembaga Desa */}
          {lembagaDesa.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center animate-fadeInUp">
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  Lembaga Desa
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lembagaDesa.map((org, index) => (
                  <Card 
                    key={org.id} 
                    hoverable 
                    className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                      {org.nama}
                    </h4>
                    {org.singkatan && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded inline-block">
                        ({org.singkatan})
                      </p>
                    )}
                    <p className="text-amber-600 dark:text-amber-400 font-medium text-sm mb-3 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full inline-block">
                      Ketua: {org.ketua}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      <span>{org.jumlah_anggota} Anggota</span>
                    </div>
                    {org.deskripsi && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-3 line-clamp-2">
                        {org.deskripsi}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Organisasi Masyarakat */}
          {organisasiMasyarakat.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center animate-fadeInUp">
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  Organisasi Masyarakat
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organisasiMasyarakat.map((org, index) => (
                  <Card 
                    key={org.id} 
                    hoverable 
                    className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                      {org.nama}
                    </h4>
                    {org.singkatan && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded inline-block">
                        ({org.singkatan})
                      </p>
                    )}
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full inline-block">
                      Ketua: {org.ketua}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      <span>{org.jumlah_anggota} Anggota</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Kelompok Usaha */}
          {kelompokUsaha.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center animate-fadeInUp">
                <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  Kelompok Usaha
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kelompokUsaha.map((org, index) => (
                  <Card 
                    key={org.id} 
                    hoverable 
                    className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Briefcase className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                      {org.nama}
                    </h4>
                    {org.singkatan && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded inline-block">
                        ({org.singkatan})
                      </p>
                    )}
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-2 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full inline-block">
                      Ketua: {org.ketua}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      <span>{org.jumlah_anggota} Anggota</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tampilkan pesan jika tidak ada data */}
          {strukturList.length === 0 && organisasiList.length === 0 && (
            <div className="text-center py-16 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-gray-200 dark:border-slate-700 animate-fadeInUp">
              <Users className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Data organisasi belum tersedia.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* Contact */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
        <Container className="py-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Telepon Kantor</p>
                <p className="font-semibold text-gray-900 dark:text-white">(0431) 123-456</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-semibold text-gray-900 dark:text-white">desa.toundanouw@gmail.com</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
