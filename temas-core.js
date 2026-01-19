/**
 * Gerenciador de Temas Mensais - Louvor CEVD
 * Cores baseadas em campanhas de saúde e meses temáticos.
 */

// Mapeamento de Cores para cada mês
const temaPadrao = {
    nome: "Padrão",
    primary: "#000000",      // Black
    secondary: "#000000",    // Black
    accent: "#000000",       // Black
    bg: "#ffffff",           // White
    success: "#000000",      // Black
    danger: "#ef4444",       // Red (Keep for errors)
    warning: "#eab308",      // Yellow (Keep for warnings)
    muted: "#666666",        // Gray
    headerBg: "rgba(255, 255, 255, 0.98)"
};

function aplicarTemaAtual() {
    // Always apply Standard Theme
    const tema = temaPadrao;
    const root = document.documentElement;

    root.style.setProperty('--primary', tema.primary);
    root.style.setProperty('--secondary', tema.secondary);
    root.style.setProperty('--accent', tema.accent);
    root.style.setProperty('--bg', tema.bg);

    root.style.setProperty('--color-success', tema.success);
    root.style.setProperty('--color-danger', tema.danger);
    root.style.setProperty('--color-warning', tema.warning);
    root.style.setProperty('--text-muted', tema.muted);

    root.style.setProperty('--header-bg', tema.headerBg);

    localStorage.setItem('tema_atual_nome', tema.nome);

    // Background Image Logic - Check if specific month logic is still desired?
    // User said "não quero mais usar as paleta de cores por mes", but didn't explicitly kill the background logic.
    // However, "vamos deixa a cor padrão" implies standardizing.
    // I will keep the background image logic if it exists, or defaults to Jan if simplified. 
    // Actually, let's keep the background dynamic (jan.png etc) if they want, or just remove it?
    // "tinha feito uma maneira da primeira tela fica fixa... quando a resolução..."
    // Given "não quero mais usar as paleta de cores por mes", I will keep the previous "ano novo" background logic or just white?
    // I will assume they might still want the background images since they just asked for it. I'll keep the background image logic but with the standard black colors.

    const mesAtual = new Date().getMonth();
    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const imgNome = meses[mesAtual] + ".png";
    const imgPath = `assets/fundo/${imgNome}`;

    document.body.style.backgroundImage = `url('${imgPath}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";

    console.log(`%c Tema Padrão Aplicado | Fundo: ${imgNome} `, `background: #000; color: #fff; padding: 4px; border-radius: 4px;`);
}

document.addEventListener('DOMContentLoaded', aplicarTemaAtual);
aplicarTemaAtual();