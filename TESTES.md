# Verificação da entrega

- `npm test`: 7 testes automatizados passaram (conversões, entradas inválidas e ausentes, interpretação de rótulos de exemplo, unidades e limites, mistura, remineralização, CSV).
- `node --check`: verificação de sintaxe de app.js, core.js, sw.js, build.mjs e serve.mjs.
- O ambiente bloqueou navegação HTTP/HTTPS no Chromium (`ERR_BLOCKED_BY_ADMINISTRATOR`) e não resolveu o domínio do registro npm. Portanto, não foi possível completar testes de interface/IndexedDB, instalação do service worker, build com os binários OCR, reconhecimento de fotografia ou instalação em iPhone. A publicação e o teste de aceitação abaixo são necessários.

## Teste de aceitação após publicar

1. Instale pelo Safari; abra o app na tela inicial. Em Dados, prepare o OCR offline.
2. Na Análise, cole o texto fictício do README. Verifique alcalinidade 40,0 e dureza 74,6; confirme os campos marcados.
3. Cadastre uma água fictícia. Compare com outro registro; edite e confira os valores.
4. No Lab, informe água A = alcalinidade 80, dureza 120, água B = zero, volume 1.000 mL, alvo 40. Resultado: 500 mL de cada; dureza final 60.
5. Cadastre uma degustação e exporte os dois CSV e o JSON. Verifique os arquivos. Em outro perfil de navegador, importe o JSON e confira a base. Repita a importação e confirme que não duplica os mesmos IDs.
6. Reconheça a foto de um rótulo real e compare os números com o rótulo. Ative modo avião, encerre/reabra o app e repita o OCR, análise e cadastro. Exporte outro backup.
7. Se o OCR falhar, use Live Text e cole o texto, ou digite os valores manualmente. Se a interface ou banco falhar, não use a base para registros importantes até corrigir.
