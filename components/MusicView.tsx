
import React, { useEffect, useRef, useState } from 'react';
import { ViewType } from '../types';

interface Song {
  id: string;
  song: string;
  singer: string;
  theme: string;
  style: 'Adoração' | 'Celebração';
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
  const chartInstances = useRef<{styles?: any, themes?: any, ranking?: any}>({});

  // Paleta de cores solicitada: Azul, Vermelho, Amarelo, Verde e Rosa
  const themeColorsPalette = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#ec4899'];

  // --- BIBLIOTECA DE MÚSICAS ---
  const [songs, setSongs] = useState<Song[]>([
    { id: 's1', song: 'Bondade de Deus', singer: 'Isaias Saad', theme: 'Amor de Deus', style: 'Adoração' },
    { id: 's2', song: 'A Casa é Sua', singer: 'Casa Worship', theme: 'Entrega', style: 'Adoração' },
    { id: 's3', song: 'Lugar Secreto', singer: 'Gabriela Rocha', theme: 'Intimidade', style: 'Adoração' },
    { id: 's4', song: 'Hosana', singer: 'Hillsong', theme: 'Exaltação', style: 'Celebração' },
    { id: 's5', song: 'Vim para Adorar-te', singer: 'Adoração e Adoradores', theme: 'Adoração', style: 'Adoração' },
  ]);

  const [repertoires, setRepertoires] = useState<RepertoireSet[]>([
    {
      id: 'rep1',
      eventId: '1',
      eventTitle: 'SANTA CEIA - 01/05',
      items: [
        { id: 'ri1', song: 'Bondade de Deus', singer: 'Isaias Saad', minister: 'Ewerton Silva', key: 'G' },
        { id: 'ri2', song: 'A Casa é Sua', singer: 'Casa Worship', minister: 'Rosy Oliveira', key: 'Bb' }
      ]
    }
  ]);

  const [history, setHistory] = useState<HistoryItem[]>([
    { id: 'h1', minister: 'Ewerton Silva', theme: 'Amor de Deus', style: 'Adoração', song: 'Bondade de Deus', singer: 'Isaias Saad', key: 'G', date: '01/05/2024' },
    { id: 'h2', minister: 'Ewerton Silva', theme: 'Amor de Deus', style: 'Adoração', song: 'Bondade de Deus', singer: 'Isaias Saad', key: 'A', date: '15/04/2024' },
    { id: 'h3', minister: 'Rosy Oliveira', theme: 'Exaltação', style: 'Celebração', song: 'Hosana', singer: 'Hillsong', key: 'E', date: '10/05/2024' }
  ]);

  // --- UI CONTROLS ---
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isRepModalOpen, setIsRepModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [expandedThemes, setExpandedThemes] = useState<Record<string, boolean>>({});
  const [expandedStyles, setExpandedStyles] = useState<Record<string, boolean>>({});
  const [expandedMinisters, setExpandedMinisters] = useState<Record<string, boolean>>({});
  const [expandedHistThemes, setExpandedHistThemes] = useState<Record<string, boolean>>({});

