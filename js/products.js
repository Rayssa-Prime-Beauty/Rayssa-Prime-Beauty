/* =========================================================
   LUMINA — CATÁLOGO DE PRODUTOS
   =========================================================
   EDIÇÃO RÁPIDA
   - ADICIONAR: copie um bloco products.push({...});
   - EDITAR: altere os campos do produto.
   - REMOVER: apague o bloco products.push({...});
   - Não é necessário usar vírgula entre os produtos.
   - Mantenha um ID único para cada produto já publicado.
   - LINKS DO GOOGLE DRIVE: links compartilhados também são aceitos.
     Ex.: https://drive.google.com/file/d/ID_DA_IMAGEM/view?usp=sharing
     O arquivo precisa estar como "Qualquer pessoa com o link".
   ========================================================= */

const products = [];

products.push({
  id: 1,
  title: "Lápis Retrátil para os Olhos à Prova D'Água Mary Kay",
  category: "Maquiagem",
  status: "disponivel",
  priceNumber: 39.90,
  images: [
    "https://http2.mlstatic.com/D_Q_NP_863504-MLA111479741366_052026-F.webp",
    "https://http2.mlstatic.com/D_Q_NP_994032-MLA111480141064_052026-F.webp",
    "https://http2.mlstatic.com/D_Q_NP_791083-MLA111480170484_052026-F.webp",
    "https://http2.mlstatic.com/D_Q_NP_775353-MLA115612174370_092026-F.webp",
    "https://http2.mlstatic.com/D_Q_NP_636027-MLA117054925207_092026-F.webp"
  ],
  description: `O mecanismo de longa duração mantém a pigmentação definida nos olhos sem a necessidade de reaplicação frequente. A composição à prova d'água evita que o produto borre ou crie manchas indesejadas ao longo do dia em dias quentes.`,
  variations: {
    "Cor": ["Azul"]
  }
});

products.push({
  id: 2,
  title: "Batom Cremoso Fuchsia Mary Kay",
  category: "Maquiagem",
  status: "vendido",
  priceNumber: 54.90,
  images: [
    "https://down-br.img.susercontent.com/file/sg-11134201-823p7-moy9y2w5vxfkf5.webp",
    "https://down-br.img.susercontent.com/file/br-11134207-820le-mpc4qtyaudxhb4@resize_w450_nl.webp",
  ],
  description: `O mecanismo de longa duração mantém a pigmentação definida nos olhos sem a necessidade de reaplicação frequente. A composição à prova d'água evita que o produto borre ou crie manchas indesejadas ao longo do dia em dias quentes.`,
  variations: {
    "Cor": ["Fuchsia"]
  }
});

products.push({
  id: 3,
  title: "Gel de Limpeza Facial Mary Kay TimeWise 4 em 1 127g",
  category: "limpeza facial",
  status: "disponivel",
  priceNumber: 78.90,
  images: [
    "https://down-br.img.susercontent.com/file/br-11134207-820lu-mrvj3v85we10bd@resize_w450_nl.webp",
    "https://down-br.img.susercontent.com/file/br-11134207-820l9-mrvkv0xocop195@resize_w450_nl.webp"
  ],
  description: "O Gel de Limpeza 4 em 1 TimeWise® limpa, demaquila, refresca e realiza uma leve esfoliação, deixando a pele com aparência luminosa. Prepara o rosto para as próximas etapas de cuidado diário, removendo suavemente impurezas, maquiagem, resíduos de produtos e poluição e a textura da pele é melhorada e renovada.",
  variations: {}
});

products.push({
  id: 4,
  title: "Creme Para Área Dos Olhos Timewise Mary Kay 14g",
  category: "Skincare",
  status: "disponivel",
  priceNumber: 83.90,
  images: [
    "https://http2.mlstatic.com/D_Q_NP_617799-MLB110914586891_042026-F-creme-para-area-dos-olhos-mary--kay-timewise.webp",
    "https://http2.mlstatic.com/D_Q_NP_818069-MLB110914322943_042026-F-creme-para-area-dos-olhos-mary--kay-timewise.webp",
    "https://http2.mlstatic.com/D_Q_NP_987856-MLB110914238435_042026-F-creme-para-area-dos-olhos-mary--kay-timewise.webp",
  ],
  description: "O Creme para Área dos Olhos TimeWise® foi formulado especialmente para atender às necessidades únicas da área dos olhos, este creme para os olhos ajuda a melhorar linhas finas, opacidade, firmeza e textura da pele. Graças a 12 horas de hidratação¹ e a área dos olhos visivelmente iluminada, você pode desfutar de uma pele com a aparência mais descansada.",
  variations: {}
});

