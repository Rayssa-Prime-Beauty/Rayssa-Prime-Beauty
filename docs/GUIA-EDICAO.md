# LUMINA — Guia rápido de edição de produtos

## 1. Adicionar, editar ou remover produto

Edite somente `js/products.js`.

### Adicionar
Copie um bloco `products.push({...});` e altere os dados:

```js
products.push({
  id: 5,
  title: "Bolsa Minimalista",
  category: "Bolsas",
  status: "disponivel",
  priceNumber: 199.90,
  images: [
    "https://endereco-da-imagem.jpg"
  ],
  description: "Descrição do produto.",
  variations: {}
});
```

**Importante:** não é necessário colocar vírgula entre os produtos. Isso evita o erro comum de esquecer uma vírgula e fazer a vitrine inteira deixar de carregar.

### Editar
Encontre o bloco do produto e altere apenas o campo desejado, como `title`, `priceNumber`, `images`, `description`, `status` ou `variations`.

### Remover
Apague o bloco inteiro `products.push({...});` daquele produto.

### IDs
Cada produto publicado deve ter um `id` único. Não reutilize o ID de um produto antigo se clientes já puderem ter esse produto nos favoritos ou na sacola.


### Produto vendido ou sem estoque

Use:

```js
status: "vendido"
```

ou:

```js
status: "sem-estoque"
```

Quando um desses status estiver ativo:
- o preço não aparece no card;
- aparece `Vendido` ou `Sem estoque`;
- o botão da sacola fica bloqueado;
- o cliente não consegue adicionar o item ao carrinho.

Para voltar a vender, troque para:

```js
status: "disponivel"
```

### Atenção ao cadastrar

- Cada produto precisa de um `id` diferente.
- `priceNumber` é número: `419.90`, sem `R$`.
- `images` precisa ser uma lista, mesmo com uma imagem.
- Separe os produtos com vírgula.
- Não apague a vírgula entre produtos.
- Não coloque duas propriedades com o mesmo nome.
- Uma URL de imagem deve estar entre aspas.

## 2. Sem variações

```js
variations: {}
```

## 3. Com tamanho

```js
variations: {
  "Tamanho": ["P", "M", "G", "GG"]
}
```

## 4. Com tamanho e cor

```js
variations: {
  "Tamanho": ["P", "M", "G"],
  "Cor": ["Preto", "Vermelho", "Azul"]
}
```

## 5. Preço diferente por variação

```js
variantPrices: {
  "Cor=Branco|Tamanho=40": 319.90
}
```

A aplicação organiza os nomes automaticamente.

## 6. Atualizações sem cadastro

A LUMINA agora identifica uma nova versão pelo valor:

```js
const LUMINA_SITE_VERSION = "5.0.3";
```

Sempre que publicar uma atualização importante, aumente esse número, por exemplo:

```js
const LUMINA_SITE_VERSION = "5.0.1";
```

Na próxima entrada do cliente, aparece um aviso animado de novidade.

Se o cliente já tiver autorizado notificações no navegador/celular, a LUMINA também pode mostrar a novidade como uma notificação do dispositivo.

**Importante:** sem um servidor de push, a notificação do celular depende do cliente ter aberto/visitado a LUMINA e concedido permissão. Para avisos mesmo com o site totalmente fechado, será necessário adicionar um serviço de Push/servidor.

## 7. Redes sociais

Os links das redes sociais ficam centralizados em `js/config.js`.

Edite somente os três endereços: `instagram`, `tiktok` e `pinterest`.
Exemplo:

```js
const LUMINA_SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/sua-loja/",
  tiktok: "https://www.tiktok.com/@sua-loja",
  pinterest: "https://www.pinterest.com/sua-loja/"
};
```

No **Perfil**, tocar em uma rede social abre uma tela de informação com um botão **Ir para...**. O botão leva ao endereço configurado.

## 8. Banner rotativo

As imagens do banner ficam em `js/config.js`, na lista `LUMINA_BANNER_IMAGES`. Você pode colocar quantas imagens quiser:

```js
const LUMINA_BANNER_IMAGES = [
  "https://endereco-da-imagem-1.jpg",
  "https://endereco-da-imagem-2.jpg",
  "https://endereco-da-imagem-3.jpg"
];
```

O banner alterna automaticamente as imagens e também permite trocar manualmente pelos pontos na parte inferior.

## 9. Cadastro/login

O cadastro deixou de ser obrigatório. O cliente pode navegar, favoritar e comprar sem criar usuário.