  // Ranking calculation
  const getRanking = () => {
    const counts: Record<string, { count: number, song: string, singer: string }> = {};
    repertoires.forEach(r => r.items.forEach(i => {
      counts[i.song] = { count: (counts[i.song]?.count || 0) + 1, song: i.song, singer: i.singer };
    }));
    history.forEach(h => {
      counts[h.song] = { count: (counts[h.song]?.count || 0) + 1, song: h.song, singer: h.singer };
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  };

  const sendToHistory = (rep: RepertoireSet) => {
    const newHistoryItems: HistoryItem[] = rep.items.map(item => {
      const songInfo = songs.find(s => s.song === item.song);
      return {
        id: Math.random().toString(36).substr(2, 9),
        minister: item.minister,
        theme: songInfo?.theme || 'Geral',
        style: songInfo?.style || 'Adoração',
        song: item.song,
        singer: item.singer,
        key: item.key,
        date: new Date().toLocaleDateString('pt-BR')
      };
    });
    setHistory(prev => [...prev, ...newHistoryItems]);
    setRepertoires(prev => prev.filter(r => r.id !== rep.id));
    alert('Repertório enviado para o histórico!');
  };

  useEffect(() => {
    if (subView === 'music-stats') {
      const isDark = document.documentElement.classList.contains('dark');
      const textColor = isDark ? '#94a3b8' : '#64748b';
      
      const timer = setTimeout(() => {
        // Estilos Chart
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

        // Temas Chart - Usando apenas as 5 cores solicitadas
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

        // Ranking Chart - Barras Horizontais
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
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim() || '#1e3a8a',
                borderRadius: 6
              }]
            },
            options: {
              indexAxis: 'y',
              plugins: { legend: { display: false } },
              maintainAspectRatio: false,
              scales: {
                x: { grid: { display: false }, ticks: { stepSize: 1, color: textColor } },
                y: { grid: { display: false }, ticks: { color: textColor, font: { weight: 'bold', size: 10 } } }
              }
            }
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [subView, songs, history, repertoires]);

  const getLink = (type: string, song: string, singer: string) => {
    const query = encodeURIComponent(`${song} ${singer}`);
    if (type === 'youtube') return `https://www.youtube.com/results?search_query=${query}`;
    if (type === 'spotify') return `https://open.spotify.com/search/${query}`;
    if (type === 'lyrics') return `https://www.letras.mus.br/?q=${query}`;
    if (type === 'chords') return `https://www.cifraclub.com.br/?q=${query}`;
    return '#';
  };

  // --- RENDERING ---

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
          <button onClick={() => setIsSongModalOpen(true)} className="px-6 py-2.5 bg-brand text-white rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg">
            <i className="fas fa-plus mr-2"></i> Adicionar Música
          </button>
        </div>
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
                            {sList.sort((a: any, b: any) => a.song.localeCompare(b.song)).map((s: Song) => (
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

  if (subView === 'music-repertoire') {
    return (
      <div className="pb-20 fade-in max-w-7xl mx-auto space-y-6">
        {repertoires.map(rep => (
          <div key={rep.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-50 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{rep.eventTitle}</h4>
                <p className="text-[8px] font-black text-slate-400 uppercase mt-1 tracking-widest">{rep.items.length} MÚSICAS</p>
              </div>
              <button onClick={() => sendToHistory(rep)} className="w-8 h-8 bg-emerald-500 text-white rounded-lg shadow-md flex items-center justify-center"><i className="fas fa-check-double text-[10px]"></i></button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {rep.items.map(item => (
                <div key={item.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                   <div className="w-8 h-8 bg-brand text-white rounded-lg flex items-center justify-center font-black text-[10px] shrink-0">{item.key}</div>
                   <div className="min-w-0">
                     <h5 className="text-[11px] font-black text-slate-800 dark:text-white uppercase truncate">{item.song}</h5>
                     <p className="text-[9px] font-bold text-slate-400 uppercase truncate">MIN: <span className="text-brand">{item.minister}</span></p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (subView === 'music-history') {
    const historyGrouped = history.reduce((acc, item) => {
      if (!acc[item.minister]) acc[item.minister] = {};
      if (!acc[item.minister][item.theme]) acc[item.minister][item.theme] = {};
      if (!acc[item.minister][item.theme][item.style]) acc[item.minister][item.theme][item.style] = [];
      acc[item.minister][item.theme][item.style].push(item);
      return acc;
    }, {} as any);

    return (
      <div className="pb-20 fade-in max-w-7xl mx-auto space-y-6">
        {Object.entries(historyGrouped).map(([minister, themes]: [string, any]) => (
          <div key={minister} className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-50 dark:border-slate-800 overflow-hidden shadow-sm">
             <div onClick={() => setExpandedMinisters(p => ({ ...p, [minister]: !p[minister] }))} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-black text-sm">{minister.charAt(0)}</div>
                 <div>
                   <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{minister}</h3>
                   <p className="text-[8px] font-black text-brand uppercase mt-1 tracking-widest">MINISTRO</p>
                 </div>
               </div>
               <i className={`fas fa-chevron-down text-slate-300 transition-transform ${expandedMinisters[minister] ? 'rotate-180' : ''}`}></i>
             </div>
             {expandedMinisters[minister] && (
               <div className="px-6 pb-6 space-y-6 pt-4 animate-fade-in bg-slate-50/5 dark:bg-slate-800/5">
                  {Object.entries(themes).map(([theme, styles]: [string, any]) => {
                    const histThemeKey = `${minister}-${theme}`;
                    return (
                      <div key={theme} className="space-y-4">
                         <div onClick={() => setExpandedHistThemes(p => ({ ...p, [histThemeKey]: !p[histThemeKey] }))} className="flex items-center gap-2 cursor-pointer group w-fit">
                           <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-brand transition-colors">
                              {theme}
                           </h4>
                           <i className={`fas fa-chevron-right text-[8px] text-slate-200 transition-transform ${expandedHistThemes[histThemeKey] ? 'rotate-90' : ''}`}></i>
                         </div>
                         {expandedHistThemes[histThemeKey] && (
                           <div className="space-y-6 animate-fade-in pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                              {Object.entries(styles).map(([style, items]: [string, any]) => (
                                <div key={style} className="space-y-3">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-1.5 h-1.5 rounded-full ${style === 'Adoração' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                                      <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{style}</span>
                                   </div>
                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {items.map((h: HistoryItem) => (
                                        <div key={h.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center group shadow-sm">
                                           <div className="flex-1 min-w-0">
                                             <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase truncate leading-tight">{h.song}</p>
                                             <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">{h.singer} • <span className="text-brand">{h.key}</span></p>
                                           </div>
                                           <div className="flex flex-col items-end shrink-0 ml-4">
                                             <span className="text-[7px] font-black text-slate-300 uppercase mb-1">{h.date}</span>
                                             <i className="fas fa-check-circle text-emerald-500 text-[10px]"></i>
                                           </div>
                                        </div>
                                      ))}
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
    );
  }

  return null;
};

export default MusicView;