products.push({
  id: 5,
  title: "Base Mary Kay TimeWise 3D Matte 30 ml Original",
  category: "Bases Líquidas",
  status: "vendido",
  priceNumber: 82.90,
  images: [
    "https://down-br.img.susercontent.com/file/br-11134207-820mc-mqbzs0mbthc346@resize_w450_nl.webp",
    "https://down-br.img.susercontent.com/file/br-11134207-820m4-mqbzs0mbs2rn36@resize_w450_nl.webp",
  ],
  description: `Base Mary Kay TimeWise 3D Matte 30ml
A Base Mary Kay TimeWise 3D Matte foi desenvolvida para proporcionar cobertura uniforme, controle da oleosidade e acabamento matte de longa duração. Sua fórmula leve ajuda a deixar a pele com aparência natural, confortável e impecável ao longo do dia.`,
  variations: {}
});

products.push({
  id: 6,
  title: "Creme Hidratante Diurno Fps 30 Timewise Da Mary Kay",
  category: "Bases Líquidas",
  status: "disponivel",
  priceNumber: 82.90,
  images: [
    "https://http2.mlstatic.com/D_Q_NP_942467-MLA115132790043_072026-F-locao-diurna-timewise-mary-kay-fps-30-29g.webp",
    "https://http2.mlstatic.com/D_Q_NP_716242-MLB113834237638_072026-F-locao-diurna-timewise-mary-kay-fps-30-29g.webp",
    "https://http2.mlstatic.com/D_Q_NP_892889-MLB89362755671_082025-F-creme-hidratante-facial-diurno-fps-30-timewise-da-mary-kay.webp",
  ],
  description: `CUIDADO DIÁRIO + PROTEÇÃO EM UM SÓ PRODUTO!
A loção diurna com FPS 30 é perfeita para quem busca praticidade, proteção e cuidado com a pele todos os dias. Com textura leve e rápida absorção, ela protege contra os danos do sol e da luz azul, ajudando a manter a pele saudável e jovem por mais tempo.`,
  variations: {}
});

products.push({
  id: 7,
  title: "Gel de Recuperação Noturna Time Wise Mary Kay Todo Tipo De Pele Noite",
  category: "Skincare ",
  status: "disponivel",
  priceNumber: 133.90,
  images: [
    "https://http2.mlstatic.com/D_Q_NP_982749-MLA112333771712_062026-F.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_729822-MLA113487977579_062026-F.webp",
    "https://http2.mlstatic.com/D_Q_NP_613908-MLA113819938589_062026-F-mary-kay-timewise-gel-noturno-recuperacao-facial.webp",
  ],
  description: `O Gel de Recuperação Noturna TimeWise é ideal para reconstruir suas reservas e recuperar o que foi perdido durante o dia.
Este produto noturno eficaz é enriquecido com um aumento adicional de antioxidante do extrato de camomila, conhecido por ajudar a trazer uma calma relaxante à pele enquanto você dorme.
Ao acordar, sua pele terá uma aparência descansada e uma sensação de renovação, com linhas de expressão suavizadas e a aparência das rugas reduzida.`,
  variations: {}
});

products.push({
  id: 8,
  title: "Gel Corporal Maça E Amendoas 200gr Mary Kay",
  category: "Corpo e Banho",
  status: "vendido",
  priceNumber: 55.90,
  images: [
    "https://http2.mlstatic.com/D_NQ_NP_2X_741550-MLA113243230627_062026-F-gel-corporal-maca-e-amendoas-200gr-mary-kay.webp",
    "https://http2.mlstatic.com/D_NQ_NP_2X_657712-MLA112104475000_062026-F-gel-corporal-maca-e-amendoas-200gr-mary-kay.webp",
   ],
  description: `O Gel de Limpeza Corporal Perfumado Mary Kay® Maçã e Amêndoa transforma seu banho em um momento delicioso de cuidado e perfume.
Com espuma cremosa e fragrância envolvente, limpa a pele suavemente enquanto deixa um toque hidratado e aveludado.
A fragrância combina a doçura da maçã com o toque sofisticado da amêndoa, criando um aroma delicado, feminino e irresistível.`,
  variations: {}
});


/*
===========================================================
MODELO PARA NOVOS PRODUTOS — COPIE E COLE
===========================================================

products.push({
  id: 5,
  title: "Nome do produto",
  category: "Categoria",
  status: "disponivel",
  priceNumber: 199.90,
  images: [
    "https://endereco-da-imagem.jpg",
    // Google Drive compartilhado também funciona:
    // "https://drive.google.com/file/d/ID_DA_IMAGEM/view?usp=sharing"
  ],
  description: `Descrição do produto.
Você pode escrever várias linhas aqui sem quebrar o catálogo.`,
  variations: {}
});

Com tamanho:
variations: {
  "Tamanho": ["P", "M", "G", "GG"]
}

Com tamanho e cor:
variations: {
  "Tamanho": ["P", "M", "G"],
  "Cor": ["Preto", "Vermelho", "Azul"]
}

Preço diferente por variação:
variantPrices: {
  "Cor=Branco|Tamanho=40": 319.90
}

Status: disponivel | sem-estoque | vendido
===========================================================
*/
