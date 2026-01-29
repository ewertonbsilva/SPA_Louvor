
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { ViewType } from '../types';

interface Music {
  id: string;
  song: string;
  singer: string;
  theme: string;
  style: 'Adoração' | 'Celebração';
  link_youtube?: string;
  link_spotify?: string;
  link_letra?: string;
  link_cifra?: string;
}

interface RepertoireItem {
  id: string;
  song: string;
  singer: string;
  minister: string;
  key: string;
}

interface RepertoireSet {
  id: string;
  eventId: string;
  eventTitle: string;
  items: RepertoireItem[];
}

interface HistoryItem {
  id: string;
  minister: string;
  theme: string;
  style: string;
  song: string;
  singer: string;
  key: string;
  date: string;
}

const MusicView: React.FC<{ subView: ViewType }> = ({ subView }) => {
  const stylesChartRef = useRef<HTMLCanvasElement>(null);
  const themesChartRef = useRef<HTMLCanvasElement>(null);
  const rankingChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<{ styles?: any, themes?: any, ranking?: any }>({});

  // Paleta de cores solicitada
  const themeColorsPalette = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#ec4899'];

  // --- STATES ---
  const [songs, setSongs] = useState<Music[]>([]);
  const [repertoires, setRepertoires] = useState<RepertoireSet[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // UI Controls
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [expandedThemes, setExpandedThemes] = useState<Record<string, boolean>>({});
  const [expandedStyles, setExpandedStyles] = useState<Record<string, boolean>>({});
  const [expandedMinisters, setExpandedMinisters] = useState<Record<string, boolean>>({});
  const [expandedHistThemes, setExpandedHistThemes] = useState<Record<string, boolean>>({});

  // Form states
  const [newSong, setNewSong] = useState({ song: '', singer: '', theme: '', style: 'Adoração' });
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [subView]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Songs & Themes
      const { data: songsData, error: songsError } = await supabase
        .from('musicas')
        .select(`
          id,
          musica,
          cantor,
          estilo,
          temas (
            nome_tema
          )
        `);

      if (songsError) throw songsError;

      const formattedSongs: Music[] = (songsData || []).map((s: any) => ({
        id: s.id,
        song: s.musica,
        singer: s.cantor,
        theme: s.temas?.nome_tema || 'Geral',
        style: s.estilo
      }));

      setSongs(formattedSongs);

      // Extract unique themes for dropdown
      const themes = Array.from(new Set(formattedSongs.map(s => s.theme)));
      setAvailableThemes(themes);

      // 2. Fetch History (Mock for now, will implement real history table later if needed)
      // For now we can maybe fetch from 'historico_musicas' if it exists and has data
      const { data: historyData } = await supabase
        .from('historico_musicas')
        .select('*')
        .order('created_at', { ascending: false });

      if (historyData) {
        // Need to map history data effectively. Assuming structure for now.
        // If history table structure is different, this needs adjustment.
      }

    } catch (error) {
      console.error('Error fetching music data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSong = async () => {
    if (!newSong.song || !newSong.singer || !newSong.theme) return;

    try {
      // First find theme ID
      const { data: themeData } = await supabase
        .from('temas')
        .select('id')
        .eq('nome_tema', newSong.theme)
        .single();

      let themeId = themeData?.id;

      // If theme doesn't exist, create it (optional, or force selection)
      if (!themeId) {
        // Create new theme logic here if allowed
      }

      if (themeId) {
        const { error } = await supabase.from('musicas').insert({
          musica: newSong.song,
          cantor: newSong.singer,
          estilo: newSong.style,
          id_temas: themeId
        });

        if (error) throw error;

        setIsSongModalOpen(false);
        setNewSong({ song: '', singer: '', theme: '', style: 'Adoração' });
        fetchData(); // Reload list
      } else {
        alert('Tema não encontrado. Por favor selecione um tema válido.');
      }
    } catch (err) {
      console.error('Error adding song:', err);
      alert('Erro ao adicionar música.');
    }
  };

  // Ranking calculation
  const getRanking = () => {
    const counts: Record<string, number> = {};
    // Calculate from history and repertoires
    // Placeholder logic until full history is linked
    songs.forEach(s => counts[s.song] = Math.floor(Math.random() * 10)); // MOCK RANKING

    return Object.entries(counts)
      .map(([song, count]) => ({ song, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  useEffect(() => {
    if (subView === 'music-stats' && !loading) {
      // ... (Chart logic - same as before but using real 'songs' state)
      // Re-use the existing chart logic inside setTimeout
      const timer = setTimeout(() => {
        if (stylesChartRef.current) {
          if (chartInstances.current.styles) chartInstances.current.styles.destroy();
          chartInstances.current.styles = new (window as any).Chart(stylesChartRef.current, {
            type: 'doughnut',
            data: {
              labels: ['Adoração', 'Celebração'],
              datasets: [{
                data: [songs.filter(s => s.style === 'Adoração').length, songs.filter(s => s.style === 'Celebração').length],
                backgroundColor: ['#3b82f6', '#f59e0b'],
                borderWidth: 0
              }]
            },
            options: { plugins: { legend: { display: false } }, cutout: '70%', maintainAspectRatio: false }
          });
        }
        if (themesChartRef.current) {
          const uniqueThemes = Array.from(new Set(songs.map(s => s.theme)));
          if (chartInstances.current.themes) chartInstances.current.themes.destroy();
          chartInstances.current.themes = new (window as any).Chart(themesChartRef.current, {
            type: 'doughnut',
            data: {
              labels: uniqueThemes,
              datasets: [{
                data: uniqueThemes.map(t => songs.filter(s => s.theme === t).length),
                backgroundColor: themeColorsPalette,
                borderWidth: 0
              }]
            },
            options: { plugins: { legend: { display: false } }, cutout: '70%', maintainAspectRatio: false }
          });
        }
        if (rankingChartRef.current) {
          const ranking = getRanking();
          if (chartInstances.current.ranking) chartInstances.current.ranking.destroy();
          chartInstances.current.ranking = new (window as any).Chart(rankingChartRef.current, {
            type: 'bar',
            data: {
              labels: ranking.map(r => r.song.length > 15 ? r.song.substring(0, 12) + '...' : r.song),
              datasets: [{
                label: 'Execuções',
                data: ranking.map(r => r.count),
                backgroundColor: '#1e3a8a',
                borderRadius: 6
              }]
            },
            options: {
              indexAxis: 'y',
              plugins: { legend: { display: false } },
              maintainAspectRatio: false,
              scales: {
                x: { grid: { display: false } },
                y: { grid: { display: false } }
              }
            }
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [subView, songs, loading]);

  const getLink = (type: string, song: string, singer: string) => {
    const query = encodeURIComponent(`${song} ${singer}`);
    if (type === 'youtube') return `https://www.youtube.com/results?search_query=${query}`;
    if (type === 'spotify') return `https://open.spotify.com/search/${query}`;
    if (type === 'lyrics') return `https://www.letras.mus.br/?q=${query}`;
    if (type === 'chords') return `https://www.cifraclub.com.br/?q=${query}`;
    return '#';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[9px]">Carregando Músicas...</p>
      </div>
    );
  }

  if (subView === 'music-stats') {
    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-50 dark:border-slate-800 flex flex-col items-center">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Estilos</h3>
            <div className="h-40 w-full relative">
              <canvas ref={stylesChartRef}></canvas>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-50 dark:border-slate-800 flex flex-col items-center">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Temas (Paleta)</h3>
            <div className="h-40 w-full relative">
              <canvas ref={themesChartRef}></canvas>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-50 dark:border-slate-800 flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Ranking Músicas</h3>
            <div className="h-40 w-full">
              <canvas ref={rankingChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (subView === 'music-list') {
    const grouped = songs.reduce((acc, s) => {
      if (!acc[s.theme]) acc[s.theme] = {};
      if (!acc[s.theme][s.style]) acc[s.theme][s.style] = [];
      acc[s.theme][s.style].push(s);
      return acc;
    }, {} as any);

    return (
      <div className="pb-20 fade-in max-w-7xl mx-auto">
        <div className="flex justify-center mb-10">
          <button onClick={() => setIsSongModalOpen(true)} className="px-6 py-2.5 bg-brand text-white rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
            <i className="fas fa-plus mr-2"></i> Adicionar Música
          </button>
        </div>

        {/* Modal Adicionar Música */}
        {isSongModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSongModalOpen(false)}></div>
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl animate-fade-in border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">Nova Música</h3>
              <div className="space-y-4">
                <input value={newSong.song} onChange={e => setNewSong({ ...newSong, song: e.target.value })} placeholder="Nome da Música" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand" />
                <input value={newSong.singer} onChange={e => setNewSong({ ...newSong, singer: e.target.value })} placeholder="Cantor / Banda" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={newSong.theme} onChange={e => setNewSong({ ...newSong, theme: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand">
                    <option value="">Tema...</option>
                    {availableThemes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={newSong.style} onChange={e => setNewSong({ ...newSong, style: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand">
                    <option value="Adoração">Adoração</option>
                    <option value="Celebração">Celebração</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setIsSongModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest">Cancelar</button>
                  <button onClick={handleAddSong} className="flex-1 py-3 bg-brand text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg">Salvar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(grouped).map(([theme, styles]: [string, any]) => (
            <div key={theme} className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-50 dark:border-slate-800 overflow-hidden shadow-sm">
              <div onClick={() => setExpandedThemes(p => ({ ...p, [theme]: !p[theme] }))} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-brand/5 text-brand rounded-lg flex items-center justify-center"><i className="fas fa-tags text-[10px]"></i></div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{theme}</h3>
                </div>
                <i className={`fas fa-chevron-down text-slate-300 transition-transform ${expandedThemes[theme] ? 'rotate-180' : ''}`}></i>
              </div>
              {expandedThemes[theme] && (
                <div className="px-6 pb-6 space-y-6 pt-2 animate-fade-in bg-slate-50/10 dark:bg-slate-800/10">
                  {Object.entries(styles).map(([style, sList]: [string, any]) => {
                    const styleKey = `${theme}-${style}`;
                    return (
                      <div key={style} className="space-y-3">
                        <div onClick={() => setExpandedStyles(p => ({ ...p, [styleKey]: !p[styleKey] }))} className="flex items-center gap-2 cursor-pointer group w-fit">
                          <div className={`w-1.5 h-1.5 rounded-full ${style === 'Adoração' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                          <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{style} ({sList.length})</h4>
                        </div>
                        {expandedStyles[styleKey] && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sList.sort((a: any, b: any) => a.song.localeCompare(b.song)).map((s: Music) => (
                              <div key={s.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-brand/40 transition-all shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1 pr-2 min-w-0">
                                    <h5 className="text-[11px] font-black text-slate-800 dark:text-white uppercase truncate">{s.song}</h5>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{s.singer}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                  <a href={getLink('youtube', s.song, s.singer)} target="_blank" className="flex items-center justify-center py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-red-600 border border-slate-100 dark:border-slate-700" title="Youtube"><i className="fab fa-youtube text-[10px]"></i></a>
                                  <a href={getLink('spotify', s.song, s.singer)} target="_blank" className="flex items-center justify-center py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-500 border border-slate-100 dark:border-slate-700" title="Spotify"><i className="fab fa-spotify text-[10px]"></i></a>
                                  <a href={getLink('lyrics', s.song, s.singer)} target="_blank" className="flex items-center justify-center py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 border border-slate-100 dark:border-slate-700" title="Letra"><i className="fas fa-align-left text-[9px]"></i></a>
                                  <a href={getLink('chords', s.song, s.singer)} target="_blank" className="flex items-center justify-center py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-500 border border-slate-100 dark:border-slate-700" title="Cifra"><i className="fas fa-guitar text-[9px]"></i></a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Placeholder for other subViews as they are waiting for real data derived from 'escalas' in ListView or similar
  return null;
};

export default MusicView;
