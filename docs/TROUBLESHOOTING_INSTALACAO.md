# 🔧 Troubleshooting - Instalação do PWA

## Problema: "Instalar App" não aparece

### Causas Comuns:

1. **App já instalado**
   - Verifique se o app já está instalado no dispositivo
   - No Chrome: Menu (⋮) → "Mais ferramentas" → "Criar atalho"

2. **Navegador não suporta PWA**
   - Use Chrome, Edge, ou Safari (iOS 16.4+)
   - Firefox não mostra banner automático

3. **Critérios PWA não atendidos**
   - Precisa estar em HTTPS (ou localhost)
   - Precisa ter manifest.json válido
   - Precisa ter Service Worker registrado
   - Precisa ter ícones nos tamanhos corretos

---

## ✅ Como Forçar Instalação

### Chrome/Edge (Desktop):
1. Abra o site
2. Clique no ícone de instalação na barra de endereço (➕ ou ⬇️)
3. Ou: Menu (⋮) → "Instalar Louvor CEVD"

### Chrome (Android):
1. Abra o site
2. Menu (⋮) → "Adicionar à tela inicial"
3. Ou aguarde o banner automático aparecer

### Safari (iOS):
1. Abra o site no Safari
2. Toque no botão Compartilhar (□↑)
3. Role para baixo e toque em "Adicionar à Tela de Início"

---

## 🔍 Verificar se PWA está funcionando

### Chrome DevTools (F12):

1. **Application → Manifest**
   - Deve mostrar "Louvor CEVD"
   - Ícones devem aparecer (192x192 e 512x512)
   - Se houver erros, eles aparecerão aqui

2. **Application → Service Workers**
   - Deve mostrar "service-worker.js" como "activated and running"
   - Se não aparecer, há erro no registro

3. **Console**
   - Procure por erros em vermelho
   - Erros comuns:
     - "Failed to load manifest"
     - "Service worker registration failed"

---

## 🛠️ Soluções

### Solução 1: Limpar Cache e Recarregar

```
Chrome DevTools (F12)
→ Application
→ Storage
→ Clear site data
→ Recarregar página (Ctrl+Shift+R)
```

### Solução 2: Desregistrar Service Worker

```
Chrome DevTools (F12)
→ Application
→ Service Workers
→ Unregister
→ Recarregar página
```

### Solução 3: Verificar Manifest

Acesse diretamente: `http://seu-site/manifest.json`

Deve retornar JSON válido:
```json
{
  "name": "Louvor CEVD",
  "icons": [
    {
      "src": "icon.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Solução 4: Verificar HTTPS

PWAs só funcionam em:
- HTTPS (produção)
- localhost (desenvolvimento)
- 127.0.0.1 (desenvolvimento)

Se estiver usando IP local (ex: 192.168.x.x), pode não funcionar em alguns navegadores.

---

## 📱 Instalação Manual (Alternativa)

Se o banner não aparecer, você pode criar um atalho manualmente:

### Android:
1. Chrome → Menu → "Adicionar à tela inicial"
2. Edite o nome se quiser
3. Toque em "Adicionar"

### iOS:
1. Safari → Compartilhar → "Adicionar à Tela de Início"
2. Edite o nome
3. Toque em "Adicionar"

### Desktop:
1. Chrome → Menu (⋮) → "Mais ferramentas" → "Criar atalho"
2. Marque "Abrir como janela"
3. Clique em "Criar"

---

## 🔄 Após Atualização do Código

Se você atualizou o código e o app não mostra "Nova versão disponível":

1. **Feche completamente o app** (não apenas minimize)
2. **Reabra**
3. Aguarde alguns segundos
4. O toast deve aparecer

Se não aparecer:
1. Abra DevTools (F12)
2. Application → Service Workers
3. Clique em "Update"
4. Recarregue a página

---

## ⚠️ Problemas Conhecidos

### "Add to Home Screen" não aparece em HTTP local

**Causa**: Alguns navegadores só mostram o banner em HTTPS

**Solução**: 
- Use `localhost` em vez de IP (ex: `http://localhost:8080`)
- Ou instale manualmente via Menu

### Ícones não aparecem

**Causa**: Ícones não estão nos tamanhos corretos ou formato errado

**Solução**: 
- Certifique-se que `icon.png` existe
- Tamanhos requeridos: 192x192 e 512x512
- Formato: PNG

### Service Worker não registra

**Causa**: Erro no arquivo `service-worker.js`

**Solução**:
1. Abra Console (F12)
2. Procure erros em vermelho
3. Corrija o erro no arquivo
4. Recarregue

---

## 📞 Checklist de Diagnóstico

Use esta lista para identificar o problema:

- [ ] Estou usando Chrome, Edge ou Safari?
- [ ] O site está em HTTPS ou localhost?
- [ ] O arquivo `manifest.json` carrega sem erros?
- [ ] O arquivo `service-worker.js` está registrado?
- [ ] Os ícones `icon.png` e `Leão.ico` existem?
- [ ] Já tentei limpar cache e recarregar?
- [ ] Já tentei desregistrar o Service Worker?
- [ ] O app já está instalado (verificar lista de apps)?

Se todos os itens estão OK e ainda não funciona, tente instalação manual.
