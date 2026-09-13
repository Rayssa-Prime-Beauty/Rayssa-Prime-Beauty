RAYSSA PRIME BEAUTY — BANNERS

O banner principal aceita várias imagens e alterna automaticamente.

FORMATOS SUPORTADOS:

1) LINK DE IMAGEM:
{ src: "https://site.com/minha-imagem.jpg", alt: "Descrição" }

2) LINK COM FALLBACK LOCAL:
{
  src: "https://site.com/minha-imagem.jpg",
  fallback: "assets/banner/banner-01.jpg",
  alt: "Descrição"
}

3) IMAGEM LOCAL:
{ local: "assets/banner/minha-foto.jpg", alt: "Descrição" }

Também são aceitos os nomes "url", "src" e "image" para a origem da imagem.

Para usar fotos locais:
- coloque as imagens dentro de assets/banner/
- depois informe o caminho, por exemplo:
  assets/banner/banner-01.jpg
  assets/banner/banner-02.jpg

O slogan continua em um banner separado logo abaixo do carrossel.

IMPORTANTE:
- Não apague a lista LUMINA_BANNER_IMAGES.
- Você pode adicionar quantas imagens quiser.
- Cada produto continua usando o campo images normalmente.
