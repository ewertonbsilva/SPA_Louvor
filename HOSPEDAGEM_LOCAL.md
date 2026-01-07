# Como Hospedar o PWA Localmente via HTTP

## Por que hospedar localmente?

Quando o PWA está hospedado em HTTPS (como GitHub Pages) e você tenta acessar um dispositivo local via HTTP (como `http://10.10.10.2`), o navegador bloqueia por segurança ("Mixed Content"). 

Para resolver isso, você pode hospedar o PWA localmente via HTTP.

## Opção 1: Usar Python (Mais Simples)

### Passo 1: Instalar Python
- Baixe em: https://www.python.org/downloads/
- Durante instalação, marque "Add Python to PATH"

### Passo 2: Abrir PowerShell na pasta do projeto
```powershell
cd C:\Users\CBMAC\Desktop\Louvor
```

### Passo 3: Iniciar servidor HTTP
```powershell
python -m http.server 8080
```

### Passo 4: Acessar no navegador
- Abra: `http://localhost:8080`
- Ou pelo IP da máquina na rede local: `http://192.168.X.X:8080`

**Para descobrir seu IP:**
```powershell
ipconfig
```
Procure por "Endereço IPv4" na seção da sua rede (WiFi ou Ethernet).

---

## Opção 2: Usar Node.js (http-server)

### Passo 1: Instalar Node.js
- Baixe em: https://nodejs.org/

### Passo 2: Instalar http-server
```powershell
npm install -g http-server
```

### Passo 3: Iniciar servidor
```powershell
cd C:\Users\CBMAC\Desktop\Louvor
http-server -p 8080
```

### Passo 4: Acessar
- `http://localhost:8080`
- Ou `http://SEU_IP:8080`

---

## Opção 3: IIS (Windows Server/Pro)

Se você tem Windows Pro ou Server:

1. Painel de Controle → Programas → Ativar/Desativar recursos do Windows
2. Marque "Serviços de Informações da Internet (IIS)"
3. Instale
4. Abra "Gerenciador do IIS"
5. Adicione novo site apontando para `C:\Users\CBMAC\Desktop\Louvor`
6. Configure porta (ex: 8080)
7. Acesse via `http://localhost:8080`

---

## Configurar para Acesso na Rede Local

### 1. Liberar Firewall do Windows
```powershell
# Execute como Administrador
New-NetFirewallRule -DisplayName "PWA Louvor HTTP" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

### 2. Descobrir IP da máquina
```powershell
ipconfig
```

### 3. Acessar de outros dispositivos
No celular/tablet, acesse:
```
http://192.168.X.X:8080
```
(Substitua pelo IP real da sua máquina)

---

## Manter Servidor Rodando Sempre

### Windows - Criar Tarefa Agendada

1. Abra "Agendador de Tarefas"
2. Criar Tarefa Básica
3. Nome: "PWA Louvor Server"
4. Disparador: "Ao fazer logon"
5. Ação: "Iniciar programa"
   - Programa: `python.exe`
   - Argumentos: `-m http.server 8080`
   - Iniciar em: `C:\Users\CBMAC\Desktop\Louvor`
6. Marque "Executar com privilégios mais altos"

---

## Testar Mixed Content

Depois de hospedar localmente:

1. Acesse `http://SEU_IP:8080`
2. Faça login
3. Clique em "Acesso a Mesa"
4. O iframe `http://10.10.10.2` deve carregar sem problemas

---

## Observações

- **HTTP vs HTTPS**: HTTP local não tem as mesmas proteções de segurança do HTTPS
- **Rede Local**: Certifique-se que o celular/tablet está na mesma rede WiFi
- **Wake Lock**: Funciona melhor em HTTPS, mas deve funcionar em HTTP local também
- **Service Worker**: Pode ter limitações em HTTP (funciona melhor em HTTPS ou localhost)

---

## Alternativa: Usar HTTPS Local (Avançado)

Se quiser manter HTTPS localmente:

1. Gerar certificado SSL auto-assinado
2. Configurar servidor HTTPS
3. Aceitar certificado no navegador

Mas isso é mais complexo e não resolve o problema do `http://10.10.10.2` (a mesa de som).
