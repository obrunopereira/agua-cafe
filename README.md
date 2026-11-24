# Água & Café | PWA 1.0.0

Aplicativo local para iPhone e computador, em português, sem conta ou API de processamento. Analisa a composição da água para cafés filtrados. O GitHub Pages serve apenas os arquivos estáticos; os dados pessoais e fotos permanecem no navegador (salvo se você exportar e compartilhar um arquivo).

## 1. Publicação recomendada (Windows + GitHub Pages)

Você precisa de uma conta gratuita no GitHub. Use um repositório público para GitHub Pages gratuito. O código-fonte ficará público, mas a sua base local não será publicada. Nunca faça commit dos backups JSON ou CSV pessoais.

### Opção A — GitHub Desktop (mais simples, sem terminal)

1. Baixe e extraia o ZIP. A pasta interna `water-profile` é a raiz do projeto; nela estão `public`, `scripts`, `tests`, `package.json` e a pasta oculta `.github`.
2. Instale o [GitHub Desktop](https://desktop.github.com/), entre na sua conta e escolha **File > Add local repository**. Selecione a pasta `water-profile`. Se aparecer aviso de que não é um repositório Git, use o link para criar o repositório naquele diretório (confira se o caminho final é a pasta que contém `package.json`, sem criar uma pasta duplicada). Alternativamente use a opção B abaixo.
3. Faça o commit dos arquivos, caso ainda não exista o commit inicial, e clique em **Publish repository**. Desmarque **Keep this code private** para a hospedagem gratuita; use o nome `agua-cafe` ou outro de sua escolha. A branch deve ser `main`.
4. No GitHub (site), abra o repositório e vá em **Settings > Pages > Build and deployment > Source > GitHub Actions**. Não escolha Deploy from a branch: a pasta `public` não contém as dependências OCR antes do build.
5. Abra a aba **Actions**, escolha **Publicar Água & Café**, clique **Run workflow > Run workflow** na branch `main`. Caso a primeira execução tenha falhado antes da configuração do Pages, execute novamente. O fluxo instala os pacotes OCR, executa os testes, monta `dist` e publica.
6. Quando a execução estiver verde, em Settings > Pages ou no job `deploy`, abra o URL publicado (`https://SEU-USUARIO.github.io/agua-cafe/`, substituindo pelo nome real). Não use esse URL de exemplo literalmente.

### Opção B — Git no Windows (PowerShell)

Instale [Git for Windows](https://git-scm.com/download/win). No GitHub, crie um repositório público vazio chamado `agua-cafe`, sem README, .gitignore ou licença inicial. Abra PowerShell dentro da pasta extraída, então:

```powershell
git init -b main
git add .
git commit -m "Versão inicial Água e Café"
git remote add origin https://github.com/SEU-USUARIO/agua-cafe.git
git push -u origin main
```

Substitua `SEU-USUARIO`. Se o Git pedir nome/email para o primeiro commit, configure `git config user.name "Seu nome"` e `git config user.email "seu-email"`. Autentique quando solicitado. Depois siga os passos 4–6 da opção A.

Não precisa instalar Node.js no computador para publicar por essas opções. O GitHub Actions faz a compilação no servidor de publicação; o aplicativo em uso não tem servidor de processamento.

Documentação oficial: https://docs.github.com/pt/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## 2. Instalar no iPhone

1. No Safari, abra o endereço HTTPS publicado.
2. No menu Compartilhar, selecione **Adicionar à Tela de Início** (em versões recentes do iOS, mantenha **Abrir como App da Web**, se a opção for exibida).
3. Abra o ícone Água & Café que foi criado. Faça isso antes de cadastrar suas águas: Safari e o app instalado podem ter armazenamento separado.
4. Com internet, vá em **Dados > Preparar OCR offline**. Aguarde a confirmação. Se o indicador ainda não reconhecer o service worker, feche e reabra o app. O pacote OCR inclui modelo português e variantes WebAssembly, podendo ocupar dezenas de MB.
5. Teste com uma foto real e confira todos os números. Ative modo avião, encerre e reabra o app, faça uma análise, salve uma água e teste uma segunda leitura OCR. Só após esse teste considere a instalação offline validada no seu aparelho.
6. Em Dados, faça um backup JSON periodicamente e guarde em Arquivos/iCloud Drive ou em outro local de sua escolha. O app pode solicitar persistência, mas o iOS não garante conservar o armazenamento indefinidamente.

## 3. Funcionalidades

- **Análise:** entrada manual, fotografia/galeria, ou texto copiado pelo Live Text do iOS; OCR local Tesseract.js 6.0.1, idioma português. A foto é reduzida para até 2.000 pixels na dimensão maior; permite rotação. Campos reconhecidos são destacados, e dados já preenchidos não são sobrescritos se houver divergência. Nome, fonte e local são campos manuais. Não há correção automática de perspectiva ou segmentação inteligente de colunas nesta versão.
- **Química:** bicarbonato × 0,8197 (estimativa de alcalinidade), Ca × 2,497 e Mg × 4,118 (dureza equivalente); todos os resultados em mg/L como CaCO3. O cálculo completo requer os três parâmetros. Ausência de um mineral é diferente de zero. Sódio, cloretos, sulfatos, potássio, TDS, resíduo seco, pH, cloro residual, nitrato, fluoreto e sílica são opcionais. Cloro e cloreto são distintos; resíduo seco não é automaticamente TDS.
- **Perfis e gráfico:** três alvos domésticos experimentais (equilibrado, floral, chocolate), referência ampla SCAE e alvo personalizado. Nenhuma pontuação artificial de 0 a 100.
- **Águas:** cadastro, edição, exclusão, busca, comparação de até quatro águas, armazenamento opcional da imagem e do texto OCR. Uma marca pode ter múltiplas fontes e cadastros. Águas com degustações não podem ser excluídas sem excluir os registros vinculados.
- **Laboratório:** mistura de duas águas, diluição por osmose reversa potável (suposta zero), solução da proporção por alcalinidade-alvo, cálculo de adição de sais de grau alimentício (NaHCO3, MgSO4·7H2O, CaCl2·2H2O). As massas são teóricas, não consideram precipitação nem outras reações. Não certifica potabilidade. Para pequenas massas use medição adequada; não substitua a forma hidratada dos sais sem recalcular.
- **Registro:** data, método, café, torra, dose, água, temperatura, moagem, tempo, avaliações 1–5, notas. Guarda uma cópia da composição da água no momento da degustação, preservando o contexto mesmo após edição do cadastro.
- **Dados:** exportação e importação de JSON, exportação em CSV de águas e de degustações. Não há sincronização automática entre dispositivos.

## 4. OCR: boas práticas e limitações

Fotografe de perto, com luz difusa, evitando reflexos e curvatura, preferencialmente com a tabela inteira bem legível, sem outras informações. Gire a foto se necessário. O interpretador reconhece nomes, símbolos e concentração na mesma linha, aceita vírgula/ponto decimal e algumas unidades (mg/L, g/L e µg/L). Se o rótulo não explicitar a unidade, assume mg/L. Confirme a unidade. Valores precedidos por `<` ou `>` e leituras divergentes precisam de revisão. O ponto seguido por três dígitos pode ser separador de milhar: confira. Tabelas cujos nomes e números são extraídos em blocos separados podem requerer preenchimento manual. Não confie exclusivamente no número de confiança média do OCR. A alternativa Live Text: abra a foto no iPhone, copie o texto reconhecido e cole em **Texto reconhecido ou copiado do Live Text > Identificar minerais**. A opção está disponível mesmo sem instalar o pacote OCR.

Exemplo de texto para teste (fictício):

```
Composição química (mg/L)
Bicarbonatos 48,8
Cálcio (Ca²⁺) 20,00
Magnésio (Mg²⁺) 6,00
Sódio 8,4
Cloreto 3,5
Sulfato 4,8
pH 7,2
```

Resultado esperado: alcalinidade 40,0 e dureza total 74,6 mg/L como CaCO3. A foto não é transmitida para nenhuma API.

## 5. Exportar e restaurar

Abra **Dados**:

| Opção | Uso | Conteúdo |
|---|---|---|
| Backup completo (.json) | Restaurar, migrar ou arquivar | Todos os cadastros, perfis personalizados, fotos reduzidas, texto OCR e degustações |
| Águas (.csv para Excel) | Análise tabular | Composição, cálculos, nome/fonte, preço, perfil e observações |
| Degustações (.csv para Excel) | Análise tabular | Identificador da água, composição resumida da época, receita, notas sensoriais e observações |

O CSV tem UTF-8 BOM, separador `;`, vírgula decimal e proteção básica contra injeção de fórmulas em campos textuais. Abra no Excel por Dados > De Texto/CSV se o separador não for detectado. O CSV não é backup restaurável e não contém imagens; use JSON para isso.

Para migrar: exporte JSON no aparelho original, abra o aplicativo de destino, escolha **Importar backup JSON**, selecione o arquivo e confirme. A importação é transacional e mescla por ID, preservando os registros existentes caso haja conflito. Não substitui nem atualiza registros existentes; para uma restauração fiel, use uma base vazia. Registros iguais com IDs diferentes podem gerar duplicatas. Limite de importação: 150 MB. Imagens são JPEG reduzidas.

## 6. Testar no computador (opcional)

Instale Node.js 22 ou compatível (https://nodejs.org/). Abra PowerShell na pasta `water-profile` e execute:

```powershell
npm install
npm test
npm run build
npm run serve
```

Abra http://localhost:8080 no navegador. O build gera `dist` com todos os recursos necessários ao OCR; não abra `index.html` por `file://` para testar PWA. Para testar só a interface sem OCR/dependências: `node scripts/serve.mjs public`. O servidor local é restrito ao computador. Para testar no iPhone, use o endereço HTTPS publicado.

## 7. Atualizar o projeto

Edite os arquivos em `public`, commit e push na branch `main`. O workflow publica automaticamente uma nova versão. O build usa um hash dos arquivos principais para invalidar o cache da interface; a base IndexedDB não é removida. Se alterar a versão do motor OCR, atualize também o nome do cache OCR em `sw.js` e `app.js` para evitar misturar versões. Antes de atualizar ou desinstalar, exporte JSON. Feche e reabra o app para receber a atualização.

## 8. Arquitetura

```
water-profile/
  public/                  # Interface estática
    index.html
    style.css
    core.js                # Química, interpretação de rótulos e CSV
    app.js                 # Interface, banco IndexedDB, OCR
    sw.js                  # Service worker e cache offline
    manifest.webmanifest
    icons/
  scripts/build.mjs        # Empacota motor OCR, modelo e licenças
  scripts/serve.mjs        # Servidor local de teste
  tests/core.test.cjs       # Testes automatizados das funções puras
  .github/workflows/pages.yml
  package.json
```

Os arquivos binários OCR não estão no ZIP: o ambiente de geração não tinha acesso ao npm. O workflow e `npm run build` foram configurados para incluir todos os recursos a partir de versões fixadas dos pacotes. As dependências e a publicação ainda precisam ser efetivamente executadas com rede. Não há package-lock gerado nesta entrega; após `npm install`, pode versioná-lo para reproduzir a resolução das dependências transitivas.

Referências: Marco Wellinger, *The SCAE Water Chart* (2016), https://prokofe.ru/files/public/1538133029_16273_FT0_the_scae_water_chart-_measure_aim_treat_marco_wellinger_2016.pdf (faixa ampla de dureza 50–175 e alcalinidade 40–75; a geometria simplificada no app é apenas referência); Wellinger, Smrke e Yeretzian, *The SCA Water Quality Handbook* (2018); Colonna-Dashwood e Hendon, *Water for Coffee* (2015); SCAA Water Standard 2009 (dureza cálcica, não dureza total). OCR: https://github.com/naptha/tesseract.js/blob/master/docs/local-installation.md. As faixas domésticas e os diagnósticos são heurísticas para experimentação, não certificação de adequação sensorial.
