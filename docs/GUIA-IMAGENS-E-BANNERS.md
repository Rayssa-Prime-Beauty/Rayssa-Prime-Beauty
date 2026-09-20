# RAYSSA PRIME BEAUTY — Guia de imagens e banners

As imagens da vitrine podem ser configuradas por URL externa ou por arquivo local.

## Google Drive

Para usar uma imagem do Google Drive:
1. Compartilhe o arquivo como "Qualquer pessoa com o link".
2. Use o link do arquivo no cadastro/configuração.
3. O navegador precisa conseguir acessar a imagem publicamente.

## Banners

Os banners da Home ficam configurados em `js/config.js`, nas listas `LUMINA_BANNER_IMAGES` e `LUMINA_NEW_BANNER_IMAGES`. Os nomes internos foram preservados por compatibilidade com a estrutura existente.

Cada item pode informar `src` e `alt`. Os banners têm autoplay, indicadores, toque/deslize e visualização em tela cheia.
