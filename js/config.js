/* =========================================================
   RAYSSA PRIME BEAUTY — CONFIGURAÇÕES DA LOJA
   ========================================================= */

/* =========================================================
   CONTROLE CENTRAL DE VERSÃO E ATUALIZAÇÃO
   Altere apenas este número ao publicar uma nova versão.
   Sacola, Favoritos e Perfil usam chaves próprias e NÃO são apagados.
   ========================================================= */
const LUMINA_APP_VERSION = "6.2.0";
window.LUMINA_SITE_VERSION = LUMINA_APP_VERSION;
window.LUMINA_VERSION_FILE = "version.json";

/*
   REDES SOCIAIS
   Substitua pelos endereços oficiais da RAYSSA PRIME BEAUTY.
*/
const LUMINA_SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/_rayssasales_?utm_source=qr&igsi=c3VwMDdrdnJkaGpn",
  tiktok: "https://www.tiktok.com/",
  desenvolvedor: "https://www.instagram.com/paulinho_advc?stkn=Z21rcWdyNmVlazFo"
};

/*
   BANNER
   Você pode colocar quantas imagens quiser nesta lista.
   Elas serão exibidas automaticamente, uma após a outra.
   Links compartilhados do Google Drive também são aceitos, por exemplo:
   https://drive.google.com/file/d/ID_DA_IMAGEM/view?usp=sharing (o arquivo precisa estar como "Qualquer pessoa com o link")
*/
const LUMINA_BANNER_IMAGES = [
  // Cole aqui um link direto de imagem. O formato src, url ou local é aceito.
  {
    src: "https://drive.google.com/file/d/1_EY-27jE3rerjYoOCtvXqILhK-4QhiTK/view?usp=drive_link",
    alt: "Destaque RAYSSA PRIME BEAUTY"
  },
  {
    src: "https://drive.google.com/file/d/1WsyMRdezmo-SRJD5DshlFQntdUiaegyQ/view?usp=drive_link",
    alt: "Novidades RAYSSA PRIME BEAUTY"
  },
  {
    src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=85",
    alt: "Coleção RAYSSA PRIME BEAUTY"
  },
  {
    src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85",
    alt: "Estilo RAYSSA PRIME BEAUTY"
  }
];

/* Compatibilidade global: app.js e profile.html leem estas configurações por window.
   Mantém as mesmas informações e apenas corrige o acesso às configurações. */
window.LUMINA_SOCIAL_LINKS = LUMINA_SOCIAL_LINKS;
window.LUMINA_BANNER_IMAGES = LUMINA_BANNER_IMAGES;


// Mensagens editáveis das redes sociais
window.RAYSSA_SOCIAL_MESSAGES = {
  Instagram: { text: "Acompanhe a RAYSSA PRIME BEAUTY no Instagram para ver novidades, lançamentos, inspirações e conteúdos da loja.", button: "Ir para o Instagram" },
  TikTok: { text: "Em breve, a RAYSSA PRIME BEAUTY também estará no TikTok! Estamos preparando conteúdos especiais com novidades, tendências, dicas e muito mais para você. Aguarde!" },
  Desenvolvedor: { text: "Site desenvolvido por PRMdL, com dedicação, criatividade e atenção aos detalhes. Um projeto criado especialmente para a RAYSSA PRIME BEAUTY, unindo design moderno, funcionalidade e uma experiência prática e agradável para seus clientes.", button: "Conhecer o desenvolvedor" }
};
