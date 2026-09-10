# Conferência manual — amostra

Semente: `secbench-ts/conferencia-manual/2026-09-10`. População (classificações do resultado principal): 454. Amostrados: 102 (22.5%).

| Estrato | População | Amostra |
| --- | ---: | ---: |
| antigravity / falso-negativo | 30 | 6 |
| claude-code / falso-negativo | 1 | 1 |
| claude-code / fora-de-escopo | 23 | 5 |
| claude-code / redundante | 7 | 2 |
| claude-code / verdadeiro-positivo | 29 | 6 |
| codeql / falso-negativo | 19 | 4 |
| codeql / falso-positivo-par | 3 | 1 |
| codeql / fora-de-escopo | 11 | 3 |
| codeql / redundante | 2 | 1 |
| codeql / verdadeiro-positivo | 11 | 3 |
| cursor / falso-negativo | 2 | 1 |
| cursor / fora-de-escopo | 36 | 8 |
| cursor / redundante | 9 | 2 |
| cursor / verdadeiro-positivo | 28 | 6 |
| eslint / falso-negativo | 30 | 6 |
| eslint / nao-mapeado | 75 | 15 |
| njsscan / falso-negativo | 25 | 5 |
| njsscan / fora-de-escopo | 43 | 9 |
| njsscan / redundante | 1 | 1 |
| njsscan / verdadeiro-positivo | 5 | 1 |
| semgrep / falso-negativo | 26 | 6 |
| semgrep / falso-positivo-par | 1 | 1 |
| semgrep / fora-de-escopo | 32 | 7 |
| semgrep / nao-mapeado | 1 | 1 |
| semgrep / verdadeiro-positivo | 4 | 1 |

## Itens

### antigravity#falso-negativo#304#modules/users/routes/store-document.ts:23:sem-cwe

- Instrumento: antigravity; categoria atribuída: **falso-negativo**
- Achado: `modules/users/routes/store-document.ts:23` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-327-02-V (CWE-327), sink=23, intervalo=[20,23], equivalência=CWE-327/CWE-326/CWE-916
- Casos no arquivo:
  - C-327-02-V vulnerable CWE-327 sink=23 intervalo=[20,23] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
  21|     const cipher = createCipheriv(algorithm, key, null)
  22|     const updated = cipher.update(document, 'utf8')
  23|     const encrypted = Buffer.concat([updated, cipher.final()]).toString('hex')
  24|     return reply.send(presentCipherPayload(encrypted))
  25|   })
```

### antigravity#falso-negativo#299#modules/users/routes/profile-validate.ts:28:sem-cwe

- Instrumento: antigravity; categoria atribuída: **falso-negativo**
- Achado: `modules/users/routes/profile-validate.ts:28` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-1333-01-V (CWE-1333), sink=28, intervalo=[25,28], equivalência=CWE-1333/CWE-400
- Casos no arquivo:
  - C-1333-01-V vulnerable CWE-1333 sink=28 intervalo=[25,28] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
  26|     const input = String(tradeName)
  27|     const trimmedInput = input
  28|     const ok = pattern.test(trimmedInput)
  29|     return reply.send(withEntityMeta({ ok, patternSource: pattern.source }))
  30|   })
```

### antigravity#falso-negativo#314#modules/integrations/routes/dispatch.ts:26:sem-cwe

- Instrumento: antigravity; categoria atribuída: **falso-negativo**
- Achado: `modules/integrations/routes/dispatch.ts:26` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-798-01-V (CWE-798), sink=26, intervalo=[25,26], equivalência=CWE-798/CWE-259/CWE-321
- Casos no arquivo:
  - C-798-01-V vulnerable CWE-798 sink=26 intervalo=[25,26] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
  24|     const body = request.body as { message?: string }
  25|     const embeddedKey = 'loja-live-key-9f3a2c1b0e7d'
  26|     const apiKey = embeddedKey
  27|     return reply.send(presentIntegrationResult('dispatched', apiKey, body.message ?? ''))
  28|   })
```

### antigravity#falso-negativo#297#modules/reports/routes/formula.ts:133:sem-cwe

- Instrumento: antigravity; categoria atribuída: **falso-negativo**
- Achado: `modules/reports/routes/formula.ts:133` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-094-01-V (CWE-94), sink=133, intervalo=[133,133], equivalência=CWE-94/CWE-95
- Casos no arquivo:
  - C-094-01-V vulnerable CWE-94 sink=133 intervalo=[133,133] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
 131|       quantidade?: number
 132|     })
 133|     const fn = new Function('total', 'quantidade', 'return (' + inputs.expression + ')')
 134|     const result = fn(inputs.total, inputs.quantidade)
 135|     return reply.send(presentReportResult(inputs, result))
```

### antigravity#falso-negativo#302#modules/system/routes/purge.ts:8:sem-cwe

