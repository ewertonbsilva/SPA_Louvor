
import React, { useState, useRef } from 'react';

const CleaningView: React.FC = () => {
  const [cleaningImage, setCleaningImage] = useState("https://picsum.photos/id/160/800/1000");
  const [isZoomed, setIsZoomed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCleaningImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 text-center relative">
        <div className="mb-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-brand/5 text-brand rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <i className="fas fa-broom text-2xl"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">Escala de Limpeza</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Manutenção e Zeladoria</p>
        </div>

        <div className="relative group overflow-hidden rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <img 
            src={cleaningImage} 
            alt="Escala de Limpeza" 
            className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
            <div className="flex gap-4">
              <button 
                onClick={() => setIsZoomed(true)}
                className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-brand hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
              >
                <i className="fas fa-search-plus mr-2"></i> Ampliar
              </button>
              <button 
                onClick={handleEditPhoto}
                className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-gold hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
              >
                <i className="fas fa-edit mr-2"></i> Trocar Foto
              </button>
            </div>
            <div className="text-white/60 font-black text-[8px] uppercase tracking-[0.3em] flex items-center gap-2">
              <i className="fas fa-info-circle text-brand"></i> Clique para gerenciar a escala
            </div>
          </div>
        </div>
        
        {/* Input Oculto para Upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />

        <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed max-w-lg mx-auto italic">
            "Pois zelamos pelo que é honesto, não só diante do Senhor, mas também diante dos homens." 
            <span className="block mt-2 font-black not-italic text-brand text-[10px] uppercase tracking-widest">2 Coríntios 8:21</span>
          </p>
        </div>

        <div className="mt-8 flex justify-center">
            <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-brand transition-all font-black text-[9px] uppercase tracking-widest">
              <i className="fas fa-print"></i> Imprimir Escala
            </button>
        </div>
      </div>

      {/* Modal de Zoom */}
      {isZoomed && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-fade-in" onClick={() => setIsZoomed(false)}>
          <button 
            className="absolute top-8 right-8 text-white hover:text-brand transition-colors text-3xl"
            onClick={() => setIsZoomed(false)}
          >
            <i className="fas fa-times"></i>
          </button>
          <img 
            src={cleaningImage} 
            alt="Zoom da Escala" 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default CleaningView;