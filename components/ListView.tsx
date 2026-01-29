
import React, { useState, useEffect } from 'react';
import { ScheduleEvent, Member, RepertoireItem } from '../types';

interface ListViewProps {
  onReportAbsence: (id: string) => void;
}

type SubTab = 'team' | 'repertoire' | 'notices';

interface Notice {
  id: string;
  sender: string;
  text: string;
  time: string;
}

const ListView: React.FC<ListViewProps> = ({ onReportAbsence }) => {
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [activeSubTabs, setActiveSubTabs] = useState<Record<string, SubTab>>({});
  
  // States for visibility
  const [showAddSong, setShowAddSong] = useState<string | null>(null);
  const [showAddNotice, setShowAddNotice] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState<string | null>(null);
  const [editingNoticeId, setEditingNoticeId] = useState<{eventId: string, noticeId: string} | null>(null);
  const [showScaleModal, setShowScaleModal] = useState<{mode: 'add' | 'edit', eventId?: string} | null>(null);

  // Trava scroll quando o modal de escala está aberto
  useEffect(() => {
    if (showScaleModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showScaleModal]);

  // Form states
  const [newSongData, setNewSongData] = useState({ song: '', singer: '', key: '' });
  const [noticeText, setNoticeText] = useState('');
  const [scaleFormData, setScaleFormData] = useState({ title: '', date: '', time: '' });
  const [newMemberFormData, setNewMemberFormData] = useState({ memberId: '', role: '' });

  // Mock Global Data (Base de dados de membros cadastrados)
  const allRegisteredMembers = [
    { id: 'm1', name: 'Ewerton Silva', gender: 'M', icon: 'fa-crown' },
    { id: 'm2', name: 'Rosy Oliveira', gender: 'F', icon: 'fa-microphone' },
    { id: 'm3', name: 'Jhordan Santos', gender: 'M', icon: 'fa-guitar' },
    { id: 'm4', name: 'Mariana Costa', gender: 'F', icon: 'fa-keyboard' },
    { id: 'm5', name: 'Lucas Lima', gender: 'M', icon: 'fa-drum' },
    { id: 'm10', name: 'Vitor Mesquita', gender: 'M', icon: 'fa-microphone' },
    { id: 'm11', name: 'Sarah Rebeca', gender: 'F', icon: 'fa-microphone' },
    { id: 'm12', name: 'Felipe Neves', gender: 'M', icon: 'fa-keyboard' }
  ];

  const availableRoles = ['Ministro', 'Vocal', 'Violão', 'Guitarra', 'Baixo', 'Teclado', 'Bateria', 'Sonoplastia', 'Projeção'];

  const [eventNotices, setEventNotices] = useState<Record<string, Notice[]>>({
    '1': [
      { id: 'n1', sender: 'Ewerton Silva', text: 'Vou me atrasar 10 minutos hoje devido ao trânsito.', time: '18:45' },
      { id: 'n2', sender: 'Rosy Oliveira', text: 'A música "Bondade de Deus" será no tom de G.', time: '17:30' }
    ]
  });

  const [events, setEvents] = useState<ScheduleEvent[]>([
    {
      id: '1',
      title: 'SANTA CEIA',
      date: '01/05',
      dayOfWeek: 'DOM',
      time: '19:00',
      members: [
        { id: 'm1', name: 'Ewerton Silva', role: 'Ministro', gender: 'M', status: 'confirmed', avatar: '', icon: 'fa-crown text-brand' },
        { id: 'm2', name: 'Rosy Oliveira', role: 'Vocal', gender: 'F', status: 'confirmed', avatar: '', icon: 'fa-microphone text-slate-300' },
        { id: 'm5', name: 'Ewerton', role: 'Violão', gender: 'M', status: 'confirmed', avatar: '', icon: 'fa-guitar text-orange-400' },
      ],
      repertoire: [
        { id: 'r1', song: 'Bondade de Deus', singer: 'Rosy', key: 'G' },
        { id: 'r2', song: 'A Casa é Sua', singer: 'Ewerton', key: 'Bb' }
      ]
    },
    {
      id: '2',
      title: 'CULTO DA FAMÍLIA',
      date: '08/05',
      dayOfWeek: 'DOM',
      time: '19:00',
      members: [
        { id: 'm4', name: 'Mariana Costa', role: 'Ministro', gender: 'F', status: 'confirmed', avatar: '', icon: 'fa-crown text-brand' },
      ],
      repertoire: [
        { id: 'r3', song: 'Lugar Secreto', singer: 'Mariana', key: 'E' }
      ]
    }
  ]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    if (!activeSubTabs[id]) {
      setActiveSubTabs(prev => ({ ...prev, [id]: 'team' }));
    }
  };

  const setSubTab = (eventId: string, tab: SubTab) => {
    setActiveSubTabs(prev => ({ ...prev, [eventId]: tab }));
    setShowAddSong(null);
    setShowAddNotice(null);
    setShowAddMember(null);
    setEditingNoticeId(null);
  };

  const handleSaveScale = () => {
    if (showScaleModal?.mode === 'add') {
      const newEvent: ScheduleEvent = {
        id: Math.random().toString(36).substr(2, 9),
        title: scaleFormData.title.toUpperCase() || 'NOVO CULTO',
        date: scaleFormData.date ? scaleFormData.date.split('-').reverse().slice(0, 2).join('/') : '00/00',
        dayOfWeek: 'DOM',
        time: scaleFormData.time || '19:00',
        members: [],
        repertoire: []
      };
      setEvents([...events, newEvent]);
    } else if (showScaleModal?.mode === 'edit' && showScaleModal.eventId) {
      setEvents(events.map(ev => ev.id === showScaleModal.eventId 
        ? { 
            ...ev, 
            title: scaleFormData.title.toUpperCase(), 
            time: scaleFormData.time,
            date: scaleFormData.date ? scaleFormData.date.split('-').reverse().slice(0, 2).join('/') : ev.date
          } 
        : ev
      ));
    }
    setShowScaleModal(null);
    setScaleFormData({ title: '', date: '', time: '' });
  };

  const handleSaveSong = (eventId: string) => {
    if (!newSongData.song || !newSongData.singer || !newSongData.key) return;
    const newItem: RepertoireItem = {
      id: Math.random().toString(36).substr(2, 9),
      song: newSongData.song.split(' - ')[0],
      singer: newSongData.singer,
      key: newSongData.key
    };
    setEvents(events.map(ev => ev.id === eventId 
      ? { ...ev, repertoire: [...ev.repertoire, newItem] } 
      : ev
    ));
    setShowAddSong(null);
    setNewSongData({ song: '', singer: '', key: '' });
  };

  const handleAddMemberToScale = (eventId: string) => {
    if (!newMemberFormData.memberId || !newMemberFormData.role) return;
    const memberBase = allRegisteredMembers.find(m => m.id === newMemberFormData.memberId);
    if (!memberBase) return;

    const newMember: Member = {
      ...memberBase as any,
      role: newMemberFormData.role,
      status: 'confirmed',
      avatar: `https://picsum.photos/seed/${memberBase.id}/100`
    };

    setEvents(events.map(ev => ev.id === eventId 
      ? { ...ev, members: [...ev.members, newMember] } 
      : ev
    ));
    setShowAddMember(null);
    setNewMemberFormData({ memberId: '', role: '' });
  };

  const handleSaveNotice = (eventId: string) => {
    if (!noticeText.trim()) return;
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    if (editingNoticeId) {
      setEventNotices(prev => ({
        ...prev,
        [eventId]: prev[eventId].map(n => n.id === editingNoticeId.noticeId ? { ...n, text: noticeText } : n)
      }));
    } else {
      const newNotice: Notice = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'Administrador',
        text: noticeText,
        time: currentTime
      };
      setEventNotices(prev => ({
        ...prev,
        [eventId]: [...(prev[eventId] || []), newNotice]
      }));
    }
    setShowAddNotice(null);
    setEditingNoticeId(null);
    setNoticeText('');
  };

  const tones = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex justify-center mb-10">
        <button 
          onClick={() => setShowScaleModal({ mode: 'add' })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-brand hover:border-brand transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm"
        >
          <i className="fas fa-plus-circle text-xs"></i>
          Nova Escala
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {events.map(event => {
          const currentSubTab = activeSubTabs[event.id] || 'team';
          const isExpanded = expandedId === event.id;
          const notices = eventNotices[event.id] || [];
          const singersInEvent = event.members.filter(m => m.role === 'Ministro' || m.role === 'Vocal');
          
          const membersNotScaleed = allRegisteredMembers.filter(m => 
            !event.members.some(em => em.id === m.id)
          );

          return (
            <div key={event.id} className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border ${isExpanded ? 'border-brand/40 ring-4 ring-brand/5' : 'border-slate-100 dark:border-slate-800'} overflow-hidden transition-all duration-300 h-fit`}>
              <div 
                onClick={() => toggleExpand(event.id)}
                className="px-8 py-6 cursor-pointer flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-800/20"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${isExpanded ? 'bg-brand text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                    <span className="text-[9px] font-black uppercase leading-none">{event.dayOfWeek}</span>
                    <span className="text-lg font-black leading-none mt-1">{event.date.split('/')[0]}</span>
                  </div>
                  <div>
                    <h3 className={`text-lg font-black tracking-tight uppercase leading-none ${isExpanded ? 'text-brand' : 'text-slate-800 dark:text-white'}`}>{event.title}</h3>
                    <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 font-bold text-[10px] mt-2 uppercase tracking-widest">
                      <span><i className="far fa-clock text-brand mr-1 opacity-70"></i> {event.time}</span>
                      <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                      <span>{event.members.length} MEMBROS</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 transition-all ${isExpanded ? 'rotate-180 bg-brand/10 text-brand' : 'group-hover:text-brand'}`}>
                    <i className="fas fa-chevron-down text-[10px]"></i>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10 animate-fade-in">
                  <div className="px-6 pt-6 pb-4">
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl flex items-center shadow-sm border border-slate-100 dark:border-slate-700 w-full overflow-hidden">
                      <button onClick={() => setSubTab(event.id, 'team')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${currentSubTab === 'team' ? 'bg-brand text-white shadow-md' : 'text-slate-400 hover:text-brand'}`}>Equipe</button>
                      <button onClick={() => setSubTab(event.id, 'repertoire')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${currentSubTab === 'repertoire' ? 'bg-brand text-white shadow-md' : 'text-slate-400 hover:text-brand'}`}>Músicas</button>
                      <button onClick={() => setSubTab(event.id, 'notices')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${currentSubTab === 'notices' ? 'bg-brand text-white shadow-md' : 'text-slate-400 hover:text-brand'}`}>Avisos</button>
                    </div>
                  </div>

                  <div className="px-8 pb-10 fade-in min-h-[150px]">
                    {currentSubTab === 'team' && (
                      <div className="space-y-3 pt-4">
                        {!showAddMember && (
                          <div className="flex justify-end mb-4">
                            <button 
                              onClick={() => setShowAddMember(event.id)}
                              className="text-[9px] font-black text-slate-400 hover:text-brand uppercase tracking-widest flex items-center gap-2 py-1 px-3 rounded-lg hover:bg-brand/5 transition-all"
                            >
                              <i className="fas fa-plus-circle text-[8px]"></i> Escalar Membro
                            </button>
                          </div>
                        )}

                        {showAddMember === event.id && (
                          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-brand/20 shadow-xl mb-4 animate-fade-in space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Membro</label>
                                  <select 
                                    value={newMemberFormData.memberId}
                                    onChange={(e) => setNewMemberFormData({...newMemberFormData, memberId: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-brand appearance-none"
                                  >
                                    <option value="">Selecionar da Base...</option>
                                    {membersNotScaleed.map(m => (
                                      <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Função</label>
                                  <select 
                                    value={newMemberFormData.role}
                                    onChange={(e) => setNewMemberFormData({...newMemberFormData, role: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-brand appearance-none"
                                  >
                                    <option value="">Selecionar Função...</option>
                                    {availableRoles.map(r => (
                                      <option key={r} value={r}>{r}</option>
                                    ))}
                                  </select>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => setShowAddMember(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest">Cancelar</button>
                                <button onClick={() => handleAddMemberToScale(event.id)} className="flex-1 py-2 bg-brand text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">Adicionar</button>
                             </div>
                          </div>
                        )}

                        {event.members.map(member => (
                          <div key={member.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group/member">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <i className={`fas ${member.icon || 'fa-user'} text-[10px]`}></i>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-800 dark:text-white leading-none">{member.name}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{member.role}</span>
                              </div>
                            </div>
                            <button onClick={() => setEvents(events.map(ev => ev.id === event.id ? { ...ev, members: ev.members.filter(m => m.id !== member.id) } : ev))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-400"><i className="fas fa-trash-alt text-[9px]"></i></button>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentSubTab === 'repertoire' && (
                      <div className="space-y-3 pt-4">
                        {!showAddSong && (
                          <div className="flex justify-end mb-4">
                            <button 
                              onClick={() => setShowAddSong(event.id)}
                              className="text-[9px] font-black text-slate-400 hover:text-brand uppercase tracking-widest flex items-center gap-2 py-1 px-3 rounded-lg hover:bg-brand/5 transition-all"
                            >
                              <i className="fas fa-plus text-[8px]"></i> Nova Música
                            </button>
                          </div>
                        )}

                        {showAddSong === event.id && (
                          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-brand/20 shadow-xl mb-4 animate-fade-in space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              <input 
                                type="text" 
                                value={newSongData.song}
                                onChange={(e) => setNewSongData({ ...newSongData, song: e.target.value })}
                                placeholder="Música - Cantor" 
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-brand outline-none" 
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <select 
                                  value={newSongData.singer}
                                  onChange={(e) => setNewSongData({ ...newSongData, singer: e.target.options[e.target.selectedIndex].text })}
                                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-brand outline-none appearance-none"
                                >
                                  <option value="">Ministro...</option>
                                  {singersInEvent.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                  ))}
                                </select>
                                <select 
                                  value={newSongData.key}
                                  onChange={(e) => setNewSongData({ ...newSongData, key: e.target.value })}
                                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-brand outline-none appearance-none"
                                >
                                  <option value="">Tom...</option>
                                  {tones.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setShowAddSong(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest">Cancelar</button>
                              <button onClick={() => handleSaveSong(event.id)} className="flex-1 py-2 bg-brand text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">Salvar</button>
                            </div>
                          </div>
                        )}

                        {event.repertoire.map(item => (
                          <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group/song">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-brand/5 flex items-center justify-center text-brand"><i className="fas fa-play text-[8px]"></i></div>
                              <div>
                                <p className="text-[11px] font-black text-slate-800 dark:text-white leading-none">{item.song}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.singer} • {item.key}</p>
                              </div>
                            </div>
                            <button onClick={() => setEvents(events.map(ev => ev.id === event.id ? { ...ev, repertoire: ev.repertoire.filter(r => r.id !== item.id) } : ev))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-400"><i className="fas fa-trash-alt text-[9px]"></i></button>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentSubTab === 'notices' && (
                      <div className="pt-4 space-y-3">
                        {!showAddNotice && (
                          <div className="flex justify-end mb-2">
                            <button 
                              onClick={() => { setShowAddNotice(event.id); setEditingNoticeId(null); setNoticeText(''); }}
                              className="text-[9px] font-black text-slate-400 hover:text-brand uppercase tracking-widest flex items-center gap-2 py-1 px-3 rounded-lg hover:bg-brand/5 transition-all"
                            >
                              <i className="fas fa-plus text-[8px]"></i> Novo Aviso
                            </button>
                          </div>
                        )}

                        {showAddNotice === event.id && (
                          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-brand/20 shadow-xl mb-4 animate-fade-in">
                            <textarea 
                              value={noticeText}
                              onChange={(e) => setNoticeText(e.target.value)}
                              placeholder="Digite o aviso..." 
                              className="w-full h-20 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-brand transition-all resize-none mb-4"
                            ></textarea>
                            <div className="flex gap-2">
                              <button onClick={() => { setShowAddNotice(null); setEditingNoticeId(null); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest">Cancelar</button>
                              <button onClick={() => handleSaveNotice(event.id)} className="flex-1 py-2 bg-brand text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">Postar</button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          {notices.map(notice => (
                            <div key={notice.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 relative animate-fade-in">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[8px] font-black text-brand uppercase tracking-widest">{notice.sender}</span>
                                <span className="text-[7px] font-bold text-slate-400 uppercase">{notice.time}</span>
                              </div>
                              <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{notice.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Escala - Centralizado no Viewport */}
      {showScaleModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md" onClick={() => setShowScaleModal(null)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl animate-fade-in border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Escala</h3>
                <button onClick={() => setShowScaleModal(null)} className="text-slate-400 hover:text-red-500"><i className="fas fa-times"></i></button>
             </div>
             <div className="space-y-5">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Culto</label>
                  <input value={scaleFormData.title} onChange={(e) => setScaleFormData({...scaleFormData, title: e.target.value})} type="text" placeholder="Ex: SANTA CEIA" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Data</label>
                    <input value={scaleFormData.date} onChange={(e) => setScaleFormData({...scaleFormData, date: e.target.value})} type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Hora</label>
                    <input value={scaleFormData.time} onChange={(e) => setScaleFormData({...scaleFormData, time: e.target.value})} type="time" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                </div>
             </div>
             <div className="flex gap-4 mt-8">
                <button onClick={() => setShowScaleModal(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[9px]">Cancelar</button>
                <button onClick={handleSaveScale} className="flex-1 py-4 bg-brand text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-brand/20">Salvar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListView;