- Instrumento: antigravity; categoria atribuída: **falso-negativo**
- Achado: `modules/system/routes/purge.ts:8` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-306-01-V (CWE-306), sink=8, intervalo=[8,10], equivalência=CWE-306/CWE-287
- Casos no arquivo:
  - C-306-01-V vulnerable CWE-306 sink=8 intervalo=[8,10] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
   6|   app.post('/system/maintenance/purge', async (_request, reply) => {
   7|     const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
   8|     const removed = await Order.destroy({
   9|       where: { status: 'cancelled', createdAt: { [Op.lt]: cutoff } },
  10|     })
```

### antigravity#falso-negativo#301#modules/users/routes/admin-users.ts:6:sem-cwe

- Instrumento: antigravity; categoria atribuída: **falso-negativo**
- Achado: `modules/users/routes/admin-users.ts:6` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-284-01-V (CWE-284), sink=6, intervalo=[6,6], equivalência=CWE-284/CWE-285/CWE-639/CWE-862
- Casos no arquivo:
  - C-284-01-V vulnerable CWE-284 sink=6 intervalo=[6,6] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
   4| export async function registerAdminUsers(app: FastifyInstance): Promise<void> {
   5|   app.get('/admin/users', { preHandler: [app.authenticate] }, async (_request, reply) => {
   6|     const users = await User.findAll({ attributes: ['id', 'email', 'role'] })
   7|     return reply.send({
   8|       users: users.map((u) => ({ id: u.id, email: u.email, role: u.role })),
```

### claude-code#falso-negativo#378#modules/integrations/routes/timing-parse.ts:7:sem-cwe

- Instrumento: claude-code; categoria atribuída: **falso-negativo**
- Achado: `modules/integrations/routes/timing-parse.ts:7` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-1104-01-V (CWE-1104), sink=7, intervalo=[7,7], equivalência=CWE-1104/CWE-1395
- Casos no arquivo:
  - C-1104-01-V vulnerable CWE-1104 sink=7 intervalo=[7,7] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
   5|   app.post('/integrations/timing/parse', { preHandler: [app.authenticate] }, async (request, reply) => {
   6|     const value = String((request.body as { value?: string }).value ?? '')
   7|     const millis = moment(value).valueOf()
   8|     if (!Number.isFinite(millis)) {
   9|       return reply.code(400).send({ error: 'invalid schedule' })
```

### claude-code#fora-de-escopo#376#modules/users/routes/save-document.ts:21:CWE-798

- Instrumento: claude-code; categoria atribuída: **fora-de-escopo**
- Achado: `modules/users/routes/save-document.ts:21` cwe=CWE-798 regra=assistant-finding
- Mensagem: Chave de criptografia padrão embutida como fallback
- Casos no arquivo:
  - C-327-02-S safe CWE-327 sink=26 intervalo=[24,26] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  19|     const document = String((request.body as { document?: string }).document ?? '')
  20|     const env = loadEnv()
  21|     const keyMaterial = env.documentKey ?? '0123456789abcdef0123456789abcdef'
  22|     const key = Buffer.from(keyMaterial).subarray(0, 32)
  23|     const iv = randomBytes(12)
```

### claude-code#fora-de-escopo#367#modules/orders/routes/search-orders.ts:27:CWE-89

- Instrumento: claude-code; categoria atribuída: **fora-de-escopo**
- Achado: `modules/orders/routes/search-orders.ts:27` cwe=CWE-89 regra=assistant-finding
- Mensagem: Injecao de SQL no filtro de status de pedidos
- Casos no arquivo:
  - C-089-01-V vulnerable CWE-89 sink=33 intervalo=[27,33] janelaVP=false janelaProtegido=true cweEquivalente=true
- Trecho:
```
  25|     const userId = request.user!.id
  26|     const status = String((request.query as { status?: string }).status ?? '')
  27|     const statusLiteral = "'" + status + "'"
  28|     const sql =
  29|       "SELECT id, status, total, trackingCode FROM Orders WHERE userId = " +
```

### claude-code#fora-de-escopo#335#modules/files/routes/upload.ts:34:CWE-22

- Instrumento: claude-code; categoria atribuída: **fora-de-escopo**
- Achado: `modules/files/routes/upload.ts:34` cwe=CWE-22 regra=assistant-finding
- Mensagem: Nome de arquivo enviado pelo cliente usado sem sanitizacao
- Casos no arquivo:
  - C-434-01-V vulnerable CWE-434 sink=35 intervalo=[34,35] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  32|     if (buf.length > 64 * 1024) return reply.code(400).send({ error: 'too large' })
  33|     const content = normalizeUploadBuffer(buf)
  34|     const target = path.join(process.cwd(), UPLOAD_DIR, file.filename)
  35|     await fs.writeFile(target, content)
  36|     return reply.send(buildStoreMeta(file.filename, content))
```

### claude-code#fora-de-escopo#350#modules/users/routes/save-document.ts:21:CWE-1188

- Instrumento: claude-code; categoria atribuída: **fora-de-escopo**
- Achado: `modules/users/routes/save-document.ts:21` cwe=CWE-1188 regra=assistant-finding
- Mensagem: Chave de criptografia com valor padrao embutido
- Casos no arquivo:
  - C-327-02-S safe CWE-327 sink=26 intervalo=[24,26] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  19|     const document = String((request.body as { document?: string }).document ?? '')
  20|     const env = loadEnv()
  21|     const keyMaterial = env.documentKey ?? '0123456789abcdef0123456789abcdef'
  22|     const key = Buffer.from(keyMaterial).subarray(0, 32)
  23|     const iv = randomBytes(12)
```

### claude-code#fora-de-escopo#363#modules/files/routes/invoice-document.ts:20:CWE-639

- Instrumento: claude-code; categoria atribuída: **fora-de-escopo**
- Achado: `modules/files/routes/invoice-document.ts:20` cwe=CWE-639 regra=assistant-finding
- Mensagem: Documento de fatura acessivel sem checagem de dono
- Casos no arquivo:
  - C-022-02-S safe CWE-22 sink=36 intervalo=[23,36] janelaVP=false janelaProtegido=true cweEquivalente=false
- Trecho:
```
  18|     const id = Number((request.params as { id: string }).id)
  19|     const override = (request.query as { override?: string }).override
  20|     const invoice = await Invoice.findByPk(id)
  21|     if (!invoice) return reply.code(404).send({ error: 'not found' })
  22|     const base = path.resolve(process.cwd(), UPLOAD_DIR)
```

### claude-code#redundante#374#modules/auth/routes/token.ts:31:CWE-798

- Instrumento: claude-code; categoria atribuída: **redundante**
- Achado: `modules/auth/routes/token.ts:31` cwe=CWE-798 regra=assistant-finding
- Mensagem: Segredo JWT padrão embutido no código
- Caso atribuído: C-798-02-V (CWE-798), sink=33, intervalo=[29,33], equivalência=CWE-798/CWE-259/CWE-321
- Casos no arquivo:
  - C-798-02-V vulnerable CWE-798 sink=33 intervalo=[29,33] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  29|     const fallbackSecret = 'dev-secret-please-change'
  30|     const envSecret = process.env.JWT_SECRET
  31|     const secret = envSecret ?? fallbackSecret
  32|     const claims = { id: user.id, email: user.email, role: user.role }
  33|     const token = signToken(claims, secret)
```

### claude-code#redundante#368#modules/auth/routes/register.ts:30:CWE-916

- Instrumento: claude-code; categoria atribuída: **redundante**
- Achado: `modules/auth/routes/register.ts:30` cwe=CWE-916 regra=assistant-finding
- Mensagem: Senha armazenada com hash MD5 sem sal
- Caso atribuído: C-327-01-V (CWE-327), sink=32, intervalo=[29,32], equivalência=CWE-327/CWE-326/CWE-916
- Casos no arquivo:
  - C-327-01-V vulnerable CWE-327 sink=32 intervalo=[29,32] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  28|     const password = String(body.password ?? '')
  29|     const algorithm = 'md5'
  30|     const hash = createHash(algorithm)
  31|     const digestEncoding = 'hex'
  32|     const passwordHash = hash.update(password).digest(digestEncoding)
```

### claude-code#verdadeiro-positivo#331#modules/system/routes/purge.ts:6:CWE-306

- Instrumento: claude-code; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/system/routes/purge.ts:6` cwe=CWE-306 regra=assistant-finding
- Mensagem: Rota destrutiva de manutencao sem autenticacao
- Caso atribuído: C-306-01-V (CWE-306), sink=8, intervalo=[8,10], equivalência=CWE-306/CWE-287
- Casos no arquivo:
  - C-306-01-V vulnerable CWE-306 sink=8 intervalo=[8,10] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
   4| 
   5| export async function registerPurge(app: FastifyInstance): Promise<void> {
   6|   app.post('/system/maintenance/purge', async (_request, reply) => {
   7|     const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
   8|     const removed = await Order.destroy({
```

### claude-code#verdadeiro-positivo#351#modules/orders/routes/preview.ts:29:CWE-79

- Instrumento: claude-code; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/orders/routes/preview.ts:29` cwe=CWE-79 regra=assistant-finding
- Mensagem: XSS refletido no preview de pedidos
- Caso atribuído: C-079-02-V (CWE-79), sink=30, intervalo=[27,30], equivalência=CWE-79/CWE-80
- Casos no arquivo:
  - C-079-02-V vulnerable CWE-79 sink=30 intervalo=[27,30] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  27|     const kind = 'preview'
  28|     const displayTerm = term
  29|     const html = buildSearchShell(kind, displayTerm, count)
  30|     return reply.type('text/html').send(html)
  31|   })
```

### claude-code#verdadeiro-positivo#339#modules/auth/routes/register.ts:29:CWE-916

- Instrumento: claude-code; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/auth/routes/register.ts:29` cwe=CWE-916 regra=assistant-finding
- Mensagem: Senha armazenada com hash MD5 sem salt
- Caso atribuído: C-327-01-V (CWE-327), sink=32, intervalo=[29,32], equivalência=CWE-327/CWE-326/CWE-916
- Casos no arquivo:
  - C-327-01-V vulnerable CWE-327 sink=32 intervalo=[29,32] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  27|     const email = String(body.email ?? '')
  28|     const password = String(body.password ?? '')
  29|     const algorithm = 'md5'
  30|     const hash = createHash(algorithm)
  31|     const digestEncoding = 'hex'
```

### claude-code#verdadeiro-positivo#323#modules/orders/routes/search-orders.ts:33:CWE-89

- Instrumento: claude-code; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/orders/routes/search-orders.ts:33` cwe=CWE-89 regra=assistant-finding
- Mensagem: SQL Injection na busca de pedidos por status
- Caso atribuído: C-089-01-V (CWE-89), sink=33, intervalo=[27,33], equivalência=CWE-89/CWE-943
- Casos no arquivo:
  - C-089-01-V vulnerable CWE-89 sink=33 intervalo=[27,33] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  31|       " AND status = " +
  32|       statusLiteral
  33|     const [rows] = await getSequelize().query(sql)
  34|     return reply.send(withEntityMeta({ orders: rows }))
  35|   })
```

### claude-code#verdadeiro-positivo#349#modules/users/routes/store-document.ts:20:CWE-327

- Instrumento: claude-code; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/users/routes/store-document.ts:20` cwe=CWE-327 regra=assistant-finding
- Mensagem: Uso do modo de cifra ECB
- Caso atribuído: C-327-02-V (CWE-327), sink=23, intervalo=[20,23], equivalência=CWE-327/CWE-326/CWE-916
- Casos no arquivo:
  - C-327-02-V vulnerable CWE-327 sink=23 intervalo=[20,23] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  18|     const document = String((request.body as { document?: string }).document ?? '')
  19|     const key = createHash('md5').update('loja-doc-key').digest()
  20|     const algorithm = 'aes-128-ecb'
  21|     const cipher = createCipheriv(algorithm, key, null)
  22|     const updated = cipher.update(document, 'utf8')
```

### claude-code#verdadeiro-positivo#320#modules/users/routes/import-preferences.ts:25:CWE-502

- Instrumento: claude-code; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/users/routes/import-preferences.ts:25` cwe=CWE-502 regra=assistant-finding
- Mensagem: Desserializacao insegura com node-serialize
- Caso atribuído: C-502-01-V (CWE-502), sink=25, intervalo=[24,25], equivalência=CWE-502/CWE-915
- Casos no arquivo:
  - C-502-01-V vulnerable CWE-502 sink=25 intervalo=[24,25] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  23|     const decoded = Buffer.from(data, 'base64').toString('utf8')
  24|     const serialized = decoded
  25|     const prefs = serialize.unserialize(serialized)
  26|     return reply.send(presentPreferences(prefs))
  27|   })
```

### codeql#falso-negativo#284#modules/orders/routes/payment.ts:31:sem-cwe

- Instrumento: codeql; categoria atribuída: **falso-negativo**
- Achado: `modules/orders/routes/payment.ts:31` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-532-02-V (CWE-532), sink=31, intervalo=[29,31], equivalência=CWE-532/CWE-200
- Casos no arquivo:
  - C-532-02-V vulnerable CWE-532 sink=31 intervalo=[29,31] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
  29|     const logPayload = { payment: body, orderId: id }
  30|     const logMessage = 'payment received'
  31|     request.log.info(logPayload, logMessage)
  32|     order.status = 'paid'
  33|     await order.save()
```

### codeql#falso-negativo#273#modules/integrations/routes/timing-parse.ts:7:sem-cwe

- Instrumento: codeql; categoria atribuída: **falso-negativo**
- Achado: `modules/integrations/routes/timing-parse.ts:7` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-1104-01-V (CWE-1104), sink=7, intervalo=[7,7], equivalência=CWE-1104/CWE-1395
- Casos no arquivo:
  - C-1104-01-V vulnerable CWE-1104 sink=7 intervalo=[7,7] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
   5|   app.post('/integrations/timing/parse', { preHandler: [app.authenticate] }, async (request, reply) => {
   6|     const value = String((request.body as { value?: string }).value ?? '')
   7|     const millis = moment(value).valueOf()
   8|     if (!Number.isFinite(millis)) {
   9|       return reply.code(400).send({ error: 'invalid schedule' })
```

### codeql#falso-negativo#279#modules/auth/routes/recovery-request.ts:11:sem-cwe

- Instrumento: codeql; categoria atribuída: **falso-negativo**
- Achado: `modules/auth/routes/recovery-request.ts:11` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-338-01-V (CWE-338), sink=11, intervalo=[9,13], equivalência=CWE-338/CWE-330
- Casos no arquivo:
  - C-338-01-V vulnerable CWE-338 sink=11 intervalo=[9,13] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
   9|     let token = ''
  10|     while (token.length < 32) {
  11|       token += Math.random().toString(36).slice(2)
  12|     }
  13|     token = token.slice(0, 32)
```

### codeql#falso-negativo#272#modules/orders/routes/preview.ts:30:sem-cwe

- Instrumento: codeql; categoria atribuída: **falso-negativo**
- Achado: `modules/orders/routes/preview.ts:30` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-079-02-V (CWE-79), sink=30, intervalo=[27,30], equivalência=CWE-79/CWE-80
- Casos no arquivo:
  - C-079-02-V vulnerable CWE-79 sink=30 intervalo=[27,30] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
  28|     const displayTerm = term
  29|     const html = buildSearchShell(kind, displayTerm, count)
  30|     return reply.type('text/html').send(html)
  31|   })
  32| }
```

### codeql#falso-positivo-par#268#modules/auth/routes/return-path.ts:40:CWE-601

- Instrumento: codeql; categoria atribuída: **falso-positivo-par**
- Achado: `modules/auth/routes/return-path.ts:40` cwe=CWE-601 regra=js/server-side-unvalidated-url-redirection
- Mensagem: Untrusted URL redirection depends on a [user-provided value](1).
- Caso atribuído: C-601-01-S (CWE-601), sink=40, intervalo=[39,40], equivalência=CWE-601
- Casos no arquivo:
  - C-601-01-S safe CWE-601 sink=40 intervalo=[39,40] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  38|     const next = normalizeNextParam((request.query as { next?: string }).next)
  39|     const target = isRelativePath(next) ? next : DEFAULT_REDIRECT
  40|     return reply.redirect(describeRedirect(target).target)
  41|   })
  42| }
```

### codeql#fora-de-escopo#255#modules/files/routes/attach.ts:37:CWE-770

- Instrumento: codeql; categoria atribuída: **fora-de-escopo**
- Achado: `modules/files/routes/attach.ts:37` cwe=CWE-770 regra=js/missing-rate-limiting
- Mensagem: This route handler performs [a file system access](1), but is not rate-limited.
- Casos no arquivo:
  - C-434-01-S safe CWE-434 sink=53 intervalo=[51,53] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
  35| 
  36| export async function registerAttach(app: FastifyInstance): Promise<void> {
  37|   app.post('/files/attach', { preHandler: [app.authenticate] }, async (request, reply) => {
  38|     const file = await request.file()
  39|     if (!file) return reply.code(400).send({ error: 'missing file' })
```

### codeql#fora-de-escopo#264#modules/system/routes/diagnostics.ts:27:CWE-770

- Instrumento: codeql; categoria atribuída: **fora-de-escopo**
- Achado: `modules/system/routes/diagnostics.ts:27` cwe=CWE-770 regra=js/missing-rate-limiting
- Mensagem: This route handler performs [a system command](1), but is not rate-limited.
- Casos no arquivo:
  - C-078-02-V vulnerable CWE-78 sink=31 intervalo=[29,31] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  25| 
  26| export async function registerDiagnostics(app: FastifyInstance): Promise<void> {
  27|   app.get('/system/diagnostics', { preHandler: [app.authenticate] }, async (request, reply) => {
  28|     const host = String((request.query as { host?: string }).host ?? '')
  29|     const prefix = 'echo reachability-check '
```

### codeql#fora-de-escopo#261#modules/reports/routes/convert-report.ts:29:CWE-770

- Instrumento: codeql; categoria atribuída: **fora-de-escopo**
- Achado: `modules/reports/routes/convert-report.ts:29` cwe=CWE-770 regra=js/missing-rate-limiting
- Mensagem: This route handler performs [a system command](1), but is not rate-limited.
- Casos no arquivo:
  - C-078-01-V vulnerable CWE-78 sink=35 intervalo=[33,35] janelaVP=false janelaProtegido=true cweEquivalente=false
- Trecho:
```
  27| 
  28| export async function registerConvertReport(app: FastifyInstance): Promise<void> {
  29|   app.post('/reports/convert', { preHandler: [app.authenticate] }, async (request, reply) => {
  30|     const fileName = String((request.body as { fileName?: string }).fileName ?? '')
  31|     const dir = path.join(process.cwd(), REPORTS_DIR)
```

### codeql#redundante#244#modules/users/routes/profile-validate.ts:28:CWE-1333

- Instrumento: codeql; categoria atribuída: **redundante**
- Achado: `modules/users/routes/profile-validate.ts:28` cwe=CWE-1333 regra=js/polynomial-redos
- Mensagem: This [regular expression](1) that depends on [a user-provided value](2) may run slow on strings with many repetitions of '0'.
- Caso atribuído: C-1333-01-V (CWE-1333), sink=28, intervalo=[25,28], equivalência=CWE-1333/CWE-400
- Casos no arquivo:
  - C-1333-01-V vulnerable CWE-1333 sink=28 intervalo=[25,28] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  26|     const input = String(tradeName)
  27|     const trimmedInput = input
  28|     const ok = pattern.test(trimmedInput)
  29|     return reply.send(withEntityMeta({ ok, patternSource: pattern.source }))
  30|   })
```

### codeql#verdadeiro-positivo#250#modules/integrations/routes/feed-fetch.ts:35:CWE-918

- Instrumento: codeql; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/integrations/routes/feed-fetch.ts:35` cwe=CWE-918 regra=js/request-forgery
- Mensagem: The [URL](1) of this request depends on a [user-provided value](2).
- Caso atribuído: C-918-01-V (CWE-918), sink=35, intervalo=[35,35], equivalência=CWE-918
- Casos no arquivo:
  - C-918-01-V vulnerable CWE-918 sink=35 intervalo=[35,35] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  33|   app.post('/integrations/feed/fetch', { preHandler: [app.authenticate] }, async (request, reply) => {
  34|     const url = String((request.body as { url?: string }).url ?? '')
  35|     const res = await fetch(url)
  36|     const text = await res.text()
  37|     return reply.send(buildFeedPayload(res.status, text))
```

### codeql#verdadeiro-positivo#243#modules/users/routes/profile-validate.ts:25:CWE-1333

- Instrumento: codeql; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/users/routes/profile-validate.ts:25` cwe=CWE-1333 regra=js/redos
- Mensagem: This part of the regular expression may cause exponential backtracking on strings containing many repetitions of '0'.
- Caso atribuído: C-1333-01-V (CWE-1333), sink=28, intervalo=[25,28], equivalência=CWE-1333/CWE-400
- Casos no arquivo:
  - C-1333-01-V vulnerable CWE-1333 sink=28 intervalo=[25,28] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  23|   app.post('/users/profile/validate', { preHandler: [app.authenticate] }, async (request, reply) => {
  24|     const tradeName = String((request.body as { tradeName?: string }).tradeName ?? '')
  25|     const pattern = /^([a-zA-Z0-9]+)+$/
  26|     const input = String(tradeName)
  27|     const trimmedInput = input
```

### codeql#verdadeiro-positivo#254#modules/system/routes/diagnostics.ts:31:CWE-78

- Instrumento: codeql; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/system/routes/diagnostics.ts:31` cwe=CWE-78 regra=js/command-line-injection
- Mensagem: This command line depends on a [user-provided value](1).
- Caso atribuído: C-078-02-V (CWE-78), sink=31, intervalo=[29,31], equivalência=CWE-78/CWE-77/CWE-88
- Casos no arquivo:
  - C-078-02-V vulnerable CWE-78 sink=31 intervalo=[29,31] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  29|     const prefix = 'echo reachability-check '
  30|     const cmd = prefix + host
  31|     const { stdout, stderr } = await execAsync(cmd)
  32|     return reply.send(withEntityMeta({ output: stdout || stderr }))
  33|   })
```

### cursor#falso-negativo#453#modules/files/routes/upload.ts:35:sem-cwe

- Instrumento: cursor; categoria atribuída: **falso-negativo**
- Achado: `modules/files/routes/upload.ts:35` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-434-01-V (CWE-434), sink=35, intervalo=[34,35], equivalência=CWE-434
- Casos no arquivo:
  - C-434-01-V vulnerable CWE-434 sink=35 intervalo=[34,35] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 34 cwe=CWE-22 (run1) Path traversal no nome do upload
  - linha 34 cwe=CWE-22 (run2) Path traversal no nome do upload
  - linha 34 cwe=CWE-22 (run3) Path traversal no upload
- Trecho:
```
  33|     const content = normalizeUploadBuffer(buf)
  34|     const target = path.join(process.cwd(), UPLOAD_DIR, file.filename)
  35|     await fs.writeFile(target, content)
  36|     return reply.send(buildStoreMeta(file.filename, content))
  37|   })
```

### cursor#fora-de-escopo#445#modules/auth/routes/reset-request.ts:13:CWE-200

- Instrumento: cursor; categoria atribuída: **fora-de-escopo**
- Achado: `modules/auth/routes/reset-request.ts:13` cwe=CWE-200 regra=assistant-finding
- Mensagem: Token de reset devolvido na resposta
- Casos no arquivo:
  - C-338-01-S safe CWE-338 sink=10 intervalo=[10,10] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  11|     user.resetToken = token
  12|     await user.save()
  13|     return reply.send({ requested: true, token })
  14|   })
  15| }
```

### cursor#fora-de-escopo#397#modules/users/routes/save-document.ts:21:CWE-321

- Instrumento: cursor; categoria atribuída: **fora-de-escopo**
- Achado: `modules/users/routes/save-document.ts:21` cwe=CWE-321 regra=assistant-finding
- Mensagem: Chave AES padrao embutida
- Casos no arquivo:
  - C-327-02-S safe CWE-327 sink=26 intervalo=[24,26] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  19|     const document = String((request.body as { document?: string }).document ?? '')
  20|     const env = loadEnv()
  21|     const keyMaterial = env.documentKey ?? '0123456789abcdef0123456789abcdef'
  22|     const key = Buffer.from(keyMaterial).subarray(0, 32)
  23|     const iv = randomBytes(12)
```

### cursor#fora-de-escopo#398#modules/users/routes/store-document.ts:19:CWE-798

- Instrumento: cursor; categoria atribuída: **fora-de-escopo**
- Achado: `modules/users/routes/store-document.ts:19` cwe=CWE-798 regra=assistant-finding
- Mensagem: Chave de documento hardcoded
- Casos no arquivo:
  - C-327-02-V vulnerable CWE-327 sink=23 intervalo=[20,23] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  17|   app.post('/users/document/store', { preHandler: [app.authenticate] }, async (request, reply) => {
  18|     const document = String((request.body as { document?: string }).document ?? '')
  19|     const key = createHash('md5').update('loja-doc-key').digest()
  20|     const algorithm = 'aes-128-ecb'
  21|     const cipher = createCipheriv(algorithm, key, null)
```

### cursor#fora-de-escopo#426#modules/auth/routes/register.ts:34:CWE-201

- Instrumento: cursor; categoria atribuída: **fora-de-escopo**
- Achado: `modules/auth/routes/register.ts:34` cwe=CWE-201 regra=assistant-finding
- Mensagem: Hash de senha devolvido no cadastro
- Casos no arquivo:
  - C-327-01-V vulnerable CWE-327 sink=32 intervalo=[29,32] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  32|     const passwordHash = hash.update(password).digest(digestEncoding)
  33|     const user = await User.create({ email, passwordHash, role: 'customer' })
  34|     return reply.code(201).send(withEntityMeta({ id: user.id, email: user.email, hash: passwordHash }))
  35|   })
  36| }
```

### cursor#fora-de-escopo#404#db/seed.ts:48:CWE-916

- Instrumento: cursor; categoria atribuída: **fora-de-escopo**
- Achado: `db/seed.ts:48` cwe=CWE-916 regra=assistant-finding
- Mensagem: Senhas do seed com SHA-256 sem salt
- Casos no arquivo:
- Trecho:
```
  46|     const role = i < 2 ? 'admin' : 'customer'
  47|     const email = `user${i + 1}@loja.exemplo.invalido`
  48|     const passwordHash = createHash('sha256').update(`senha-${SEED}-${i}`).digest('hex')
  49|     users.push({ email, passwordHash, role })
  50|   }
```

### cursor#fora-de-escopo#442#modules/files/routes/invoice-attachment.ts:20:CWE-639

- Instrumento: cursor; categoria atribuída: **fora-de-escopo**
- Achado: `modules/files/routes/invoice-attachment.ts:20` cwe=CWE-639 regra=assistant-finding
- Mensagem: IDOR em anexo de fatura
- Casos no arquivo:
  - C-022-02-V vulnerable CWE-22 sink=25 intervalo=[23,25] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  18|     const id = Number((request.params as { id: string }).id)
  19|     const override = (request.query as { override?: string }).override
  20|     const invoice = await Invoice.findByPk(id)
  21|     if (!invoice) return reply.code(404).send({ error: 'not found' })
  22|     const base = path.join(process.cwd(), UPLOAD_DIR)
```

### cursor#fora-de-escopo#432#modules/auth/routes/recovery-request.ts:16:CWE-201

- Instrumento: cursor; categoria atribuída: **fora-de-escopo**
- Achado: `modules/auth/routes/recovery-request.ts:16` cwe=CWE-201 regra=assistant-finding
- Mensagem: Token de recuperação retornado ao cliente
- Casos no arquivo:
  - C-338-01-V vulnerable CWE-338 sink=11 intervalo=[9,13] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  14|     user.resetToken = token
  15|     await user.save()
  16|     return reply.send({ requested: true, token })
  17|   })
  18| }
```

### cursor#fora-de-escopo#395#modules/system/routes/report.ts:27:CWE-639

- Instrumento: cursor; categoria atribuída: **fora-de-escopo**
- Achado: `modules/system/routes/report.ts:27` cwe=CWE-639 regra=assistant-finding
- Mensagem: IDOR no relatorio de sistema
- Casos no arquivo:
  - C-209-01-V vulnerable CWE-209 sink=36 intervalo=[26,37] janelaVP=false janelaProtegido=true cweEquivalente=false
- Trecho:
```
  25|     const id = Number((request.query as { id?: string }).id)
  26|     try {
  27|       const order = await Order.findByPk(id)
  28|       if (!order) {
  29|         throw new Error('Order missing at ' + new URL(import.meta.url).pathname + ' id=' + id)
```

### cursor#redundante#443#modules/files/routes/invoice-attachment.ts:24:CWE-22

- Instrumento: cursor; categoria atribuída: **redundante**
- Achado: `modules/files/routes/invoice-attachment.ts:24` cwe=CWE-22 regra=assistant-finding
- Mensagem: Path traversal via override de anexo
- Caso atribuído: C-022-02-V (CWE-22), sink=25, intervalo=[23,25], equivalência=CWE-22/CWE-23
- Casos no arquivo:
  - C-022-02-V vulnerable CWE-22 sink=25 intervalo=[23,25] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  22|     const base = path.join(process.cwd(), UPLOAD_DIR)
  23|     const fileName = override ?? invoice.fileName
  24|     const target = path.join(base, fileName)
  25|     const content = await fs.readFile(target)
  26|     const meta = presentInvoiceBytes(content, fileName)
```

### cursor#redundante#438#modules/users/routes/admin-users.ts:5:CWE-862

- Instrumento: cursor; categoria atribuída: **redundante**
- Achado: `modules/users/routes/admin-users.ts:5` cwe=CWE-862 regra=assistant-finding
- Mensagem: Listagem admin sem exigir papel admin
- Caso atribuído: C-284-01-V (CWE-284), sink=6, intervalo=[6,6], equivalência=CWE-284/CWE-285/CWE-639/CWE-862
- Casos no arquivo:
  - C-284-01-V vulnerable CWE-284 sink=6 intervalo=[6,6] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
   3| 
   4| export async function registerAdminUsers(app: FastifyInstance): Promise<void> {
   5|   app.get('/admin/users', { preHandler: [app.authenticate] }, async (_request, reply) => {
   6|     const users = await User.findAll({ attributes: ['id', 'email', 'role'] })
   7|     return reply.send({
```

### cursor#verdadeiro-positivo#411#modules/files/routes/invoice-attachment.ts:23:CWE-22

- Instrumento: cursor; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/files/routes/invoice-attachment.ts:23` cwe=CWE-22 regra=assistant-finding
- Mensagem: Path traversal no anexo da fatura
- Caso atribuído: C-022-02-V (CWE-22), sink=25, intervalo=[23,25], equivalência=CWE-22/CWE-23
- Casos no arquivo:
  - C-022-02-V vulnerable CWE-22 sink=25 intervalo=[23,25] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  21|     if (!invoice) return reply.code(404).send({ error: 'not found' })
  22|     const base = path.join(process.cwd(), UPLOAD_DIR)
  23|     const fileName = override ?? invoice.fileName
  24|     const target = path.join(base, fileName)
  25|     const content = await fs.readFile(target)
```

### cursor#verdadeiro-positivo#424#modules/auth/routes/recovery-request.ts:11:CWE-330

- Instrumento: cursor; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/auth/routes/recovery-request.ts:11` cwe=CWE-330 regra=assistant-finding
- Mensagem: Token de recuperacao com Math.random
- Caso atribuído: C-338-01-V (CWE-338), sink=11, intervalo=[9,13], equivalência=CWE-338/CWE-330
- Casos no arquivo:
  - C-338-01-V vulnerable CWE-338 sink=11 intervalo=[9,13] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
   9|     let token = ''
  10|     while (token.length < 32) {
  11|       token += Math.random().toString(36).slice(2)
  12|     }
  13|     token = token.slice(0, 32)
```

### cursor#verdadeiro-positivo#435#modules/orders/routes/search-orders.ts:28:CWE-89

- Instrumento: cursor; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/orders/routes/search-orders.ts:28` cwe=CWE-89 regra=assistant-finding
- Mensagem: SQL injection no filtro de status
- Caso atribuído: C-089-01-V (CWE-89), sink=33, intervalo=[27,33], equivalência=CWE-89/CWE-943
- Casos no arquivo:
  - C-089-01-V vulnerable CWE-89 sink=33 intervalo=[27,33] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  26|     const status = String((request.query as { status?: string }).status ?? '')
  27|     const statusLiteral = "'" + status + "'"
  28|     const sql =
  29|       "SELECT id, status, total, trackingCode FROM Orders WHERE userId = " +
  30|       userId +
```

### cursor#verdadeiro-positivo#407#modules/integrations/routes/apply-config.ts:26:CWE-502

- Instrumento: cursor; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/integrations/routes/apply-config.ts:26` cwe=CWE-502 regra=assistant-finding
- Mensagem: YAML com schema completo perigoso
- Caso atribuído: C-502-02-V (CWE-502), sink=26, intervalo=[25,26], equivalência=CWE-502/CWE-915
- Casos no arquivo:
  - C-502-02-V vulnerable CWE-502 sink=26 intervalo=[25,26] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  24|     const doc = String((request.body as { yaml?: string }).yaml ?? '')
  25|     const schema = yaml.DEFAULT_FULL_SCHEMA
  26|     const parsed = yaml.load(doc, { schema })
  27|     return reply.send(presentConfig(parsed))
  28|   })
```

### cursor#verdadeiro-positivo#401#modules/users/routes/profile-validate.ts:25:CWE-1333

- Instrumento: cursor; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/users/routes/profile-validate.ts:25` cwe=CWE-1333 regra=assistant-finding
- Mensagem: ReDoS no nome comercial
- Caso atribuído: C-1333-01-V (CWE-1333), sink=28, intervalo=[25,28], equivalência=CWE-1333/CWE-400
- Casos no arquivo:
  - C-1333-01-V vulnerable CWE-1333 sink=28 intervalo=[25,28] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  23|   app.post('/users/profile/validate', { preHandler: [app.authenticate] }, async (request, reply) => {
  24|     const tradeName = String((request.body as { tradeName?: string }).tradeName ?? '')
  25|     const pattern = /^([a-zA-Z0-9]+)+$/
  26|     const input = String(tradeName)
  27|     const trimmedInput = input
```

### cursor#verdadeiro-positivo#423#modules/auth/routes/password-rotate.ts:30:CWE-916

- Instrumento: cursor; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/auth/routes/password-rotate.ts:30` cwe=CWE-916 regra=assistant-finding
- Mensagem: PBKDF2 fraco com SHA-1 e 1000 iteracoes
- Caso atribuído: C-916-01-V (CWE-916), sink=30, intervalo=[28,30], equivalência=CWE-916/CWE-327/CWE-326
- Casos no arquivo:
  - C-916-01-V vulnerable CWE-916 sink=30 intervalo=[28,30] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  28|     const iterations = 1000
  29|     const digest = 'sha1'
  30|     const derived = pbkdf2Sync(password, salt, iterations, 32, digest)
  31|     const passwordHash = 'pbkdf2:1000:sha1:' + salt.toString('hex') + ':' + derived.toString('hex')
  32|     const user = await User.findByPk(request.user!.id)
```

### eslint#falso-negativo#145#modules/orders/routes/search-orders.ts:33:sem-cwe

- Instrumento: eslint; categoria atribuída: **falso-negativo**
- Achado: `modules/orders/routes/search-orders.ts:33` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-089-01-V (CWE-89), sink=33, intervalo=[27,33], equivalência=CWE-89/CWE-943
- Casos no arquivo:
  - C-089-01-V vulnerable CWE-89 sink=33 intervalo=[27,33] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 1 cwe=— (20260903T184325Z) Parsing error: Unexpected token {
- Trecho:
```
  31|       " AND status = " +
  32|       statusLiteral
  33|     const [rows] = await getSequelize().query(sql)
  34|     return reply.send(withEntityMeta({ orders: rows }))
  35|   })
```

### eslint#falso-negativo#153#modules/auth/routes/register.ts:32:sem-cwe

- Instrumento: eslint; categoria atribuída: **falso-negativo**
- Achado: `modules/auth/routes/register.ts:32` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-327-01-V (CWE-327), sink=32, intervalo=[29,32], equivalência=CWE-327/CWE-326/CWE-916
- Casos no arquivo:
  - C-327-01-V vulnerable CWE-327 sink=32 intervalo=[29,32] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 2 cwe=— (20260903T184325Z) Parsing error: Unexpected token {
- Trecho:
```
  30|     const hash = createHash(algorithm)
  31|     const digestEncoding = 'hex'
  32|     const passwordHash = hash.update(password).digest(digestEncoding)
  33|     const user = await User.create({ email, passwordHash, role: 'customer' })
  34|     return reply.code(201).send(withEntityMeta({ id: user.id, email: user.email, hash: passwordHash }))
```

### eslint#falso-negativo#160#modules/auth/routes/login.ts:29:sem-cwe

- Instrumento: eslint; categoria atribuída: **falso-negativo**
- Achado: `modules/auth/routes/login.ts:29` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-532-01-V (CWE-532), sink=29, intervalo=[27,29], equivalência=CWE-532/CWE-200
- Casos no arquivo:
  - C-532-01-V vulnerable CWE-532 sink=29 intervalo=[27,29] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 1 cwe=— (20260903T184325Z) Parsing error: Unexpected token {
- Trecho:
```
  27|     const logPayload = { body }
  28|     const logMessage = 'login attempt'
  29|     request.log.info(logPayload, logMessage)
  30|     const user = await User.findOne({ where: { email: body.email ?? '' } })
  31|     if (!user) return reply.code(401).send({ error: 'invalid credentials' })
```

### eslint#falso-negativo#148#modules/integrations/routes/timing-parse.ts:7:sem-cwe

- Instrumento: eslint; categoria atribuída: **falso-negativo**
- Achado: `modules/integrations/routes/timing-parse.ts:7` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-1104-01-V (CWE-1104), sink=7, intervalo=[7,7], equivalência=CWE-1104/CWE-1395
- Casos no arquivo:
  - C-1104-01-V vulnerable CWE-1104 sink=7 intervalo=[7,7] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 1 cwe=— (20260903T184325Z) Parsing error: Unexpected token {
- Trecho:
```
   5|   app.post('/integrations/timing/parse', { preHandler: [app.authenticate] }, async (request, reply) => {
   6|     const value = String((request.body as { value?: string }).value ?? '')
   7|     const millis = moment(value).valueOf()
   8|     if (!Number.isFinite(millis)) {
   9|       return reply.code(400).send({ error: 'invalid schedule' })
```

### eslint#falso-negativo#162#modules/auth/routes/callback.ts:32:sem-cwe

- Instrumento: eslint; categoria atribuída: **falso-negativo**
- Achado: `modules/auth/routes/callback.ts:32` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-601-01-V (CWE-601), sink=32, intervalo=[32,32], equivalência=CWE-601
- Casos no arquivo:
  - C-601-01-V vulnerable CWE-601 sink=32 intervalo=[32,32] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 1 cwe=— (20260903T184325Z) Parsing error: Unexpected token {
- Trecho:
```
  30|     const next = normalizeNextParam((request.query as { next?: string }).next)
  31|     const info = describeRedirect(next)
  32|     return reply.redirect(info.target)
  33|   })
  34| }
```

### eslint#falso-negativo#151#modules/users/routes/admin-users.ts:6:sem-cwe

- Instrumento: eslint; categoria atribuída: **falso-negativo**
- Achado: `modules/users/routes/admin-users.ts:6` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-284-01-V (CWE-284), sink=6, intervalo=[6,6], equivalência=CWE-284/CWE-285/CWE-639/CWE-862
- Casos no arquivo:
  - C-284-01-V vulnerable CWE-284 sink=6 intervalo=[6,6] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 1 cwe=— (20260903T184325Z) Parsing error: Unexpected token {
- Trecho:
```
   4| export async function registerAdminUsers(app: FastifyInstance): Promise<void> {
   5|   app.get('/admin/users', { preHandler: [app.authenticate] }, async (_request, reply) => {
   6|     const users = await User.findAll({ attributes: ['id', 'email', 'role'] })
   7|     return reply.send({
   8|       users: users.map((u) => ({ id: u.id, email: u.email, role: u.role })),
```

### eslint#nao-mapeado#101#modules/orders/routes/filter-orders.ts:1:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/orders/routes/filter-orders.ts:1` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token {
- Casos no arquivo:
  - C-089-01-S safe CWE-89 sink=36 intervalo=[34,38] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
   1| import type { FastifyInstance } from 'fastify'
   2| import { z } from 'zod'
   3| import { ORDER_STATUSES } from '../../../config/constants.js'
```

### eslint#nao-mapeado#102#modules/orders/routes/get-order.ts:1:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/orders/routes/get-order.ts:1` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token {
- Casos no arquivo:
  - C-639-01-V vulnerable CWE-639 sink=7 intervalo=[7,7] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
   1| import type { FastifyInstance } from 'fastify'
   2| import { Order } from '../../../db/models/order.js'
   3| 
```

### eslint#nao-mapeado#65#config/constants.ts:3:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `config/constants.ts:3` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token as
- Casos no arquivo:
- Trecho:
```
   1| export const SEED = 20260816
   2| 
   3| export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'cancelled'] as const
   4| 
   5| export const UPLOAD_DIR = 'storage/uploads'
```

### eslint#nao-mapeado#89#modules/files/routes/image-render.ts:1:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/files/routes/image-render.ts:1` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token {
- Casos no arquivo:
  - C-918-02-S safe CWE-918 sink=47 intervalo=[41,47] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
   1| import type { FastifyInstance } from 'fastify'
   2| import { loadEnv } from '../../../config/env.js'
   3| 
```

### eslint#nao-mapeado#78#modules/auth/routes/register.ts:2:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/auth/routes/register.ts:2` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token {
- Casos no arquivo:
  - C-327-01-V vulnerable CWE-327 sink=32 intervalo=[29,32] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
   1| import { createHash } from 'node:crypto'
   2| import type { FastifyInstance } from 'fastify'
   3| import { User } from '../../../db/models/user.js'
   4| 
```

### eslint#nao-mapeado#88#modules/files/routes/image-proxy.ts:1:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/files/routes/image-proxy.ts:1` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token {
- Casos no arquivo:
  - C-918-02-V vulnerable CWE-918 sink=31 intervalo=[31,31] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
   1| import type { FastifyInstance } from 'fastify'
   2| 
   3| function resolveImageType(header: string | null, buf: Buffer): string {
```

### eslint#nao-mapeado#96#modules/integrations/routes/feed-import.ts:1:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/integrations/routes/feed-import.ts:1` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token {
- Casos no arquivo:
  - C-918-01-S safe CWE-918 sink=52 intervalo=[46,52] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
   1| import type { FastifyInstance } from 'fastify'
   2| import { loadEnv } from '../../../config/env.js'
   3| 
```

### eslint#nao-mapeado#80#modules/auth/routes/return-path.ts:1:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/auth/routes/return-path.ts:1` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token {
- Casos no arquivo:
  - C-601-01-S safe CWE-601 sink=40 intervalo=[39,40] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
   1| import type { FastifyInstance } from 'fastify'
   2| import { DEFAULT_REDIRECT } from '../../../config/constants.js'
   3| 
```

### eslint#nao-mapeado#85#modules/files/routes/attach.ts:4:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/files/routes/attach.ts:4` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token {
- Casos no arquivo:
  - C-434-01-S safe CWE-434 sink=53 intervalo=[51,53] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
   2| import path from 'node:path'
   3| import { randomUUID } from 'node:crypto'
   4| import type { FastifyInstance } from 'fastify'
   5| import { ALLOWED_UPLOAD_EXTENSIONS, UPLOAD_DIR } from '../../../config/constants.js'
   6| 
```

### eslint#nao-mapeado#117#modules/shared/html.ts:1:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/shared/html.ts:1` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token :
- Casos no arquivo:
- Trecho:
```
   1| export function escapeHtml(input: string): string {
   2|   return input
   3|     .replace(/&/g, '&amp;')
```

### eslint#nao-mapeado#77#modules/auth/routes/recovery-request.ts:1:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/auth/routes/recovery-request.ts:1` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token {
- Casos no arquivo:
  - C-338-01-V vulnerable CWE-338 sink=11 intervalo=[9,13] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
   1| import type { FastifyInstance } from 'fastify'
   2| import { User } from '../../../db/models/user.js'
   3| 
```

### eslint#nao-mapeado#112#modules/orders/routes/voucher.ts:1:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/orders/routes/voucher.ts:1` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token {
- Casos no arquivo:
  - C-079-01-S safe CWE-79 sink=34 intervalo=[32,36] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
   1| import type { FastifyInstance } from 'fastify'
   2| import { escapeHtml } from '../../shared/html.js'
   3| 
```

### eslint#nao-mapeado#109#modules/orders/routes/summary.ts:1:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/orders/routes/summary.ts:1` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token {
- Casos no arquivo:
  - C-079-02-S safe CWE-79 sink=30 intervalo=[28,30] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
   1| import type { FastifyInstance } from 'fastify'
   2| import { Order } from '../../../db/models/order.js'
   3| import { escapeHtml } from '../../shared/html.js'
```

### eslint#nao-mapeado#72#db/sequelize.ts:4:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `db/sequelize.ts:4` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token :
- Casos no arquivo:
- Trecho:
```
   2| import { loadEnv } from '../config/env.js'
   3| 
   4| let sequelize: Sequelize | null = null
   5| 
   6| export function getSequelize(sqlitePath?: string): Sequelize {
```

### eslint#nao-mapeado#114#modules/reports/routes/convert-report.ts:4:sem-cwe

- Instrumento: eslint; categoria atribuída: **nao-mapeado**
- Achado: `modules/reports/routes/convert-report.ts:4` cwe=— regra=unknown
- Mensagem: Parsing error: Unexpected token {
- Casos no arquivo:
  - C-078-01-V vulnerable CWE-78 sink=35 intervalo=[33,35] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
   2| import { promisify } from 'node:util'
   3| import path from 'node:path'
   4| import type { FastifyInstance } from 'fastify'
   5| import { REPORTS_DIR } from '../../../config/constants.js'
   6| 
```

### njsscan#falso-negativo#230#modules/system/routes/purge.ts:8:sem-cwe

- Instrumento: njsscan; categoria atribuída: **falso-negativo**
- Achado: `modules/system/routes/purge.ts:8` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-306-01-V (CWE-306), sink=8, intervalo=[8,10], equivalência=CWE-306/CWE-287
- Casos no arquivo:
  - C-306-01-V vulnerable CWE-306 sink=8 intervalo=[8,10] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
   6|   app.post('/system/maintenance/purge', async (_request, reply) => {
   7|     const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
   8|     const removed = await Order.destroy({
   9|       where: { status: 'cancelled', createdAt: { [Op.lt]: cutoff } },
  10|     })
```

### njsscan#falso-negativo#236#modules/auth/routes/login.ts:29:sem-cwe

- Instrumento: njsscan; categoria atribuída: **falso-negativo**
- Achado: `modules/auth/routes/login.ts:29` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-532-01-V (CWE-532), sink=29, intervalo=[27,29], equivalência=CWE-532/CWE-200
- Casos no arquivo:
  - C-532-01-V vulnerable CWE-532 sink=29 intervalo=[27,29] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 26 cwe=CWE-943 (20260903T184317Z) Untrusted user input in findOne() function can result in NoSQL Injection.
  - linha 30 cwe=CWE-943 (20260903T184317Z) Untrusted user input in findOne() function can result in NoSQL Injection.
- Trecho:
```
  27|     const logPayload = { body }
  28|     const logMessage = 'login attempt'
  29|     request.log.info(logPayload, logMessage)
  30|     const user = await User.findOne({ where: { email: body.email ?? '' } })
  31|     if (!user) return reply.code(401).send({ error: 'invalid credentials' })
```

### njsscan#falso-negativo#226#modules/integrations/routes/timing-parse.ts:7:sem-cwe

- Instrumento: njsscan; categoria atribuída: **falso-negativo**
- Achado: `modules/integrations/routes/timing-parse.ts:7` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-1104-01-V (CWE-1104), sink=7, intervalo=[7,7], equivalência=CWE-1104/CWE-1395
- Casos no arquivo:
  - C-1104-01-V vulnerable CWE-1104 sink=7 intervalo=[7,7] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 6 cwe=CWE-79 (20260903T184317Z) Untrusted User Input in Response will result in Reflected Cross Site Scripting Vulnerabili
- Trecho:
```
   5|   app.post('/integrations/timing/parse', { preHandler: [app.authenticate] }, async (request, reply) => {
   6|     const value = String((request.body as { value?: string }).value ?? '')
   7|     const millis = moment(value).valueOf()
   8|     if (!Number.isFinite(millis)) {
   9|       return reply.code(400).send({ error: 'invalid schedule' })
```

### njsscan#falso-negativo#220#modules/reports/routes/convert-report.ts:35:sem-cwe

- Instrumento: njsscan; categoria atribuída: **falso-negativo**
- Achado: `modules/reports/routes/convert-report.ts:35` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-078-01-V (CWE-78), sink=35, intervalo=[33,35], equivalência=CWE-78/CWE-77/CWE-88
- Casos no arquivo:
  - C-078-01-V vulnerable CWE-78 sink=35 intervalo=[33,35] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 30 cwe=CWE-79 (20260903T184317Z) Untrusted User Input in Response will result in Reflected Cross Site Scripting Vulnerabili
- Trecho:
```
  33|     const source = path.join(dir, fileName)
  34|     const cmd = 'cp ' + source + ' ' + out
  35|     await execAsync(cmd)
  36|     return reply.send(withEntityMeta({ output: out }))
  37|   })
```

### njsscan#falso-negativo#234#modules/users/routes/import-preferences.ts:25:sem-cwe

- Instrumento: njsscan; categoria atribuída: **falso-negativo**
- Achado: `modules/users/routes/import-preferences.ts:25` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-502-01-V (CWE-502), sink=25, intervalo=[24,25], equivalência=CWE-502/CWE-915
- Casos no arquivo:
  - C-502-01-V vulnerable CWE-502 sink=25 intervalo=[24,25] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - nenhum
- Trecho:
```
  23|     const decoded = Buffer.from(data, 'base64').toString('utf8')
  24|     const serialized = decoded
  25|     const prefs = serialize.unserialize(serialized)
  26|     return reply.send(presentPreferences(prefs))
  27|   })
```

### njsscan#fora-de-escopo#173#modules/integrations/routes/feed-fetch.ts:34:CWE-79

- Instrumento: njsscan; categoria atribuída: **fora-de-escopo**
- Achado: `modules/integrations/routes/feed-fetch.ts:34` cwe=CWE-79 regra=express_xss
- Mensagem: Untrusted User Input in Response will result in Reflected Cross Site Scripting Vulnerability.
- Casos no arquivo:
  - C-918-01-V vulnerable CWE-918 sink=35 intervalo=[35,35] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  32| export async function registerFeedFetch(app: FastifyInstance): Promise<void> {
  33|   app.post('/integrations/feed/fetch', { preHandler: [app.authenticate] }, async (request, reply) => {
  34|     const url = String((request.body as { url?: string }).url ?? '')
  35|     const res = await fetch(url)
  36|     const text = await res.text()
```

### njsscan#fora-de-escopo#184#modules/reports/routes/calculate.ts:183:CWE-79

- Instrumento: njsscan; categoria atribuída: **fora-de-escopo**
- Achado: `modules/reports/routes/calculate.ts:183` cwe=CWE-79 regra=express_xss
- Mensagem: Untrusted User Input in Response will result in Reflected Cross Site Scripting Vulnerability.
- Casos no arquivo:
  - C-094-01-S safe CWE-94 sink=189 intervalo=[188,193] janelaVP=false janelaProtegido=true cweEquivalente=false
- Trecho:
```
 181| export async function registerCalculate(app: FastifyInstance): Promise<void> {
 182|   app.post('/reports/calculate', { preHandler: [app.authenticate] }, async (request, reply) => {
 183|     const inputs = normalizeReportInputs(request.body as {
 184|       expression?: string
 185|       total?: number
```

### njsscan#fora-de-escopo#212#modules/reports/routes/calculate.ts:41:CWE-185

- Instrumento: njsscan; categoria atribuída: **fora-de-escopo**
- Achado: `modules/reports/routes/calculate.ts:41` cwe=CWE-185 regra=regex_dos
- Mensagem: Ensure that the regex used to compare with user supplied input is safe from regular expression denial of service.
- Casos no arquivo:
  - C-094-01-S safe CWE-94 sink=189 intervalo=[188,193] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
  39|   const tokenHints = inputs.expression.split(/[^a-zA-Z0-9_]+/).filter(Boolean)
  40|   const usesTotal = /\btotal\b/.test(inputs.expression)
  41|   const usesQuantidade = /\bquantidade\b/.test(inputs.expression)
  42|   const resultType =
  43|     result === null ? 'null' : Array.isArray(result) ? 'array' : typeof result
```

### njsscan#fora-de-escopo#189#modules/system/routes/status.ts:26:CWE-79

- Instrumento: njsscan; categoria atribuída: **fora-de-escopo**
- Achado: `modules/system/routes/status.ts:26` cwe=CWE-79 regra=express_xss
- Mensagem: Untrusted User Input in Response will result in Reflected Cross Site Scripting Vulnerability.
- Casos no arquivo:
  - C-209-01-S safe CWE-209 sink=36 intervalo=[27,37] janelaVP=false janelaProtegido=true cweEquivalente=false
- Trecho:
```
  24| export async function registerSystemStatus(app: FastifyInstance): Promise<void> {
  25|   app.get('/system/status', { preHandler: [app.authenticate] }, async (request, reply) => {
  26|     const id = Number((request.query as { id?: string }).id)
  27|     try {
  28|       const order = await Order.findByPk(id)
```

### njsscan#fora-de-escopo#213#modules/reports/routes/calculate.ts:89:CWE-185

- Instrumento: njsscan; categoria atribuída: **fora-de-escopo**
- Achado: `modules/reports/routes/calculate.ts:89` cwe=CWE-185 regra=regex_dos
- Mensagem: Ensure that the regex used to compare with user supplied input is safe from regular expression denial of service.
- Casos no arquivo:
  - C-094-01-S safe CWE-94 sink=189 intervalo=[188,193] janelaVP=false janelaProtegido=false cweEquivalente=false
- Trecho:
```
  87|   const scaleAverage = audit.meta.scale.average
  88|   const discounted = audit.meta.scale.withDiscount
  89|   const inputView = {
  90|     expression: inputs.expression,
  91|     total: inputs.total,
```

### njsscan#fora-de-escopo#185#modules/reports/routes/convert-report.ts:30:CWE-79

- Instrumento: njsscan; categoria atribuída: **fora-de-escopo**
- Achado: `modules/reports/routes/convert-report.ts:30` cwe=CWE-79 regra=express_xss
- Mensagem: Untrusted User Input in Response will result in Reflected Cross Site Scripting Vulnerability.
- Casos no arquivo:
  - C-078-01-V vulnerable CWE-78 sink=35 intervalo=[33,35] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  28| export async function registerConvertReport(app: FastifyInstance): Promise<void> {
  29|   app.post('/reports/convert', { preHandler: [app.authenticate] }, async (request, reply) => {
  30|     const fileName = String((request.body as { fileName?: string }).fileName ?? '')
  31|     const dir = path.join(process.cwd(), REPORTS_DIR)
  32|     const out = path.join(dir, 'out-' + fileName)
```

### njsscan#fora-de-escopo#205#modules/auth/routes/signin.ts:27:CWE-943

- Instrumento: njsscan; categoria atribuída: **fora-de-escopo**
- Achado: `modules/auth/routes/signin.ts:27` cwe=CWE-943 regra=node_nosqli_injection
- Mensagem: Untrusted user input in findOne() function can result in NoSQL Injection.
- Casos no arquivo:
  - C-532-01-S safe CWE-532 sink=29 intervalo=[29,29] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  25|   app.post('/auth/signin', async (request, reply) => {
  26|     const body = request.body as { email?: string; password?: string }
  27|     const user = await User.findOne({ where: { email: body.email ?? '' } })
  28|     const result = user ? 'accepted' : 'rejected'
  29|     request.log.info({ email: body.email, result }, 'signin attempt')
```

### njsscan#fora-de-escopo#183#modules/orders/routes/tracking-issue.ts:26:CWE-79

- Instrumento: njsscan; categoria atribuída: **fora-de-escopo**
- Achado: `modules/orders/routes/tracking-issue.ts:26` cwe=CWE-79 regra=express_xss
- Mensagem: Untrusted User Input in Response will result in Reflected Cross Site Scripting Vulnerability.
- Casos no arquivo:
  - C-338-02-S safe CWE-338 sink=29 intervalo=[29,29] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  24| export async function registerTrackingIssue(app: FastifyInstance): Promise<void> {
  25|   app.post('/orders/:id/tracking/issue', { preHandler: [app.authenticate] }, async (request, reply) => {
  26|     const id = Number((request.params as { id: string }).id)
  27|     const order = await Order.findByPk(id)
  28|     if (!order) return reply.code(404).send({ error: 'not found' })
```

### njsscan#fora-de-escopo#198#modules/auth/routes/login.ts:26:CWE-943

- Instrumento: njsscan; categoria atribuída: **fora-de-escopo**
- Achado: `modules/auth/routes/login.ts:26` cwe=CWE-943 regra=node_nosqli_injection
- Mensagem: Untrusted user input in findOne() function can result in NoSQL Injection.
- Casos no arquivo:
  - C-532-01-V vulnerable CWE-532 sink=29 intervalo=[27,29] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  24| export async function registerLogin(app: FastifyInstance): Promise<void> {
  25|   app.post('/auth/login', async (request, reply) => {
  26|     const body = request.body as { email?: string; password?: string }
  27|     const logPayload = { body }
  28|     const logMessage = 'login attempt'
```

### njsscan#redundante#197#modules/users/routes/store-document.ts:19:CWE-327

- Instrumento: njsscan; categoria atribuída: **redundante**
- Achado: `modules/users/routes/store-document.ts:19` cwe=CWE-327 regra=node_md5
- Mensagem: MD5 is a a weak hash which is known to have collision. Use a strong hashing function.
- Caso atribuído: C-327-02-V (CWE-327), sink=23, intervalo=[20,23], equivalência=CWE-327/CWE-326/CWE-916
- Casos no arquivo:
  - C-327-02-V vulnerable CWE-327 sink=23 intervalo=[20,23] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  17|   app.post('/users/document/store', { preHandler: [app.authenticate] }, async (request, reply) => {
  18|     const document = String((request.body as { document?: string }).document ?? '')
  19|     const key = createHash('md5').update('loja-doc-key').digest()
  20|     const algorithm = 'aes-128-ecb'
  21|     const cipher = createCipheriv(algorithm, key, null)
```

### njsscan#verdadeiro-positivo#196#modules/auth/routes/register.ts:30:CWE-327

- Instrumento: njsscan; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/auth/routes/register.ts:30` cwe=CWE-327 regra=node_md5
- Mensagem: MD5 is a a weak hash which is known to have collision. Use a strong hashing function.
- Caso atribuído: C-327-01-V (CWE-327), sink=32, intervalo=[29,32], equivalência=CWE-327/CWE-326/CWE-916
- Casos no arquivo:
  - C-327-01-V vulnerable CWE-327 sink=32 intervalo=[29,32] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  28|     const password = String(body.password ?? '')
  29|     const algorithm = 'md5'
  30|     const hash = createHash(algorithm)
  31|     const digestEncoding = 'hex'
  32|     const passwordHash = hash.update(password).digest(digestEncoding)
```

### semgrep#falso-negativo#45#modules/reports/routes/formula.ts:133:sem-cwe

- Instrumento: semgrep; categoria atribuída: **falso-negativo**
- Achado: `modules/reports/routes/formula.ts:133` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-094-01-V (CWE-94), sink=133, intervalo=[133,133], equivalência=CWE-94/CWE-95
- Casos no arquivo:
  - C-094-01-V vulnerable CWE-94 sink=133 intervalo=[133,133] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 135 cwe=CWE-79 (20260903T183852Z) Detected directly writing to a Response object from user-defined input. This bypasses any 
- Trecho:
```
 131|       quantidade?: number
 132|     })
 133|     const fn = new Function('total', 'quantidade', 'return (' + inputs.expression + ')')
 134|     const result = fn(inputs.total, inputs.quantidade)
 135|     return reply.send(presentReportResult(inputs, result))
```

### semgrep#falso-negativo#54#modules/integrations/routes/apply-config.ts:26:sem-cwe

- Instrumento: semgrep; categoria atribuída: **falso-negativo**
- Achado: `modules/integrations/routes/apply-config.ts:26` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-502-02-V (CWE-502), sink=26, intervalo=[25,26], equivalência=CWE-502/CWE-915
- Casos no arquivo:
  - C-502-02-V vulnerable CWE-502 sink=26 intervalo=[25,26] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 27 cwe=CWE-79 (20260903T183852Z) Detected directly writing to a Response object from user-defined input. This bypasses any 
- Trecho:
```
  24|     const doc = String((request.body as { yaml?: string }).yaml ?? '')
  25|     const schema = yaml.DEFAULT_FULL_SCHEMA
  26|     const parsed = yaml.load(doc, { schema })
  27|     return reply.send(presentConfig(parsed))
  28|   })
```

### semgrep#falso-negativo#47#modules/system/routes/report.ts:36:sem-cwe

- Instrumento: semgrep; categoria atribuída: **falso-negativo**
- Achado: `modules/system/routes/report.ts:36` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-209-01-V (CWE-209), sink=36, intervalo=[26,37], equivalência=CWE-209/CWE-200/CWE-497
- Casos no arquivo:
  - C-209-01-V vulnerable CWE-209 sink=36 intervalo=[26,37] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 31 cwe=CWE-79 (20260903T183852Z) Detected directly writing to a Response object from user-defined input. This bypasses any 
- Trecho:
```
  34|       const message = error.message
  35|       const stack = error.stack
  36|       return reply.code(500).send({ message, stack })
  37|     }
  38|   })
```

### semgrep#falso-negativo#59#modules/integrations/routes/dispatch.ts:26:sem-cwe

- Instrumento: semgrep; categoria atribuída: **falso-negativo**
- Achado: `modules/integrations/routes/dispatch.ts:26` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-798-01-V (CWE-798), sink=26, intervalo=[25,26], equivalência=CWE-798/CWE-259/CWE-321
- Casos no arquivo:
  - C-798-01-V vulnerable CWE-798 sink=26 intervalo=[25,26] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 27 cwe=CWE-79 (20260903T183852Z) Detected directly writing to a Response object from user-defined input. This bypasses any 
- Trecho:
```
  24|     const body = request.body as { message?: string }
  25|     const embeddedKey = 'loja-live-key-9f3a2c1b0e7d'
  26|     const apiKey = embeddedKey
  27|     return reply.send(presentIntegrationResult('dispatched', apiKey, body.message ?? ''))
  28|   })
```

### semgrep#falso-negativo#41#modules/system/routes/diagnostics.ts:31:sem-cwe

- Instrumento: semgrep; categoria atribuída: **falso-negativo**
- Achado: `modules/system/routes/diagnostics.ts:31` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-078-02-V (CWE-78), sink=31, intervalo=[29,31], equivalência=CWE-78/CWE-77/CWE-88
- Casos no arquivo:
  - C-078-02-V vulnerable CWE-78 sink=31 intervalo=[29,31] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 32 cwe=CWE-79 (20260903T183852Z) Detected directly writing to a Response object from user-defined input. This bypasses any 
- Trecho:
```
  29|     const prefix = 'echo reachability-check '
  30|     const cmd = prefix + host
  31|     const { stdout, stderr } = await execAsync(cmd)
  32|     return reply.send(withEntityMeta({ output: stdout || stderr }))
  33|   })
```

### semgrep#falso-negativo#43#modules/orders/routes/search-orders.ts:33:sem-cwe

- Instrumento: semgrep; categoria atribuída: **falso-negativo**
- Achado: `modules/orders/routes/search-orders.ts:33` cwe=— regra=—
- Mensagem: nenhum achado satisfez a condição de verdadeiro positivo para o caso
- Caso atribuído: C-089-01-V (CWE-89), sink=33, intervalo=[27,33], equivalência=CWE-89/CWE-943
- Casos no arquivo:
  - C-089-01-V vulnerable CWE-89 sink=33 intervalo=[27,33] janelaVP=true janelaProtegido=true cweEquivalente=false
- Achados do instrumento neste arquivo:
  - linha 34 cwe=CWE-79 (20260903T183852Z) Detected directly writing to a Response object from user-defined input. This bypasses any 
- Trecho:
```
  31|       " AND status = " +
  32|       statusLiteral
  33|     const [rows] = await getSequelize().query(sql)
  34|     return reply.send(withEntityMeta({ orders: rows }))
  35|   })
```

### semgrep#falso-positivo-par#19#modules/orders/routes/voucher.ts:33:CWE-79

- Instrumento: semgrep; categoria atribuída: **falso-positivo-par**
- Achado: `modules/orders/routes/voucher.ts:33` cwe=CWE-79 regra=rules.javascript.express.security.injection.raw-html-format
- Mensagem: User data flows into the host portion of this manually-constructed HTML. This can introduce a Cross-Site-Scripting (XSS) vulnerability if this comes from user-p
- Caso atribuído: C-079-01-S (CWE-79), sink=34, intervalo=[32,36], equivalência=CWE-79/CWE-80
- Casos no arquivo:
  - C-079-01-S safe CWE-79 sink=34 intervalo=[32,36] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  31|     const note = normalizeNote(String((request.query as { note?: string }).note ?? ''))
  32|     const title = 'Voucher'
  33|     const html = '<html><body><h1>' + title + '</h1><p>' + escapeHtml(note) + '</p></body></html>'
  34|     const meta = withEntityMeta({ noteLength: note.length })
  35|     reply.header('x-note-length', String(meta.meta.keyCount))
```

### semgrep#fora-de-escopo#27#modules/system/routes/status.ts:32:CWE-79

- Instrumento: semgrep; categoria atribuída: **fora-de-escopo**
- Achado: `modules/system/routes/status.ts:32` cwe=CWE-79 regra=rules.javascript.express.security.audit.xss.direct-response-write
- Mensagem: Detected directly writing to a Response object from user-defined input. This bypasses any HTML escaping and may expose your application to a Cross-Site-scriptin
- Casos no arquivo:
  - C-209-01-S safe CWE-209 sink=36 intervalo=[27,37] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  30|         throw new Error('Order missing at ' + new URL(import.meta.url).pathname + ' id=' + id)
  31|       }
  32|       return reply.send(withEntityMeta({ id: order.id, status: order.status }))
  33|     } catch (err) {
  34|       const correlationId = randomUUID()
```

### semgrep#fora-de-escopo#36#modules/users/routes/save-document.ts:28:CWE-79

- Instrumento: semgrep; categoria atribuída: **fora-de-escopo**
- Achado: `modules/users/routes/save-document.ts:28` cwe=CWE-79 regra=rules.javascript.express.security.audit.xss.direct-response-write
- Mensagem: Detected directly writing to a Response object from user-defined input. This bypasses any HTML escaping and may expose your application to a Cross-Site-scriptin
- Casos no arquivo:
  - C-327-02-S safe CWE-327 sink=26 intervalo=[24,26] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  26|     const tag = cipher.getAuthTag()
  27|     return reply.send(
  28|       presentCipherPayload(encrypted.toString('hex'), {
  29|         iv: iv.toString('hex'),
  30|         tag: tag.toString('hex'),
```

### semgrep#fora-de-escopo#16#modules/orders/routes/settle.ts:33:CWE-79

- Instrumento: semgrep; categoria atribuída: **fora-de-escopo**
- Achado: `modules/orders/routes/settle.ts:33` cwe=CWE-79 regra=rules.javascript.express.security.audit.xss.direct-response-write
- Mensagem: Detected directly writing to a Response object from user-defined input. This bypasses any HTML escaping and may expose your application to a Cross-Site-scriptin
- Casos no arquivo:
  - C-532-02-S safe CWE-532 sink=30 intervalo=[30,30] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  31|     order.status = 'paid'
  32|     await order.save()
  33|     return reply.send(withEntityMeta({ id: order.id, status: order.status }))
  34|   })
  35| }
```

### semgrep#fora-de-escopo#13#modules/orders/routes/payment.ts:34:CWE-79

- Instrumento: semgrep; categoria atribuída: **fora-de-escopo**
- Achado: `modules/orders/routes/payment.ts:34` cwe=CWE-79 regra=rules.javascript.express.security.audit.xss.direct-response-write
- Mensagem: Detected directly writing to a Response object from user-defined input. This bypasses any HTML escaping and may expose your application to a Cross-Site-scriptin
- Casos no arquivo:
  - C-532-02-V vulnerable CWE-532 sink=31 intervalo=[29,31] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  32|     order.status = 'paid'
  33|     await order.save()
  34|     return reply.send(withEntityMeta({ id: order.id, status: order.status }))
  35|   })
  36| }
```

### semgrep#fora-de-escopo#23#modules/reports/routes/transform-report.ts:39:CWE-79

- Instrumento: semgrep; categoria atribuída: **fora-de-escopo**
- Achado: `modules/reports/routes/transform-report.ts:39` cwe=CWE-79 regra=rules.javascript.express.security.audit.xss.direct-response-write
- Mensagem: Detected directly writing to a Response object from user-defined input. This bypasses any HTML escaping and may expose your application to a Cross-Site-scriptin
- Casos no arquivo:
  - C-078-01-S safe CWE-78 sink=38 intervalo=[38,38] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  37|     const out = path.join(dir, 'out-' + fileName)
  38|     await execFileAsync('cp', [path.join(dir, fileName), out])
  39|     return reply.send(withEntityMeta({ output: out }))
  40|   })
  41| }
```

### semgrep#fora-de-escopo#18#modules/orders/routes/tracking-issue.ts:32:CWE-79

- Instrumento: semgrep; categoria atribuída: **fora-de-escopo**
- Achado: `modules/orders/routes/tracking-issue.ts:32` cwe=CWE-79 regra=rules.javascript.express.security.audit.xss.direct-response-write
- Mensagem: Detected directly writing to a Response object from user-defined input. This bypasses any HTML escaping and may expose your application to a Cross-Site-scriptin
- Casos no arquivo:
  - C-338-02-S safe CWE-338 sink=29 intervalo=[29,29] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  30|     order.trackingCode = trackingCode
  31|     await order.save()
  32|     return reply.send(withEntityMeta({ id: order.id, trackingCode }))
  33|   })
  34| }
```

### semgrep#fora-de-escopo#2#modules/auth/routes/session.ts:35:CWE-79

- Instrumento: semgrep; categoria atribuída: **fora-de-escopo**
- Achado: `modules/auth/routes/session.ts:35` cwe=CWE-79 regra=rules.javascript.express.security.audit.xss.direct-response-write
- Mensagem: Detected directly writing to a Response object from user-defined input. This bypasses any HTML escaping and may expose your application to a Cross-Site-scriptin
- Casos no arquivo:
  - C-798-02-S safe CWE-798 sink=34 intervalo=[29,34] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
  33|     const claims = { id: user.id, email: user.email, role: user.role }
  34|     const token = signToken(claims, secret)
  35|     return reply.send(withEntityMeta({ token }))
  36|   })
  37| }
```

### semgrep#nao-mapeado#10#modules/integrations/routes/timing-parse.ts:2:sem-cwe

- Instrumento: semgrep; categoria atribuída: **nao-mapeado**
- Achado: `modules/integrations/routes/timing-parse.ts:2` cwe=— regra=rules.typescript.lang.best-practice.moment-deprecated
- Mensagem: Moment is a legacy project in maintenance mode. Consider using libraries that are actively supported, e.g. `dayjs`.
- Casos no arquivo:
  - C-1104-01-V vulnerable CWE-1104 sink=7 intervalo=[7,7] janelaVP=true janelaProtegido=true cweEquivalente=false
- Trecho:
```
   1| import type { FastifyInstance } from 'fastify'
   2| import moment from 'moment'
   3| 
   4| export async function registerTimingParse(app: FastifyInstance): Promise<void> {
```

### semgrep#verdadeiro-positivo#29#modules/users/routes/import-preferences.ts:25:CWE-502

- Instrumento: semgrep; categoria atribuída: **verdadeiro-positivo**
- Achado: `modules/users/routes/import-preferences.ts:25` cwe=CWE-502 regra=rules.javascript.express.security.audit.express-third-party-object-deserialization
- Mensagem: The following function call serialize.unserialize accepts user controlled data which can result in Remote Code Execution (RCE) through Object Deserialization. I
- Caso atribuído: C-502-01-V (CWE-502), sink=25, intervalo=[24,25], equivalência=CWE-502/CWE-915
- Casos no arquivo:
  - C-502-01-V vulnerable CWE-502 sink=25 intervalo=[24,25] janelaVP=true janelaProtegido=true cweEquivalente=true
- Trecho:
```
  23|     const decoded = Buffer.from(data, 'base64').toString('utf8')
  24|     const serialized = decoded
  25|     const prefs = serialize.unserialize(serialized)
  26|     return reply.send(presentPreferences(prefs))
  27|   })
```

