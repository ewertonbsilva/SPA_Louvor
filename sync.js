/**
 * Gerenciador de Sincronização Offline (sync.js)
 * v2.0 - Adicionado suporte a Periodic Background Sync
 */

const SyncManager = {
    QUEUE_KEY: 'sync_queue',
    PERIODIC_TAG: 'update-louvor-data',

    // --- CÓDIGO ORIGINAL REFORMULADO ---
    addToQueue(data) {
        let queue = this.getQueue();
        queue.push({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            data: data
        });
        localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
        this.processQueue();
    },

    getQueue() {
        return JSON.parse(localStorage.getItem(this.QUEUE_KEY) || '[]');
    },

    async processQueue() {
        if (!navigator.onLine) return;
        let queue = this.getQueue();
        if (queue.length === 0) return;

        console.log(`🔄 Sincronizando ${queue.length} itens...`);
        const item = queue[0];
        console.log("📡 Enviando payload para o servidor:", item.data);
        try {
            const response = await fetch(APP_CONFIG.SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(item.data)
            });
            const res = await response.json();

            // Aceitar "success" ou remover item se der erro fatal para não travar a fila
            if (res.status === "success" || res.status === "error") {
                if (res.status === "error") console.error("Erro no servidor:", res.message);

                queue.shift();
                localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
                if (queue.length > 0) {
                    this.processQueue();
                } else {
                    console.log("Sincronização concluída!");
                    window.dispatchEvent(new CustomEvent('syncCompleted'));
                }
            } else {
                // Resposta desconhecida, remove para destravar fila
                console.warn("Resposta desconhecida, removendo item da fila:", res);
                queue.shift();
                localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
            }
        } catch (e) {
            console.log("❌ Falha na sincronização:", e);
            // Se for erro de sintaxe (JSON invalido do servidor) ou erro de script, remove item
            if (e.name === "SyntaxError" || (e.message && e.message.includes("Unexpected token"))) {
                queue.shift();
                localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
            }
        }
    },

    // --- NOVA LÓGICA: PERIODIC BACKGROUND SYNC ---

    /**
     * Registra a sincronização periódica no navegador
     */
    async registerPeriodicSync() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;

                // Verifica se o navegador suporta periodicSync
                if ('periodicSync' in registration) {
                    try {
                        await registration.periodicSync.register(this.PERIODIC_TAG, {
                            minInterval: 12 * 60 * 60 * 1000 // 12 horas
                        });
                        console.log("Periodic Sync registrado!");
                    } catch (error) {
                        console.log("Periodic Sync não pôde ser registrado: ", error);
                    }
                }
            } catch (e) {
                console.log("Service Worker não está pronto.");
            }
        }
    },

    /**
     * Método chamado pelo Service Worker para atualizar o cache
     * Esta função deve ser exportada ou acessível pelo worker
     */
    async performFullFetch() {
        console.log("Executando fetch completo em segundo plano...");
        try {
            const endpoints = [
                { key: 'offline_escala', sheet: 'Transformar' },
                { key: 'offline_repertorio', sheet: 'Repertorio_PWA' },
                { key: 'offline_musicas', sheet: 'Musicas' },
                { key: 'offline_lembretes', sheet: 'Lembretes' },
                { key: 'offline_consagracao', sheet: 'Consagração' },
                { key: 'offline_chamada', sheet: 'Comp_Cons' }
            ];

            for (const item of endpoints) {
                const res = await fetch(`${APP_CONFIG.SCRIPT_URL}?sheet=${item.sheet}`);
                const json = await res.json();
                localStorage.setItem(item.key, JSON.stringify(json.data));
            }

            localStorage.setItem('last_full_sync', new Date().toISOString());
            return true;
        } catch (e) {
            return false;
        }
    },

    // Helper original mantido
    updateLocalCache(sheet, action, payload) {
        // ... (seu código de updateLocalCache original permanece igual)
    }
};

// Monitora volta da conexão
window.addEventListener('online', () => SyncManager.processQueue());

// Inicialização
window.addEventListener('load', () => {
    SyncManager.processQueue();
    // Tenta registrar o periodic sync sempre que o app carregar
    SyncManager.registerPeriodicSync();
});