A sacola e os favoritos continuam sendo salvos localmente no dispositivo.

## 10. Navegação inferior

A barra `Sacola / Categorias / Perfil / Favoritos / Instalar` aparece em telas pequenas e também no PC, mantendo as mesmas ações e o mesmo estilo. O rodapé institucional não é exibido, para evitar duplicidade com a navegação inferior.

## Estrutura

- `index.html` — estrutura das telas.
- `css/style.css` — aparência.
- `js/config.js` — links das redes sociais e imagens do banner.
- `js/products.js` — catálogo.
- `js/state.js` — sacola/favoritos.
- `js/app.js` — comportamento e notificações.
- `manifest.json` — PWA.
- `sw.js` — cache.


## 11. Descrição com várias linhas e variações

Para descrições longas ou com parágrafos, use **crases** (backticks):

```js
description: `Primeiro parágrafo.

Segundo parágrafo com mais informações sobre o produto.`,
```

Isso evita que uma quebra de linha dentro da descrição cause erro de JavaScript e faça todos os produtos desaparecerem.

Variações continuam assim:

```js
variations: {
  "Tamanho": ["P", "M", "G", "GG"],
  "Cor": ["Preto", "Branco", "Vermelho"]
}
```

A aplicação também normaliza valores de variação para impedir que uma opção inválida afete o restante da vitrine.

## 7. Status e destaques do produto

A loja possui dois campos independentes. Isso permite, por exemplo, deixar um produto como **Disponível** e ao mesmo tempo marcar **Promoção**.

### Status padrão (campo `status`)

Use um destes valores:

```js
status: "disponivel"
status: "esgotado"
status: "indisponivel"
status: "em-breve"
status: "sob-encomenda"
status: "pre-venda"
```

Comportamento:
- `disponivel`: pode ser adicionado à Sacola.
- `esgotado`: bloqueia a compra e mostra “Esgotado”.
- `indisponivel`: bloqueia a compra e mostra “Indisponível”.
- `em-breve`: bloqueia a compra e mostra “Em breve”.
- `sob-encomenda`: continua permitindo o pedido e muda o botão para “Solicitar por Encomenda”.
- `pre-venda`: continua permitindo o pedido e muda o botão para “Reservar na Pré-venda”.

Os valores antigos `sem-estoque` e `vendido` continuam sendo reconhecidos por compatibilidade e são tratados como `esgotado`.

### Destaques comerciais (campo `highlight`)

Use um destes valores:

```js
highlight: "novo"
highlight: "lancamento"
highlight: "promocao"
highlight: "destaque"
highlight: "mais-vendido"
highlight: "ultimas-unidades"
```

Eles aparecem como uma etiqueta comercial no card e na tela do produto.

### Exemplo recomendado

```js
{
  id: 108,
  title: "Camiseta M.R",
  category: "Camisetas",
  status: "disponivel",
  highlight: "promocao",
  priceNumber: 59.90,
  images: ["https://endereco-da-imagem.jpg"],
  description: "Descrição do produto.",
  variations: {
    "Tamanho": ["P", "M", "G", "GG"],
    "Cor": ["Preta", "Branca"]
  }
}
```

## 7. Status e destaques do produto

A loja usa dois campos independentes. Assim, um produto pode estar **Disponível** e ter o destaque **Promoção** ao mesmo tempo.

### Status padrão (`status`)

```js
status: "disponivel"
status: "esgotado"
status: "indisponivel"
status: "em-breve"
status: "sob-encomenda"
status: "pre-venda"
```

`disponivel` permite compra. `esgotado`, `indisponivel` e `em-breve` bloqueiam a compra. `sob-encomenda` e `pre-venda` permitem o pedido, com botão específico.

Os valores antigos `sem-estoque` e `vendido` continuam reconhecidos e são tratados como `esgotado`.

### Destaques comerciais (`highlight`)

```js
highlight: "novo"
highlight: "lancamento"
highlight: "promocao"
highlight: "destaque"
highlight: "mais-vendido"
highlight: "ultimas-unidades"
```

### Exemplo

```js
{
  id: 108,
  title: "Camiseta M.R",
  category: "Camisetas",
  status: "disponivel",
  highlight: "promocao",
  priceNumber: 59.90,
  images: ["https://endereco-da-imagem.jpg"],
  description: "Descrição do produto.",
  variations: { "Tamanho": ["P", "M", "G", "GG"] }
}
```
