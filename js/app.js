/* --------------------------------------------------
       PRODUTOS
    -------------------------------------------------- */

    /* --------------------------------------------------
       IMAGENS DOS PRODUTOS — GOOGLE DRIVE
       Aceita links diretos e links compartilhados do Google Drive.
       O link é convertido automaticamente para uma URL de imagem.
       Ex.: https://drive.google.com/file/d/ID/view?usp=sharing
    -------------------------------------------------- */
    function getGoogleDriveImageId(value) {
      const url = String(value || "").trim();
      if (!url) return "";
      let match = url.match(/(?:drive|docs)\.google\.com\/file\/d\/([^\/?#]+)/i);
      if (match) return decodeURIComponent(match[1]);
      match = url.match(/[?&]id=([^&#]+)/i);
      if (match && /(?:drive|docs)\.google\.com/i.test(url)) return decodeURIComponent(match[1]);
      return "";
    }

    function normalizeProductImageUrl(value) {
      const url = String(value || "").trim();
      if (!url) return "";
      const id = getGoogleDriveImageId(url);
      if (id) return "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w2000";
      return url;
    }

    function getProductImageCandidates(value) {
      const original = String(value || "").trim();
      const id = getGoogleDriveImageId(original);
      if (!id) return original ? [original] : [];
      const encoded = encodeURIComponent(id);
      return [
        "https://drive.google.com/thumbnail?id=" + encoded + "&sz=w2000",
        "https://drive.google.com/uc?export=view&id=" + encoded,
        "https://lh3.googleusercontent.com/d/" + encoded + "=w2000"
      ];
    }

    // Compatibilidade: se um endpoint do Google Drive falhar em determinado
    // navegador/WebView, tenta automaticamente o próximo sem alterar o produto.
    document.addEventListener("error", function(event) {
      const img = event.target;
      if (!(img instanceof HTMLImageElement)) return;
      const source = img.dataset && img.dataset.originalImage;
      if (!source) return;
      const candidates = getProductImageCandidates(source);
      const current = Number(img.dataset.imageCandidate || 0);
      if (current + 1 < candidates.length) {
        img.dataset.imageCandidate = String(current + 1);
        img.src = candidates[current + 1];
      }
    }, true);

    /* --------------------------------------------------
       ESTADO DA APLICAÇÃO
    -------------------------------------------------- */

    let activeProduct = null;

    /*
      CORREÇÃO PRINCIPAL:
      A variação selecionada agora fica armazenada
      em uma variável independente do HTML.
    */
    let selectedVariations = {};

    let selectedCategory = "Todas";

    let deliveryType = "delivery";

    // Forma de pagamento escolhida no checkout.
    let paymentType = "pix";

    let currentStep = 1;

    /* --------------------------------------------------
       ELEMENTOS
    -------------------------------------------------- */

    const grid =
      document.getElementById("productsGrid");

    const noveltyGrid =
      document.getElementById("noveltyProductsGrid");

    const favGrid =
      document.getElementById("favoritesGrid");

    const modal =
      document.getElementById("productModal");

    const cartFullscreen =
      document.getElementById("cartFullscreen");

    const favFullscreen =
      document.getElementById("favFullscreen");

    const categoriesFullscreen =
      document.getElementById("categoriesFullscreen");

    const checkoutStep1 =
      document.getElementById("checkoutStep1");

    const checkoutStep2 =
      document.getElementById("checkoutStep2");

    /* --------------------------------------------------
       MOEDA
    -------------------------------------------------- */

    function formatCurrency(val) {
      const number = Number(val);
      return (Number.isFinite(number) ? number : 0).toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL"
        }
      );
    }

    /* --------------------------------------------------
       BARRA DE PROGRESSO
    -------------------------------------------------- */

    function updateProgressStep(step) {

      currentStep = step;

      const fill =
        document.getElementById("progressLineFill");

      const label =
        document.getElementById("progressTextLabel");

      const percent =
        document.getElementById("progressTextPercent");

      const step1El =
        document.getElementById("step1");

      const step2El =
        document.getElementById("step2");

      const step3El =
        document.getElementById("step3");

      if (step === 1) {

        fill.style.width = "0%";

        label.textContent =
          "Etapa 1 de 3: Sacola";

        percent.textContent =
          "33%";

        step1El.classList.add("achieved");
        step2El.classList.remove("achieved");
        step3El.classList.remove("achieved");

      }

      else if (step === 2) {

        fill.style.width = "50%";

        label.textContent =
          "Etapa 2 de 3: Dados de Entrega";

        percent.textContent =
          "66%";

        step1El.classList.add("achieved");
        step2El.classList.add("achieved");
        step3El.classList.remove("achieved");

      }

      else if (step === 3) {

        fill.style.width = "100%";

        label.textContent =
          "Etapa 3 de 3: Revisão & WhatsApp";

        percent.textContent =
          "100%";

        step1El.classList.add("achieved");
        step2El.classList.add("achieved");
        step3El.classList.add("achieved");

      }

    }

    /* --------------------------------------------------
       CATEGORIAS
    -------------------------------------------------- */

    function openCategories() {

      showInteractionLoading("Abrindo categorias...");
      renderCategoriesList();

      categoriesFullscreen.classList.add("active");
      luminaOpenOverlay("categoriesFullscreen");

      document.body.style.overflow = "hidden";

    }

    function closeCategories() {

      luminaCloseOverlay("categoriesFullscreen");

      document.body.style.overflow = "auto";

    }

    function renderCategoriesList() {

      const categories =
        [
          "Todas",
          ...new Set(
            products.map(
              p => p.category
            )
          )
        ];

      document.getElementById(
        "categoriesList"
      ).innerHTML = categories.map(
        cat => `

          <div
            class="category-item ${selectedCategory === cat ? "active" : ""}"
            onclick="filterCategory('${cat}')">

            <span>${cat}</span>

            <svg viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>

          </div>

        `
      ).join("");

    }

    function filterCategory(catName) {

      showInteractionLoading(`Carregando ${catName}...`);
      selectedCategory = catName;

      closeCategories();

      const categoryBar =
        document.getElementById("categoryBar");

      if (selectedCategory === "Todas") {

        categoryBar.style.display =
          "none";

      } else {

        document.getElementById(
          "categoryTitle"
        ).textContent =
          `Categoria: ${selectedCategory}`;

        categoryBar.style.display =
          "flex";

      }

      filterProducts();

    }

    /* --------------------------------------------------
       CARDS
    -------------------------------------------------- */

    /* --------------------------------------------------
       STATUS DO PRODUTO
    -------------------------------------------------- */
    const PRODUCT_AVAILABILITY_STATUSES = {
      "disponivel": "Disponível",
      "esgotado": "Esgotado",
      "indisponivel": "Indisponível",
      "em-breve": "Em breve",
      "sob-encomenda": "Sob encomenda",
      "pre-venda": "Pré-venda"
    };

    const PRODUCT_HIGHLIGHTS = {
      "novo": "Novo",
      "lancamento": "Lançamento",
      "promocao": "Promoção",
      "destaque": "Destaque",
      "mais-vendido": "Mais vendido",
      "ultimas-unidades": "Últimas unidades"
    };

    const PRODUCT_STATUS_ALIASES = {
      "sem-estoque": "esgotado",
      "sem estoque": "esgotado",
      "sem_estoque": "esgotado",
      "esgotado": "esgotado",
      "esgotada": "esgotado",
      "sold-out": "esgotado",
      "sold out": "esgotado",
      "vendido": "esgotado",
      "indisponível": "indisponivel",
      "indisponivel": "indisponivel",
      "em breve": "em-breve",
      "em_breve": "em-breve",
      "sob encomenda": "sob-encomenda",
      "sob_encomenda": "sob-encomenda",
      "pre venda": "pre-venda",
      "pré venda": "pre-venda",
      "pré-venda": "pre-venda",
      "pre-venda": "pre-venda"
    };

    function normalizeProductStatus(value) {
      const raw = String(value || "disponivel").toLowerCase().trim();
      const normalized = PRODUCT_STATUS_ALIASES[raw] || raw;
      return Object.prototype.hasOwnProperty.call(PRODUCT_AVAILABILITY_STATUSES, normalized)
        ? normalized
        : "disponivel";
    }

    function normalizeProductHighlight(value) {
      const raw = String(value || "").toLowerCase().trim();
      const normalized = raw === "últimas unidades" ? "ultimas-unidades" : raw;
      return Object.prototype.hasOwnProperty.call(PRODUCT_HIGHLIGHTS, normalized)
        ? normalized
        : "";
    }

    function getProductStatus(product) {
      return normalizeProductStatus(product?.status);
    }

    function getProductStatusLabel(product) {
      return PRODUCT_AVAILABILITY_STATUSES[getProductStatus(product)] || "";
    }

    function getProductHighlight(product) {
      return normalizeProductHighlight(product?.highlight || product?.badge);
    }

    function getProductHighlightLabel(product) {
      return PRODUCT_HIGHLIGHTS[getProductHighlight(product)] || "";
    }

    function isProductAvailable(product) {
      return ["disponivel", "sob-encomenda", "pre-venda"].includes(getProductStatus(product));
    }

    function isProductBlocked(product) {
      return ["esgotado", "indisponivel", "em-breve"].includes(getProductStatus(product));
    }

    function createCardHTML(p) {

      // Um cadastro incompleto nunca deve impedir os demais produtos de aparecer.
      // O catálogo pode ser editado diretamente em js/products.js.
      const safeProduct = (p && typeof p === "object") ? p : {};
      const isFav = favorites.includes(Number(safeProduct.id));
      const imageList = Array.isArray(safeProduct.images) ? safeProduct.images.filter(Boolean) : [];
      const firstImage = imageList[0] || "";
      const safeTitle = String(safeProduct.title || "Produto sem nome");

      return `

        <div
          class="product-card ${isProductAvailable(p) ? "" : "product-card-unavailable"}"
          onclick="openModal(${Number(safeProduct.id)})">

          <button
            class="card-fav-btn ${isFav ? "active" : ""}"
            onclick="toggleFavorite(event, ${Number(safeProduct.id)})">

            <svg viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>

          </button>

          <div class="product-image-wrap">

            <img
              src="${escapeHTML(normalizeProductImageUrl(firstImage))}" data-original-image="${escapeHTML(firstImage)}" data-image-candidate="0"
              alt="${escapeHTML(safeTitle)}"
              loading="lazy">

            ${getProductHighlightLabel(safeProduct) ? `<span class="product-badge product-badge-highlight">${escapeHTML(getProductHighlightLabel(safeProduct))}</span>` : ""}
            ${isProductBlocked(safeProduct) ? `<span class="product-badge product-badge-status status-${getProductStatus(safeProduct)}">${escapeHTML(getProductStatusLabel(safeProduct))}</span>` : ""}

          </div>

          <div class="product-info">

            <h3 class="product-title">
              ${escapeHTML(safeTitle)}
            </h3>

            <div class="product-price ${isProductBlocked(safeProduct) ? "product-status-unavailable" : ""}">
              ${isProductBlocked(safeProduct) ? getProductStatusLabel(safeProduct) : formatCurrency(Number(safeProduct.priceNumber) || 0)}
            </div>

          </div>        </div>

      `;

    }

    function renderProducts(items) {
      const mainItems = items.filter(p => !["novo", "lancamento"].includes(String(p.highlight || "").toLowerCase()));
      const noveltyItems = items.filter(p => ["novo", "lancamento"].includes(String(p.highlight || "").toLowerCase()));

      const emptyHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">
          Nenhum produto encontrado.
        </div>`;

      if (grid) grid.innerHTML = mainItems.length ? mainItems.map(p => createCardHTML(p)).join("") : emptyHTML;
      if (noveltyGrid) noveltyGrid.innerHTML = noveltyItems.length ? noveltyItems.map(p => createCardHTML(p)).join("") : emptyHTML;

      const count = document.getElementById("noveltyCount");
      if (count) count.textContent = noveltyItems.length ? `${noveltyItems.length} ${noveltyItems.length === 1 ? "produto" : "produtos"}` : "";

      const noveltySection = document.querySelector(".novelty-section");
      const secondaryBanner = document.querySelector(".secondary-banner-section");
      const showNovelty = noveltyItems.length > 0;
      if (noveltySection) noveltySection.style.display = showNovelty ? "block" : "none";
      if (secondaryBanner) secondaryBanner.style.display = showNovelty ? "block" : "none";
    }

    function filterProducts() {

      const input = document.getElementById("searchInput");
      const query = input.value.toLowerCase();
      const clearBtn = document.getElementById("searchClearBtn");
      if (clearBtn) clearBtn.classList.toggle("visible", query.length > 0);

      const filtered =
        products.filter(p => {

          const matchesCategory =
            selectedCategory === "Todas" ||
            p.category === selectedCategory;

          const title = String(p.title || "").toLowerCase();
          const description = String(p.description || "").toLowerCase();

          const matchesSearch =
            title.includes(query) ||
            description.includes(query);

          return matchesCategory &&
                 matchesSearch;

        });

      renderProducts(filtered);

    }

    function clearSearch() {
      const input = document.getElementById("searchInput");
      input.value = "";
      selectedCategory = "Todas";
      const categoryBar = document.getElementById("categoryBar");
      if (categoryBar) categoryBar.style.display = "none";
      const clearBtn = document.getElementById("searchClearBtn");
      if (clearBtn) clearBtn.classList.remove("visible");
      renderProducts(products);
      input.focus();
    }

    /* --------------------------------------------------
       FAVORITOS
    -------------------------------------------------- */

    function toggleFavorite(event, id) {

      event.stopPropagation();

      if (favorites.includes(id)) {

        favorites =
          favorites.filter(
            favId => favId !== id
          );

      } else {

        favorites.push(id);

      }

      document.getElementById(
        "favBadge"
      ).textContent =
        favorites.length;

      const bottomFavBadge =
        document.getElementById("bottomFavBadge");
      if (bottomFavBadge) {
        bottomFavBadge.textContent = favorites.length;
        bottomFavBadge.style.display =
          favorites.length > 0 ? "flex" : "none";
      }

      const favoriteButton = event.currentTarget;
      if (favoriteButton) {
        favoriteButton.classList.remove("lumina-action-pulse");
        void favoriteButton.offsetWidth;
        favoriteButton.classList.add("lumina-action-pulse");
      }

      filterProducts();

      persistSharedState();

      if (
        favFullscreen.classList.contains("active")
      ) {

        renderFavorites();

      }

    }

    function openFavorites() {

      showInteractionLoading("Abrindo seus favoritos...");
      favFullscreen.classList.add("active");
      luminaOpenOverlay("favFullscreen");

      document.body.style.overflow =
        "hidden";

      renderFavorites();

    }

    function closeFavorites() {

      luminaCloseOverlay("favFullscreen");

      document.body.style.overflow =
        "auto";

    }

    function renderFavorites() {

      const favProducts =
        products.filter(
          p => favorites.includes(p.id)
        );

      if (favProducts.length === 0) {

        favGrid.innerHTML = `
          <div style="
            grid-column:1/-1;
            text-align:center;
            padding:40px;
            color:#888;
          ">
            Nenhum produto favoritado.
          </div>
        `;

        return;
      }

      favGrid.innerHTML =
        favProducts.map(
          p => createCardHTML(p)
        ).join("");

    }

    /* --------------------------------------------------
       MODAL DO PRODUTO
    -------------------------------------------------- */

    function getProductVariations(product) {
      if (!product || !product.variations || typeof product.variations !== "object" || Array.isArray(product.variations)) {
        return {};
      }

      // Normaliza variações vindas de edições manuais/painel.
      const normalized = {};
      Object.entries(product.variations).forEach(([name, values]) => {
        const cleanName = String(name || "").trim();
        if (!cleanName) return;
        const list = Array.isArray(values) ? values : [values];
        const cleanValues = list
          .map(value => String(value ?? "").trim())
          .filter(Boolean);
        if (cleanValues.length) normalized[cleanName] = cleanValues;
      });
      return normalized;
    }

    function buildVariantKey(variations = {}) {
      return Object.keys(variations || {})
        .sort()
        .map(key => `${String(key)}=${String(variations[key] ?? "")}`)
        .join("|");
    }

    function escapeHTML(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function getSelectedVariantLabel(variations = selectedVariations) {
      const entries = Object.entries(variations || {});
      if (!entries.length) return "";
      return entries.map(([name, value]) => `${name}: ${value}`).join(" • ");
    }

    function getCartVariantKey(item) {
      if (item && typeof item.variantKey === "string" && item.variantKey) {
        return item.variantKey;
      }
      if (item?.size) return `Tamanho=${item.size}`;
      return "";
    }

    function getProductPrice(product, variations = selectedVariations) {
      const base = Number(product?.priceNumber || 0);
      const prices = product?.variantPrices;
      if (!prices || typeof prices !== "object") return base;
      const key = buildVariantKey(variations);
      return Number(prices[key] ?? base);
    }

    function renderVariationOptions() {
      const wrapper = document.getElementById("variationSelector");
      const container = document.getElementById("variationOptions");
      if (!wrapper || !container || !activeProduct) return;

      const variations = getProductVariations(activeProduct);
      const names = Object.keys(variations);

      if (!names.length) {
        wrapper.style.display = "none";
        container.innerHTML = "";
        return;
      }

      wrapper.style.display = "block";
      container.innerHTML = names.map(name => `
        <div class="variation-group" data-variation-name="${escapeHTML(name)}">
          <p>${escapeHTML(name.toUpperCase())}</p>
          <div class="sizes">
            ${variations[name].map(value => `
              <button type="button"
                class="size-btn ${selectedVariations[name] === value ? "selected" : ""}"
                data-variation-name="${escapeHTML(name)}"
                data-variation-value="${escapeHTML(value)}">
                ${escapeHTML(value)}
              </button>
            `).join("")}
          </div>
        </div>
      `).join("");
    }

    function openModal(id) {
      activeProduct = products.find(p => p.id === id);
      if (!activeProduct) return;

      const variations = getProductVariations(activeProduct);
      selectedVariations = {};
      Object.keys(variations).forEach(name => {
        if (Array.isArray(variations[name]) && variations[name].length) {
          selectedVariations[name] = variations[name][0];
        }
      });

      document.getElementById("modalTitle").textContent = activeProduct.title;
      document.getElementById("productScreenTitle").textContent = activeProduct.title;
      document.getElementById("modalDesc").textContent = activeProduct.description || "Descrição não informada.";
      const categoryEl = document.getElementById("modalCategory");
      if (categoryEl) categoryEl.textContent = activeProduct.category || "Produto";
      const modalMainImage = document.getElementById("modalImgMain");
      modalMainImage.dataset.originalImage = activeProduct.images?.[0] || "";
      modalMainImage.dataset.imageCandidate = "0";
      modalMainImage.src = normalizeProductImageUrl(activeProduct.images?.[0] || "");
      const imageCounter = document.getElementById("productImageCounter");
      if (imageCounter) imageCounter.textContent = `1 / ${Math.max(1, activeProduct.images?.length || 0)}`;
      const headerFav = document.getElementById("productHeaderFav");
      if (headerFav) {
        const active = favorites.includes(activeProduct.id);
        headerFav.classList.toggle("active", active);
        headerFav.setAttribute("aria-label", active ? "Remover dos favoritos" : "Adicionar aos favoritos");
      }
      const modalPrice = document.getElementById("modalPrice");
      const modalStatusRow = document.getElementById("modalStatusRow");
      const addButton = document.querySelector("#productModal .add-to-cart");
      const available = isProductAvailable(activeProduct);
      const blocked = isProductBlocked(activeProduct);
      const status = getProductStatus(activeProduct);
      if (modalPrice) {
        modalPrice.textContent = blocked
          ? getProductStatusLabel(activeProduct)
          : formatCurrency(getProductPrice(activeProduct));
        modalPrice.classList.toggle("product-status-unavailable", blocked);
      }
      if (modalStatusRow) {
        const statusLabel = PRODUCT_AVAILABILITY_STATUSES[status];
        const highlightLabel = getProductHighlightLabel(activeProduct);
        modalStatusRow.innerHTML = [
          status !== "disponivel" ? `<span class="product-detail-status status-${status}">${escapeHTML(statusLabel)}</span>` : "",
          highlightLabel ? `<span class="product-detail-highlight">${escapeHTML(highlightLabel)}</span>` : ""
        ].filter(Boolean).join("");
      }
      if (addButton) {
        addButton.disabled = !available;
        addButton.textContent = available
          ? (status === "pre-venda" ? "Reservar na Pré-venda" : status === "sob-encomenda" ? "Solicitar por Encomenda" : "Adicionar à Sacola")
          : getProductStatusLabel(activeProduct);
        addButton.classList.toggle("is-unavailable", !available);
      }

      const productImages = Array.isArray(activeProduct.images) && activeProduct.images.length ? activeProduct.images : [""];
      document.getElementById("thumbnailsRow").innerHTML = productImages.map((imgUrl, index) => {
        const safeOriginal = escapeHTML(imgUrl);
        const safeSrc = escapeHTML(normalizeProductImageUrl(imgUrl));
        const safeArg = String(normalizeProductImageUrl(imgUrl)).replace(/'/g, "&#039;");
        return `<img src="${safeSrc}" data-original-image="${safeOriginal}" data-image-candidate="0" class="thumb-img ${index === 0 ? "active" : ""}" onclick="changeMainImage('${safeArg}', this, '${safeOriginal}')" alt="${escapeHTML(activeProduct.title)}">`;
      }).join("");

      renderVariationOptions();
      bindProductGallerySwipe();
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      luminaOpenOverlay("productModal");
      document.body.style.overflow = "hidden";
    }

    document.getElementById("variationOptions")?.addEventListener("click", function(event) {
      const button = event.target.closest(".size-btn");
      if (!button || !activeProduct) return;

      const name = button.dataset.variationName;
      const value = button.dataset.variationValue;
      selectedVariations[name] = value;

      this.querySelectorAll(`.size-btn[data-variation-name="${CSS.escape(name)}"]`).forEach(btn => {
        btn.classList.toggle("selected", btn.dataset.variationValue === value);
      });

      const priceEl = document.getElementById("modalPrice");
      if (priceEl) {
        priceEl.textContent = isProductBlocked(activeProduct)
          ? getProductStatusLabel(activeProduct)
          : formatCurrency(getProductPrice(activeProduct));
      }
    });

    function changeMainImage(url, element, originalUrl = url) {

      const main = document.getElementById("modalImgMain");
      main.dataset.originalImage = originalUrl || url;
      main.dataset.imageCandidate = "0";
      main.src = normalizeProductImageUrl(url);

      document
        .querySelectorAll(
          ".thumb-img"
        )
        .forEach(
          t =>
            t.classList.remove("active")
        );

      element.classList.add("active");
      const thumbs = Array.from(document.querySelectorAll("#thumbnailsRow .thumb-img"));
      const counter = document.getElementById("productImageCounter");
      if (counter && thumbs.length) counter.textContent = `${Math.max(1, thumbs.indexOf(element) + 1)} / ${thumbs.length}`;

    }

    // A imagem principal não faz zoom automaticamente. Clique/toque abre a foto em tela cheia.
    function handleZoom() { return; }

    function resetZoom() {
      const img = document.getElementById("modalImgMain");
      if (!img) return;
      img.style.transform = "none";
      img.style.transformOrigin = "center center";
    }

    let productImageViewerIndex = 0;
    let productImageViewerSwipeStartX = 0;
    let productImageViewerSwipeStartY = 0;
    let productGalleryWasSwipe = false;

    // Zoom do visualizador em tela cheia. O zoom só é aplicado depois que
    // a foto foi aberta, nunca automaticamente na tela do produto.
    let productViewerScale = 1;
    let productViewerTranslateX = 0;
    let productViewerTranslateY = 0;
    let productViewerLastTap = 0;
    let productViewerPinchStartDistance = 0;
    let productViewerPinchStartScale = 1;
    let productViewerPanStartX = 0;
    let productViewerPanStartY = 0;
    let productViewerPanOriginX = 0;
    let productViewerPanOriginY = 0;
    let productViewerIsPanning = false;

    function getActiveProductImages() {
      return Array.isArray(activeProduct?.images) && activeProduct.images.length ? activeProduct.images : [""];
    }

    function clampProductViewerPan() {
      const stage = document.getElementById("productImageViewerImageStage");
      if (!stage) return;
      const maxX = Math.max(0, (stage.clientWidth * productViewerScale - stage.clientWidth) / 2);
      const maxY = Math.max(0, (stage.clientHeight * productViewerScale - stage.clientHeight) / 2);
      productViewerTranslateX = Math.max(-maxX, Math.min(maxX, productViewerTranslateX));
      productViewerTranslateY = Math.max(-maxY, Math.min(maxY, productViewerTranslateY));
    }

    function applyProductViewerTransform() {
      const image = document.getElementById("productImageViewerImage");
      if (!image) return;
      clampProductViewerPan();
      image.style.transform = `translate3d(${productViewerTranslateX}px, ${productViewerTranslateY}px, 0) scale(${productViewerScale})`;
      image.style.transformOrigin = "center center";
      image.classList.toggle("is-zoomed", productViewerScale > 1.001);
      const hint = document.querySelector(".product-image-zoom-hint");
      if (hint) hint.textContent = productViewerScale > 1.001 ? `${Math.round(productViewerScale * 100)}% • arraste para mover` : "Use dois dedos ou a roda do mouse para ampliar";
    }

    function productViewerResetZoom() {
      productViewerScale = 1;
      productViewerTranslateX = 0;
      productViewerTranslateY = 0;
      applyProductViewerTransform();
    }

    function productViewerZoom(direction, factor) {
      const amount = Number.isFinite(factor) ? factor : (direction > 0 ? 1.35 : 1 / 1.35);
      productViewerScale = Math.max(1, Math.min(4, productViewerScale * amount));
      if (productViewerScale === 1) {
        productViewerTranslateX = 0;
        productViewerTranslateY = 0;
      }
      applyProductViewerTransform();
    }

    function getTouchDistance(touches) {
      if (!touches || touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    }

    function renderProductImageViewer() {
      const list = getActiveProductImages();
      const image = document.getElementById("productImageViewerImage");
      const dots = document.getElementById("productImageViewerDots");
      const title = document.getElementById("productImageViewerTitle");
      if (!image || !dots) return;
      productImageViewerIndex = (productImageViewerIndex + list.length) % list.length;
      const original = list[productImageViewerIndex] || "";
      image.dataset.originalImage = original;
      image.dataset.imageCandidate = "0";
      image.src = normalizeProductImageUrl(original);
      image.alt = activeProduct?.title || "Imagem do produto";
      if (title) title.textContent = activeProduct?.title || "Foto do produto";
      dots.innerHTML = list.map((_, i) => `<button type="button" class="lumina-banner-dot ${i === productImageViewerIndex ? "active" : ""}" onclick="setProductImageViewerSlide(${i})" aria-label="Mostrar imagem ${i + 1}"></button>`).join("");
      productViewerResetZoom();
    }

    function openProductImageViewer(index = 0) {
      if (!activeProduct) return;
      const list = getActiveProductImages();
      productImageViewerIndex = Math.max(0, Math.min(Number(index) || 0, list.length - 1));
      renderProductImageViewer();
      const viewer = document.getElementById("productImageViewer");
      if (!viewer) return;
      viewer.classList.add("active");
      viewer.setAttribute("aria-hidden", "false");
      luminaOpenOverlay("productImageViewer");
      document.body.style.overflow = "hidden";
    }

    function openProductImageViewerFromMain() {
      if (productGalleryWasSwipe) {
        productGalleryWasSwipe = false;
        return;
      }
      const thumbs = Array.from(document.querySelectorAll("#thumbnailsRow .thumb-img"));
      const index = Math.max(0, thumbs.findIndex(t => t.classList.contains("active")));
      openProductImageViewer(index);
    }

    function closeProductImageViewer() {
      productViewerResetZoom();
      luminaCloseOverlay("productImageViewer");
      const viewer = document.getElementById("productImageViewer");
      if (viewer) viewer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "hidden";
    }

    function setProductImageViewerSlide(index) {
      const list = getActiveProductImages();
      if (!list.length) return;
      productImageViewerIndex = (Number(index) + list.length) % list.length;
      renderProductImageViewer();
    }

    function changeProductImageViewer(delta) {
      if (productViewerScale > 1.001) return;
      setProductImageViewerSlide(productImageViewerIndex + delta);
    }

    const productImageViewerStage = document.getElementById("productImageViewerStage");
    const productImageViewerImageStage = document.getElementById("productImageViewerImageStage");
    if (productImageViewerStage) {
      productImageViewerStage.addEventListener("touchstart", event => {
        if (event.touches.length >= 2) {
          productViewerPinchStartDistance = getTouchDistance(event.touches);
          productViewerPinchStartScale = productViewerScale;
          productViewerIsPanning = false;
          return;
        }
        const t = event.changedTouches[0];
        productImageViewerSwipeStartX = t.clientX;
        productImageViewerSwipeStartY = t.clientY;
        productViewerPanStartX = t.clientX;
        productViewerPanStartY = t.clientY;
        productViewerPanOriginX = productViewerTranslateX;
        productViewerPanOriginY = productViewerTranslateY;
        productViewerIsPanning = productViewerScale > 1.001;
        const now = Date.now();
        if (now - productViewerLastTap < 320 && productViewerScale <= 1.001) {
          productViewerZoom(1, 2);
          productViewerIsPanning = true;
        }
        productViewerLastTap = now;
      }, { passive: false });

      productImageViewerStage.addEventListener("touchmove", event => {
        if (event.touches.length >= 2) {
          const distance = getTouchDistance(event.touches);
          if (!productViewerPinchStartDistance) return;
          productViewerScale = Math.max(1, Math.min(4, productViewerPinchStartScale * (distance / productViewerPinchStartDistance)));
          if (productViewerScale === 1) {
            productViewerTranslateX = 0;
            productViewerTranslateY = 0;
          }
          applyProductViewerTransform();
          event.preventDefault();
          return;
        }
        if (productViewerScale > 1.001) {
          const t = event.touches[0];
          productViewerTranslateX = productViewerPanOriginX + (t.clientX - productViewerPanStartX);
          productViewerTranslateY = productViewerPanOriginY + (t.clientY - productViewerPanStartY);
          applyProductViewerTransform();
          productViewerIsPanning = true;
          event.preventDefault();
        }
      }, { passive: false });

      productImageViewerStage.addEventListener("touchend", event => {
        if (event.touches.length >= 2) return;
        if (productViewerScale > 1.001 || productViewerIsPanning) {
          productViewerIsPanning = false;
          productViewerPinchStartDistance = 0;
          return;
        }
        const t = event.changedTouches[0];
        const dx = t.clientX - productImageViewerSwipeStartX;
        const dy = t.clientY - productImageViewerSwipeStartY;
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
        productGalleryWasSwipe = true;
        changeProductImageViewer(dx < 0 ? 1 : -1);
      }, { passive: false });
    }

    if (productImageViewerImageStage) {
      productImageViewerImageStage.addEventListener("wheel", event => {
        event.preventDefault();
        productViewerZoom(event.deltaY < 0 ? 1 : -1);
      }, { passive: false });

      productImageViewerImageStage.addEventListener("dblclick", event => {
        event.preventDefault();
        if (productViewerScale > 1.001) productViewerResetZoom();
        else productViewerZoom(1, 2);
      });

      productImageViewerImageStage.addEventListener("mousedown", event => {
        if (productViewerScale <= 1.001 || event.button !== 0) return;
        productViewerIsPanning = true;
        productViewerPanStartX = event.clientX;
        productViewerPanStartY = event.clientY;
        productViewerPanOriginX = productViewerTranslateX;
        productViewerPanOriginY = productViewerTranslateY;
        productImageViewerImageStage.classList.add("is-panning");
      });
      window.addEventListener("mousemove", event => {
        if (!productViewerIsPanning || productViewerScale <= 1.001) return;
        productViewerTranslateX = productViewerPanOriginX + (event.clientX - productViewerPanStartX);
        productViewerTranslateY = productViewerPanOriginY + (event.clientY - productViewerPanStartY);
        applyProductViewerTransform();
      });
      window.addEventListener("mouseup", () => {
        productViewerIsPanning = false;
        productImageViewerImageStage.classList.remove("is-panning");
      });
    }

    window.addEventListener("resize", () => {
      if (productViewerScale > 1) applyProductViewerTransform();
    });

    function closeModal() {

      luminaCloseOverlay("productModal");
      modal.setAttribute("aria-hidden", "true");

      // Se o produto foi aberto a partir de Favoritos/Sacola, mantém o
      // overlay de origem aberto em vez de liberar o scroll do fundo.
      if (
        (favFullscreen && favFullscreen.classList.contains("active")) ||
        (cartFullscreen && cartFullscreen.classList.contains("active"))
      ) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }

      resetZoom();

    }

    modal.addEventListener(
      "click",
      (e) => {

        if (e.target === modal) {
          closeModal();
        }

      }
    );

    function toggleActiveProductFavorite(event) {
      if (event) { event.preventDefault(); event.stopPropagation(); }
      if (!activeProduct) return;
      const id = activeProduct.id;
      if (favorites.includes(id)) favorites = favorites.filter(f => f !== id);
      else favorites.push(id);
      persistSharedState();
      const headerFav = document.getElementById("productHeaderFav");
      if (headerFav) {
        const active = favorites.includes(id);
        headerFav.classList.toggle("active", active);
        headerFav.setAttribute("aria-label", active ? "Remover dos favoritos" : "Adicionar aos favoritos");
      }
      refreshSharedUI();
    }

    let productGalleryTouchStartX = 0;
    let productGalleryTouchStartY = 0;
    function bindProductGallerySwipe() {
      const area = document.getElementById("zoomArea");
      if (!area || area.dataset.swipeBound === "1") return;
      area.dataset.swipeBound = "1";
      area.addEventListener("touchstart", e => {
        const t = e.changedTouches[0];
        productGalleryTouchStartX = t.clientX; productGalleryTouchStartY = t.clientY;
      }, { passive: true });
      area.addEventListener("touchend", e => {
        if (!activeProduct || !activeProduct.images?.length) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - productGalleryTouchStartX;
        const dy = t.clientY - productGalleryTouchStartY;
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
        productGalleryWasSwipe = true;
        const thumbs = Array.from(document.querySelectorAll("#thumbnailsRow .thumb-img"));
        const current = Math.max(0, thumbs.findIndex(x => x.classList.contains("active")));
        const next = dx < 0 ? current + 1 : current - 1;
        if (next >= 0 && next < thumbs.length) thumbs[next].click();
      }, { passive: true });
    }

    /* --------------------------------------------------
       ADICIONAR À SACOLA
    -------------------------------------------------- */

    function addToCartFromModal() {
      if (!activeProduct || !isProductAvailable(activeProduct)) return;

      const variantKey = buildVariantKey(selectedVariations);
      const variantLabel = getSelectedVariantLabel();
      const price = getProductPrice(activeProduct);

      const existingIndex = cart.findIndex(item =>
        item.id === activeProduct.id &&
        getCartVariantKey(item) === variantKey
      );

      if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
      } else {
        cart.push({
          ...activeProduct,
          priceNumber: price,
          variations: { ...selectedVariations },
          variantKey,
          variantLabel,
          // Mantém compatibilidade com a versão anterior.
          size: selectedVariations.Tamanho || "",
          qty: 1
        });
      }

      persistSharedState();
      updateCartBadge();

      const bottomCart = document.querySelector('.app-bottom-nav button[onclick*="openCart"]');
      if (bottomCart) {
        bottomCart.classList.remove("lumina-action-pulse");
        void bottomCart.offsetWidth;
        bottomCart.classList.add("lumina-action-pulse");
      }

      const addButton = document.querySelector("#productModal .add-to-cart");
      if (addButton) {
        const originalText = addButton.dataset.originalText || addButton.textContent.trim();
        addButton.dataset.originalText = originalText;
        addButton.textContent = "Adicionado à Sacola ✓";
        addButton.disabled = true;
        setTimeout(() => {
          addButton.textContent = originalText;
          addButton.disabled = false;
        }, 1200);
      }
    }

    /* --------------------------------------------------
       SACOLA
    -------------------------------------------------- */

    function openCart() {

      showInteractionLoading("Abrindo sua sacola...");
      updateProgressStep(1);

      cartFullscreen.classList.add(
        "active"
      );
      luminaOpenOverlay("cartFullscreen");

      document.body.style.overflow =
        "hidden";

      renderCart();

    }

    function closeCart() {

      luminaCloseOverlay("cartFullscreen");

      document.body.style.overflow =
        "auto";

    }

    function updateQuantity(
      id,
      variantKey,
      delta
    ) {

      const index =
        cart.findIndex(
          item =>
            item.id === id &&
            getCartVariantKey(item) === variantKey
        );

      if (index > -1) {

        cart[index].qty = (Number(cart[index].qty) || 1) + delta;

        if (cart[index].qty <= 0) {

          cart.splice(index, 1);

        }

      }

      persistSharedState();
      renderCart();

      updateCartBadge();

    }

    function removeItem(
      id,
      variantKey
    ) {

      cart =
        cart.filter(
          item =>
            !(
              item.id === id &&
              getCartVariantKey(item) === variantKey
            )
        );

      persistSharedState();
      renderCart();

      updateCartBadge();

    }

    function updateCartBadge() {

      const totalItems =
        cart.reduce(
          (acc, item) =>
            acc + item.qty,
          0
        );

      document.getElementById(
        "cartBadge"
      ).textContent =
        totalItems;

      const bottomCartBadge =
        document.getElementById("bottomCartBadge");
      if (bottomCartBadge) {
        bottomCartBadge.textContent = totalItems;
        bottomCartBadge.style.display =
          totalItems > 0 ? "flex" : "none";
      }

    }

    function renderCart() {

      const cartBody =
        document.getElementById(
          "cartBody"
        );

      const cartTotal =
        document.getElementById(
          "cartTotal"
        );

      const btnProceed =
        document.getElementById(
          "btnProceedToCheckout"
        );

      if (cart.length === 0) {

        cartBody.innerHTML = `
          <div class="empty-msg">
            Sua sacola está vazia.
          </div>
        `;

        cartTotal.textContent =
          formatCurrency(0);

        btnProceed.disabled =
          true;

        return;

      }

      btnProceed.disabled =
        false;

      let total = 0;

      cartBody.innerHTML =
        cart.map(item => {

          const unitPrice = Number(item.priceNumber) || 0;
          const quantity = Math.max(1, Number(item.qty) || 1);
          const itemSubtotal = unitPrice * quantity;

          total += itemSubtotal;

          return `

            <div class="cart-item">

              <img
                src="${escapeHTML(normalizeProductImageUrl(item.images[0]))}" data-original-image="${escapeHTML(item.images[0])}" data-image-candidate="0"
                alt="${item.title}"
                class="cart-item-img">

              <div class="cart-item-info">

                <div class="cart-item-title">
                  ${item.title}
                </div>

                <div class="cart-item-size">
                  ${item.variantLabel || (item.size ? `Tamanho: ${item.size}` : "Sem variação")}
                </div>

                <div class="cart-item-unit-price">
                  Unitário:
                  ${formatCurrency(unitPrice)}
                </div>

                <div class="cart-item-subtotal">
                  Subtotal:
                  ${formatCurrency(itemSubtotal)}
                </div>

              </div>

              <div class="cart-item-controls">

                <button
                  class="remove-btn"
                  onclick="removeItem(${item.id}, '${item.variantKey || item.size || ""}')">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none">

                    <path
                      d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                    </path>

                  </svg>

                </button>

                <div class="quantity-control">

                  <button
                    class="qty-btn"
                    onclick="updateQuantity(${item.id}, '${item.variantKey || item.size || ""}', -1)">
                    -
                  </button>

                  <span class="qty-number">
                    ${quantity}
                  </span>

                  <button
                    class="qty-btn"
                    onclick="updateQuantity(${item.id}, '${item.variantKey || item.size || ""}', 1)">
                    +
                  </button>

                </div>

              </div>

            </div>

          `;

        }).join("");

      cartTotal.textContent =
        formatCurrency(total);

    }

    /* --------------------------------------------------
       CHECKOUT
    -------------------------------------------------- */

    function renderCheckoutSummary() {
      const el = document.getElementById("checkoutCartSummary");
      if (!el) return;
      const total = cart.reduce((sum, item) => sum + (Number(item.priceNumber) || 0) * (Number(item.qty) || 0), 0);
      el.innerHTML = `<div class="checkout-summary-head"><strong>Resumo da sacola</strong><span>${cart.reduce((sum,i)=>sum+(Number(i.qty)||0),0)} item(ns)</span></div><div class="checkout-summary-items">${cart.map(item => `<div><span>${escapeHTML(item.title)} × ${Number(item.qty)||1}</span><strong>${formatCurrency((Number(item.priceNumber)||0)*(Number(item.qty)||0))}</strong></div>`).join("")}</div><div class="checkout-summary-total"><span>Total</span><strong>${formatCurrency(total)}</strong></div>`;
    }

    function proceedToCheckout() {

      const spinner =
        document.getElementById(
          "cartSpinner"
        );

      const btnText =
        document.getElementById(
          "btnProceedText"
        );

      spinner.style.display =
        "inline-block";

      btnText.textContent =
        "Carregando...";

      setTimeout(() => {

        spinner.style.display =
          "none";

        btnText.textContent =
          "Prosseguir para Entrega";

        updateProgressStep(2);
        renderCheckoutSummary();

        checkoutStep1.classList.add(
          "active"
        );
        checkoutStep1.setAttribute("aria-hidden", "false");
        luminaOpenOverlay("checkoutStep1");

      }, 900);

    }

    function closeCheckoutStep1() {

      luminaCloseOverlay("checkoutStep1");

      updateProgressStep(1);

    }

    function closeCheckoutStep2() {

      luminaCloseOverlay("checkoutStep2");

      updateProgressStep(2);

    }

    function backToCheckoutStep1() {
      luminaCloseOverlay("checkoutStep2");
      updateProgressStep(2);
      setTimeout(() => {
        renderCheckoutSummary();
        checkoutStep1.classList.add("active");
        checkoutStep1.setAttribute("aria-hidden", "false");
        luminaOpenOverlay("checkoutStep1");
        document.body.style.overflow = "hidden";
      }, 30);
    }

    /* --------------------------------------------------
       TIPO DE ENTREGA
    -------------------------------------------------- */

    function setDeliveryType(type) {

      deliveryType = type;

      if (type === "delivery") {

        document
          .getElementById(
            "btnTypeDelivery"
          )
          .classList.add("active");

        document
          .getElementById(
            "btnTypePickup"
          )
          .classList.remove("active");

        document
          .getElementById(
            "formDelivery"
          )
          .style.display =
          "block";

        document
          .getElementById(
            "formPickup"
          )
          .style.display =
          "none";

      }

      else {

        document
          .getElementById(
            "btnTypePickup"
          )
          .classList.add("active");

        document
          .getElementById(
            "btnTypeDelivery"
          )
          .classList.remove("active");

        document
          .getElementById(
            "formDelivery"
          )
          .style.display =
          "none";

        document
          .getElementById(
            "formPickup"
          )
          .style.display =
          "block";

      }

    }

    /* --------------------------------------------------
       REVISÃO
    -------------------------------------------------- */

    function setPaymentType(type) {
      paymentType = type;
      const map = { pix: "paymentPix", dinheiro: "paymentCash", cartao: "paymentCard" };
      Object.entries(map).forEach(([key, id]) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        const active = key === type;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
      const cash = document.getElementById("cashChangeGroup");
      if (cash) cash.hidden = type !== "dinheiro";
    }

    function getPaymentLabel() {
      return ({ pix: "Pix", dinheiro: "Dinheiro", cartao: "Cartão" })[paymentType] || "Pix";
    }

    function proceedToReview() {
      if (deliveryType === "delivery") {
        const bairro = document.getElementById("inpBairro")?.value.trim();
        const rua = document.getElementById("inpRua")?.value.trim();
        const numero = document.getElementById("inpNumero")?.value.trim();
        const contato = document.getElementById("inpContato")?.value.trim();
        const cpf = document.getElementById("inpCpf")?.value.trim();
        if (!bairro || !rua || !numero || !contato || !cpf) {
          alert("Por favor, preencha todos os campos obrigatórios (*).");
          return;
        }
      } else {
        const nome = document.getElementById("inpNomePickup")?.value.trim();
        const cpf = document.getElementById("inpCpfPickup")?.value.trim();
        if (!nome || !cpf) {
          alert("Por favor, preencha o Nome e o CPF.");
          return;
        }
      }

      const spinner = document.getElementById("reviewSpinner");
      const btnText = document.getElementById("btnReviewText");
      if (spinner) spinner.style.display = "inline-block";
      if (btnText) btnText.textContent = "Validando dados...";

      setTimeout(() => {
        if (spinner) spinner.style.display = "none";
        if (btnText) btnText.textContent = "Prosseguir para Revisão";
        renderReceiptPreview();
        updateProgressStep(3);
        checkoutStep2.classList.add("active");
        checkoutStep2.setAttribute("aria-hidden", "false");
        luminaOpenOverlay("checkoutStep2");
      }, 500);
    }

    /* --------------------------------------------------
       RECIBO / PEDIDO
    -------------------------------------------------- */

    function generateReceiptText() {
      const total = cart.reduce((acc, item) => acc + ((Number(item.priceNumber) || 0) * (Number(item.qty) || 0)), 0);
      const lines = [];
      lines.push("🛍️ *NOVO PEDIDO — RAYSSA PRIME BEAUTY*");
      lines.push("");
      lines.push("*ITENS DO PEDIDO*");
      cart.forEach((item, index) => {
        const qty = Math.max(1, Number(item.qty) || 1);
        const subtotal = (Number(item.priceNumber) || 0) * qty;
        lines.push(`${index + 1}. *${item.title}*`);
        if (item.variantLabel) lines.push(`   ${item.variantLabel}`);
        lines.push(`   ${qty} × ${formatCurrency(item.priceNumber)} = *${formatCurrency(subtotal)}*`);
      });
      lines.push("");
      lines.push(`💰 *TOTAL: ${formatCurrency(total)}*`);
      lines.push("");
      lines.push("*PAGAMENTO*");
      lines.push(`Forma: *${getPaymentLabel()}*`);
      if (paymentType === "dinheiro") {
        const troco = document.getElementById("inpTroco")?.value.trim();
        if (troco) lines.push(`Valor para troco: ${troco}`);
      }
      lines.push("");
      lines.push("*RECEBIMENTO*");
      if (deliveryType === "delivery") {
        const nome = document.getElementById("inpNomeDelivery")?.value.trim();
        const bairro = document.getElementById("inpBairro")?.value.trim();
        const rua = document.getElementById("inpRua")?.value.trim();
        const numero = document.getElementById("inpNumero")?.value.trim();
        const contato = document.getElementById("inpContato")?.value.trim();
        const cpf = document.getElementById("inpCpf")?.value.trim();
        const ref = document.getElementById("inpRef")?.value.trim();
        const nota = document.getElementById("inpNota")?.value.trim();
        lines.push("Tipo: *Entrega local — Chapadinha/MA*");
        if (nome) lines.push(`Nome: ${nome}`);
        lines.push(`Endereço: ${rua}, ${numero} — ${bairro}`);
        lines.push(`WhatsApp: ${contato}`);
        lines.push(`CPF: ${cpf}`);
        if (ref) lines.push(`Referência: ${ref}`);
        if (nota) lines.push(`Observação: ${nota}`);
      } else {
        const nome = document.getElementById("inpNomePickup")?.value.trim();
        const cpf = document.getElementById("inpCpfPickup")?.value.trim();
        lines.push("Tipo: *Retirar com o vendedor*");
        lines.push(`Nome: ${nome}`);
        lines.push(`CPF: ${cpf}`);
      }
      lines.push("");
      lines.push("_Pedido enviado pelo catálogo online da RAYSSA PRIME BEAUTY._");
      return lines.join("\n");
    }

    function renderReceiptPreview() {
      const receipt = document.getElementById("receiptPreview");
      if (!receipt) return;
      const total = cart.reduce((sum, item) => sum + (Number(item.priceNumber) || 0) * (Number(item.qty) || 0), 0);
      const itemsHTML = cart.map(item => {
        const qty = Math.max(1, Number(item.qty) || 1);
        const subtotal = (Number(item.priceNumber) || 0) * qty;
        return `<div class="review-item-card"><div class="review-item-main"><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.variantLabel || (item.size ? `Tamanho: ${item.size}` : "Sem variação"))}</span></div><div class="review-item-values"><span>${qty} × ${formatCurrency(item.priceNumber)}</span><strong>${formatCurrency(subtotal)}</strong></div></div>`;
      }).join("");

      let deliveryHTML = "";
      if (deliveryType === "delivery") {
        const nome = document.getElementById("inpNomeDelivery")?.value.trim() || "Não informado";
        const bairro = document.getElementById("inpBairro")?.value.trim() || "";
        const rua = document.getElementById("inpRua")?.value.trim() || "";
        const numero = document.getElementById("inpNumero")?.value.trim() || "";
        const contato = document.getElementById("inpContato")?.value.trim() || "";
        const cpf = document.getElementById("inpCpf")?.value.trim() || "";
        const ref = document.getElementById("inpRef")?.value.trim();
        const nota = document.getElementById("inpNota")?.value.trim();
        deliveryHTML = `<div class="review-data-grid"><div><span>Tipo</span><strong>Entrega Local</strong></div><div><span>Nome</span><strong>${escapeHTML(nome)}</strong></div><div><span>Endereço</span><strong>${escapeHTML(rua)}, ${escapeHTML(numero)} — ${escapeHTML(bairro)}</strong></div><div><span>Contato</span><strong>${escapeHTML(contato)}</strong></div><div><span>CPF</span><strong>${escapeHTML(cpf)}</strong></div>${ref ? `<div><span>Referência</span><strong>${escapeHTML(ref)}</strong></div>` : ""}${nota ? `<div class="review-data-wide"><span>Observação</span><strong>${escapeHTML(nota)}</strong></div>` : ""}</div>`;
      } else {
        const nome = document.getElementById("inpNomePickup")?.value.trim() || "";
        const cpf = document.getElementById("inpCpfPickup")?.value.trim() || "";
        deliveryHTML = `<div class="review-data-grid"><div><span>Tipo</span><strong>Retirar com o Vendedor</strong></div><div><span>Nome</span><strong>${escapeHTML(nome)}</strong></div><div><span>CPF</span><strong>${escapeHTML(cpf)}</strong></div></div>`;
      }
      const cashChange = paymentType === "dinheiro" ? (document.getElementById("inpTroco")?.value.trim() || "Não informado") : "";
      const paymentHTML = `<div class="review-data-grid"><div><span>Forma de pagamento</span><strong>${escapeHTML(getPaymentLabel())}</strong></div>${cashChange ? `<div><span>Valor para troco</span><strong>${escapeHTML(cashChange)}</strong></div>` : ""}</div>`;
      receipt.innerHTML = `<div class="review-card-header"><div><span>SEU PEDIDO</span><h4>Confira tudo antes de enviar</h4></div><strong>${formatCurrency(total)}</strong></div><div class="review-block"><h5>Itens (${cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)})</h5>${itemsHTML}</div><div class="review-block"><h5>Pagamento</h5>${paymentHTML}</div><div class="review-block"><h5>Dados para receber</h5>${deliveryHTML}</div><div class="review-total"><span>Total do pedido</span><strong>${formatCurrency(total)}</strong></div>`;
    }

    /* --------------------------------------------------
       WHATSAPP
    -------------------------------------------------- */

    function sendOrderToWhatsapp() {
      const spinner = document.getElementById("waSpinner");
      const btnText = document.getElementById("btnWaText");
      if (spinner) spinner.style.display = "inline-block";
      if (btnText) btnText.textContent = "Redirecionando...";

      setTimeout(() => {
        const text = generateReceiptText();
        const encodedText = encodeURIComponent(text);
        const phone = "559892354138";

        // Em alguns WebViews o wa.me redireciona internamente para api.whatsapp.com,
        // que pode ser bloqueado. No Android, usamos o Intent do aplicativo diretamente.
        const isAndroid = /Android/i.test(navigator.userAgent || "");
        const intentUrl = `intent://send?phone=${phone}&text=${encodedText}#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=${encodeURIComponent(`https://wa.me/${phone}?text=${encodedText}`)};end`;
        const webUrl = `https://wa.me/${phone}?text=${encodedText}`;
        const targetUrl = isAndroid ? intentUrl : webUrl;

        const link = document.createElement("a");
        link.href = targetUrl;
        link.target = "_self";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Fallback para navegadores que não suportam Intent.
        if (isAndroid) {
          setTimeout(() => {
            if (document.visibilityState === "visible") {
              window.location.href = webUrl;
            }
          }, 1800);
        }

        if (spinner) spinner.style.display = "none";
        if (btnText) btnText.textContent = "Finalizar no WhatsApp";
      }, 400);
    }

    function openInfo(title, text) {
      showInteractionLoading("Carregando informação...");
      document.getElementById("infoTitle").textContent = title;
      document.getElementById("infoText").textContent = text;
      const action = document.getElementById("infoActionBtn");
      if (action) {
        action.style.display = "none";
        action.removeAttribute("href");
      }
      // Não fecha o Perfil: a informação abre por cima dele e, ao fechar,
      // o usuário retorna exatamente para a tela de Perfil.
      document.getElementById("infoModal").classList.add("active");
      luminaOpenOverlay("infoModal");
      document.body.style.overflow = "hidden";
    }

    function openSocialInfo(network) {
      const links = window.LUMINA_SOCIAL_LINKS || {};
      const messages = window.RAYSSA_SOCIAL_MESSAGES || {};
      const social = messages[network] || {};
      const data = {
        Instagram: { url: links.instagram, text: social.text, button: social.button },
        TikTok: { url: links.tiktok, text: social.text, button: social.button },
        Desenvolvedor: { url: links.desenvolvedor, text: social.text, button: social.button }
      }[network];

      if (!data) return;

      showInteractionLoading(`Abrindo ${network}...`);
      document.getElementById("infoTitle").textContent = network;
      document.getElementById("infoText").textContent = data.text;

      const action = document.getElementById("infoActionBtn");
      if (action) {
        const url = typeof data.url === "string" ? data.url.trim() : "";
        action.textContent = data.button;
        if (url) {
          action.href = url;
          action.target = "_blank";
          action.rel = "noopener noreferrer";
          action.style.display = "flex";
          action.removeAttribute("aria-disabled");
        } else {
          action.removeAttribute("href");
          action.style.display = "none";
        }
      }

      // O Perfil permanece aberto por trás desta janela.
      document.getElementById("infoModal").classList.add("active");
      luminaOpenOverlay("infoModal");
      document.body.style.overflow = "hidden";
    }

    function closeInfo() {
      luminaCloseOverlay("infoModal");
      // Se o Perfil ainda estiver aberto, mantém a rolagem bloqueada para
      // que o usuário simplesmente volte a ele.
      if (!document.getElementById("profileModal")?.classList.contains("active") &&
          !document.getElementById("welcomeModal")?.classList.contains("active") &&
          !document.getElementById("installModal")?.classList.contains("active")) {
        document.body.style.overflow = "auto";
      }
    }

    document.getElementById("infoModal").addEventListener("click", e => {
      if (e.target === document.getElementById("infoModal")) closeInfo();
    });

    /* --------------------------------------------------
       USUÁRIO / PRIMEIRA VISITA
    -------------------------------------------------- */

    let deferredInstallPrompt = null;

    const welcomeModal = document.getElementById("welcomeModal");
    const installModal = document.getElementById("installModal");
    const profileModal = document.getElementById("profileModal");

    function openProfile() {
      // O perfil precisa permanecer acessível mesmo quando outro estado de
      // interface/loading estiver ativo. Todas as informações e ações do
      // perfil continuam sendo as mesmas.
      const modal = document.getElementById("profileModal");
      if (!modal) return;

      // Alguns visualizadores (principalmente previews/WebViews) podem bloquear
      // localStorage. O Perfil não pode deixar de abrir por causa disso.
      let saved = null;
      try {
        saved = localStorage.getItem((typeof LUMINA_STORAGE !== "undefined" && LUMINA_STORAGE.user) ? LUMINA_STORAGE.user : "luminaUser");
      } catch (e) {
        saved = null;
      }
      const profileName = document.getElementById("profileUserName");
      const profileDescription = document.getElementById("profileDescription");

      if (profileName) {
        profileName.textContent = "Olá!";
      }
      if (profileDescription) {
        profileDescription.textContent = "Você não precisa criar uma conta. Sua sacola e seus favoritos ficam salvos neste dispositivo.";
      }

      if (saved) {
        try {
          const user = JSON.parse(saved);
          if (profileName && user && user.name) {
            profileName.textContent = `Olá, ${user.name}!`;
          }
          if (profileDescription) {
            profileDescription.textContent = "Sua experiência, seus favoritos e sua sacola ficam salvos neste dispositivo.";
          }
        } catch (e) {
          // Mantém a apresentação padrão sem impedir a abertura do Perfil.
        }
      }

      // Fecha apenas a camada de loading transitória antes de exibir o perfil.
      const loading = document.getElementById("interactionLoading");
      if (loading) loading.classList.remove("active");

      modal.classList.add("active");
      luminaOpenOverlay("profileModal");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeProfile() {
      if (!profileModal) return;
      luminaCloseOverlay("profileModal");
      profileModal.setAttribute("aria-hidden", "true");
      if (!welcomeModal.classList.contains("active") && !installModal.classList.contains("active") &&
          !document.getElementById("infoModal")?.classList.contains("active")) {
        document.body.style.overflow = "auto";
      }
    }

    if (profileModal) profileModal.addEventListener("click", e => { if (e.target === profileModal) closeProfile(); });

    // Compatibilidade com visualizadores que bloqueiam ou ignoram onclick inline.
    // Não altera a interface: apenas garante que os dois botões de Perfil executem a mesma função.
    window.openProfile = openProfile;
    window.closeProfile = closeProfile;
    function bindProfileButtons() {
      document.querySelectorAll('#profileHeaderBtn, .app-nav-btn[title="Perfil"]').forEach(button => {
        if (button.dataset.profileBound === "1") return;
        button.dataset.profileBound = "1";
        // Captura o toque antes de qualquer onclick do visualizador.
        button.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          try { openProfile(); } catch (e) {
            // Último recurso: exibe o Perfil sem depender de histórico/storage.
            const profile = document.getElementById("profileModal");
            if (profile) {
              profile.classList.add("active");
              profile.style.opacity = "1";
              profile.style.visibility = "visible";
              profile.style.pointerEvents = "auto";
              profile.setAttribute("aria-hidden", "false");
              document.body.style.overflow = "hidden";
            }
          }
        }, true);
      });
    }
    bindProfileButtons();
    document.addEventListener("DOMContentLoaded", bindProfileButtons, { once: true });

    function saveUser() {
      const input = document.getElementById("welcomeUserName");
      const name = input.value.trim();

      if (!name) {
        input.focus();
        input.style.borderColor = "#d0011b";
        return;
      }

      const userData = {
        name: name,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(LUMINA_STORAGE.user, JSON.stringify(userData));
      if (luminaChannel) luminaChannel.postMessage({ type: "user", user: userData, at: Date.now() });

      closeWelcome();

      // Na primeira visita, depois de criar o usuário,
      // apresenta a instalação para uma experiência de aplicativo.
      setTimeout(() => {
        if (!window.matchMedia("(display-mode: standalone)").matches) {
          openInstall();
        }
      }, 250);
    }

    function closeWelcome() {
      luminaCloseOverlay("welcomeModal");
      document.body.style.overflow = "auto";
    }

    function showWelcomeIfNeeded() {
      // V5: cadastro/login não é mais obrigatório.
      // O cliente pode comprar sem criar usuário.
      return;
    }

    /* --------------------------------------------------
       INSTALAÇÃO PWA
    -------------------------------------------------- */

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      deferredInstallPrompt = event;
    });

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      closeInstall();
    });

    function openInstall() {
      const message = document.getElementById("installMessage");
      const button = document.getElementById("installAppBtn");

      installModal.classList.add("active");
      luminaOpenOverlay("installModal");
      document.body.style.overflow = "hidden";

      if (deferredInstallPrompt) {
        message.textContent = "A RAYSSA PRIME BEAUTY está pronta para ser instalada no seu dispositivo.";
        button.style.display = "flex";
        button.textContent = "Instalar aplicativo";
        button.disabled = false;
        return;
      }

      if (window.matchMedia("(display-mode: standalone)").matches) {
        message.textContent = "A RAYSSA PRIME BEAUTY já está instalada como aplicativo neste dispositivo.";
        button.style.display = "flex";
        button.textContent = "Aplicativo instalado";
        button.disabled = true;
        return;
      }

      button.textContent = "Instalar aplicativo";
      button.disabled = false;
      message.textContent =
        "A instalação depende do navegador. Toque no botão abaixo; se a instalação automática não estiver disponível, serão mostradas as instruções para adicionar a RAYSSA PRIME BEAUTY à tela inicial.";
      button.style.display = "flex";
    }

    function closeInstall() {
      luminaCloseOverlay("installModal");
      if (!welcomeModal.classList.contains("active")) {
        document.body.style.overflow = "auto";
      }
    }

    async function installApp() {
      if (!deferredInstallPrompt) {
        document.getElementById("installMessage").textContent =
          "Seu navegador não disponibilizou a instalação automática. Abra o menu do navegador e escolha “Instalar aplicativo” ou “Adicionar à tela inicial” para instalar a RAYSSA PRIME BEAUTY.";
        return;
      }

      deferredInstallPrompt.prompt();

      try {
        await deferredInstallPrompt.userChoice;
      } catch (error) {
        console.warn("Instalação cancelada:", error);
      }

      deferredInstallPrompt = null;
      closeInstall();
    }

    /* --------------------------------------------------
       NOTIFICAÇÃO DE ATUALIZAÇÃO — SEM LOGIN
    -------------------------------------------------- */
    // Altere SOMENTE este número quando publicar uma nova versão.
    const LUMINA_SITE_VERSION = String(window.LUMINA_SITE_VERSION || "7.1.2");
    const LUMINA_UPDATE_KEY = "luminaLastSeenVersion";
    const LUMINA_UPDATE_UNREAD_KEY = "luminaUpdateUnread";

    function setUpdateUnread(unread) {
      const bell = document.getElementById("updateBellBtn");
      if (bell) bell.classList.toggle("has-unread", !!unread);
      try {
        if (unread) localStorage.setItem(LUMINA_UPDATE_UNREAD_KEY, "1");
        else localStorage.removeItem(LUMINA_UPDATE_UNREAD_KEY);
      } catch (_) {}
    }

    function restoreUpdateBell() {
      let unread = false;
      try { unread = localStorage.getItem(LUMINA_UPDATE_UNREAD_KEY) === "1"; } catch (_) {}
      setUpdateUnread(unread);
    }

    function showUpdateNotification() {
      // O aviso de atualização não abre automaticamente ao entrar.
      // Ele continua disponível pelo sino de notificações.
      return;
      const lastSeen = localStorage.getItem(LUMINA_UPDATE_KEY);
      const toast = document.getElementById("updateNotification");
      if (!toast) return;

      // A primeira visita também pode receber o aviso; nas visitas seguintes,
      // somente uma versão nova gera uma nova notificação.
      if (lastSeen === LUMINA_SITE_VERSION) {
        restoreUpdateBell();
        return;
      }

      const versionText = document.getElementById("updateNotificationVersion");
      if (versionText) versionText.textContent = `Versão ${LUMINA_SITE_VERSION}`;

      toast.classList.add("active");
      setUpdateUnread(true);
      localStorage.setItem(LUMINA_UPDATE_KEY, LUMINA_SITE_VERSION);

      // Só é possível mostrar a notificação do sistema quando o usuário já
      // concedeu permissão. O botão da própria mensagem solicita a permissão
      // de forma compatível com os navegadores que exigem ação do usuário.
      sendDeviceUpdateNotification();
    }

    function openUpdateNotificationFromBell() {
      const toast = document.getElementById("updateNotification");
      if (!toast) return;
      const versionText = document.getElementById("updateNotificationVersion");
      if (versionText) versionText.textContent = `Versão ${LUMINA_SITE_VERSION}`;
      toast.classList.add("active");
      setUpdateUnread(false);
    }

    async function sendDeviceUpdateNotification() {
      try {
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        const title = "✨ RAYSSA PRIME BEAUTY foi atualizada!";
        const body = `A versão ${LUMINA_SITE_VERSION} já está disponível. Confira as novidades da loja.`;
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration && registration.showNotification) {
            await registration.showNotification(title, {
              body,
              icon: "./assets/icons/icon-192-v6-1-8.png",
              badge: "./assets/icons/icon-192-v6-1-8.png",
              tag: `lumina-update-${LUMINA_SITE_VERSION}`,
              renotify: true,
              data: { url: "./" }
            });
            return;
          }
        }
        new Notification(title, { body, icon: "./assets/icons/icon-192-v6-1-8.png", tag: "lumina-update" });
      } catch (error) {
        console.warn("LUMINA: não foi possível enviar a notificação do dispositivo.", error);
      }
    }

    async function enableUpdateNotifications() {
      if (!("Notification" in window)) {
        const status = document.getElementById("updateNotificationStatus");
        if (status) status.textContent = "Seu navegador não oferece notificações neste dispositivo.";
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        const button = document.getElementById("enableUpdateNotificationsBtn");
        const status = document.getElementById("updateNotificationStatus");

        if (permission === "granted") {
          if (status) status.textContent = "Pronto! Você receberá avisos quando a RAYSSA PRIME BEAUTY tiver novidades.";
          if (button) button.style.display = "none";
          await sendDeviceUpdateNotification();
        } else if (permission === "denied") {
          if (status) status.textContent = "As notificações foram bloqueadas pelo navegador. Elas podem ser liberadas nas configurações do site.";
        } else {
          if (status) status.textContent = "As notificações não foram ativadas.";
        }
      } catch (error) {
        console.warn("LUMINA: permissão de notificação indisponível.", error);
      }
    }

    function closeUpdateNotification() {
      const toast = document.getElementById("updateNotification");
      if (toast) toast.classList.remove("active");
    }

    function prepareNotificationPermissionUI() {
      const button = document.getElementById("enableUpdateNotificationsBtn");
      if (!button || !("Notification" in window)) return;
      if (Notification.permission === "granted") {
        button.style.display = "none";
      }
    }

    /* --------------------------------------------------
       REDES SOCIAIS
       Os mesmos links são usados no Perfil e no rodapé.
    -------------------------------------------------- */
    function applySocialLinks() {
      const links = window.LUMINA_SOCIAL_LINKS || {};
      const mapping = {
        instagram: "footerInstagramLink",
        tiktok: "footerTikTokLink",
        desenvolvedor: "footerDesenvolvedorLink"
      };

      Object.entries(mapping).forEach(([network, id]) => {
        const url = typeof links[network] === "string" ? links[network].trim() : "";
        const element = document.getElementById(id);
        if (!element) return;
        if (url) {
          element.href = url;
          element.target = "_blank";
          element.rel = "noopener noreferrer";
          element.removeAttribute("aria-disabled");
        } else {
          element.removeAttribute("href");
          element.removeAttribute("target");
          element.removeAttribute("rel");
          element.setAttribute("aria-disabled", "true");
        }
      });
    }

    applySocialLinks();

    /* --------------------------------------------------
       BANNER ROTATIVO
       As imagens ficam configuráveis em js/config.js.
    -------------------------------------------------- */
    let luminaBannerTimer = null;
    let luminaBannerIndex = 0;

    function initLuminaBanner() {
      const slides = document.getElementById("luminaBannerSlides");
      const dots = document.getElementById("luminaBannerDots");
      const banner = document.getElementById("luminaBanner");
      if (!slides || !dots || !banner) return;

      // Aceita:
      // 1) URL externa: "https://..."
      // 2) caminho local: "assets/banner/minha-foto.jpg"
      // 3) objeto: { src: "...", alt: "..." }
      // 4) objeto com "url" ou "local" (útil para deixar explícita a origem)
      // O navegador/PWA não diferencia o tratamento visual entre URL e arquivo local.
      // Aceita links compartilhados do Google Drive e converte para um endpoint
      // de imagem que o banner consegue carregar em navegadores e WebViews.
      function normalizeBannerImageUrl(value) {
        const url = String(value || "").trim();
        if (!url) return "";
        let id = "";
        let match = url.match(/drive\.google\.com\/file\/d\/([^\/?#]+)/i);
        if (match) id = match[1];
        if (!id) {
          match = url.match(/[?&]id=([^&#]+)/i);
          if (match && /drive\.google\.com/i.test(url)) id = match[1];
        }
        if (id) return "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w2000";
        return url;
      }

      const configured = Array.isArray(window.LUMINA_BANNER_IMAGES)
        ? window.LUMINA_BANNER_IMAGES.map(item => {
            if (typeof item === "string") {
              const value = item.trim();
              return { src: normalizeBannerImageUrl(value), fallback: "", alt: "Banner RAYSSA PRIME BEAUTY" };
            }
            if (item && typeof item === "object") {
              const source = String(
                item.src || item.url || item.local || item.image || ""
              ).trim();
              return {
                src: normalizeBannerImageUrl(source),
                fallback: normalizeBannerImageUrl(String(item.fallback || "").trim()),
                alt: String(item.alt || "Banner RAYSSA PRIME BEAUTY").trim()
              };
            }
            return { src: "", fallback: "", alt: "Banner RAYSSA PRIME BEAUTY" };
          }).filter(item => item.src)
        : [];

      if (!configured.length) {
        banner.classList.add("lumina-banner-empty");
        return;
      }

      window.__MR_BANNER_CONFIGURED = configured;
      banner.classList.remove("lumina-banner-empty");
      slides.innerHTML = configured.map((item, index) => `
        <div class="lumina-banner-slide ${index === 0 ? "active" : ""}" aria-hidden="${index === 0 ? "false" : "true"}">
          <img src="${item.src.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" alt="${item.alt.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" ${item.fallback ? `data-fallback="${item.fallback.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"` : ''} ${index === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" referrerpolicy="no-referrer">
        </div>
      `).join("");

      // Compatibilidade reforçada para links compartilhados do Google Drive.
      // Alguns WebViews aceitam apenas um dos endpoints públicos do Drive.
      function getGoogleDriveCandidates(url) {
        const value = String(url || "").trim();
        const match = value.match(/(?:drive\.google\.com\/file\/d\/|[?&]id=)([^\/?&#]+)/i);
        if (!match) return [value];
        const id = decodeURIComponent(match[1]);
        return [
          "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w2000",
          "https://drive.google.com/uc?export=view&id=" + encodeURIComponent(id),
          "https://drive.google.com/uc?export=download&id=" + encodeURIComponent(id)
        ];
      }

      slides.querySelectorAll("img").forEach(img => {
        const initial = img.getAttribute("src") || "";
        const candidates = [
          ...getGoogleDriveCandidates(initial),
          ...(img.dataset.fallback ? getGoogleDriveCandidates(img.dataset.fallback) : [])
        ].filter((value, index, list) => value && list.indexOf(value) === index);

        let candidateIndex = 0;
        img.addEventListener("error", () => {
          candidateIndex += 1;
          if (candidateIndex < candidates.length) {
            img.src = candidates[candidateIndex];
            return;
          }
          img.classList.add("lumina-banner-image-error");
          img.alt = "Imagem do banner indisponível";
        });
      });

      dots.innerHTML = configured.map((_, index) => `
        <button type="button" class="lumina-banner-dot ${index === 0 ? "active" : ""}" aria-label="Mostrar imagem ${index + 1}" data-banner-index="${index}"></button>
      `).join("");
      dots.querySelectorAll("[data-banner-index]").forEach(dot => {
        dot.addEventListener("click", () => setLuminaBannerSlide(Number(dot.dataset.bannerIndex)));
      });

      if (configured.length <= 1) {
        dots.style.display = "none";
        return;
      }

      let bannerTouchStartX = 0;
      let bannerTouchStartY = 0;
      banner.addEventListener("click", event => {
        if (event.target.closest(".lumina-banner-dot")) return;
        openBannerViewer(luminaBannerIndex);
      });
      banner.addEventListener("touchstart", event => {
        const t = event.changedTouches[0];
        bannerTouchStartX = t.clientX; bannerTouchStartY = t.clientY;
      }, { passive: true });
      banner.addEventListener("touchend", event => {
        const t = event.changedTouches[0];
        const dx = t.clientX - bannerTouchStartX;
        const dy = t.clientY - bannerTouchStartY;
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) || configured.length < 2) return;
        setLuminaBannerSlide((luminaBannerIndex + (dx < 0 ? 1 : -1) + configured.length) % configured.length);
      }, { passive: true });

      const restart = () => {
        clearInterval(luminaBannerTimer);
        luminaBannerTimer = setInterval(() => {
          setLuminaBannerSlide((luminaBannerIndex + 1) % configured.length, false);
        }, 5000);
      };

      banner.addEventListener("mouseenter", () => clearInterval(luminaBannerTimer));
      banner.addEventListener("mouseleave", restart);
      banner.addEventListener("touchstart", () => clearInterval(luminaBannerTimer), { passive: true });
      banner.addEventListener("touchend", restart, { passive: true });
      restart();
    }

    function setLuminaBannerSlide(index, restartTimer = true) {
      const slides = Array.from(document.querySelectorAll(".lumina-banner-slide"));
      const dots = Array.from(document.querySelectorAll(".lumina-banner-dot"));
      if (!slides.length) return;

      luminaBannerIndex = Math.max(0, Math.min(index, slides.length - 1));
      slides.forEach((slide, i) => {
        const active = i === luminaBannerIndex;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach((dot, i) => dot.classList.toggle("active", i === luminaBannerIndex));

      if (restartTimer && slides.length > 1) {
        clearInterval(luminaBannerTimer);
        luminaBannerTimer = setInterval(() => {
          setLuminaBannerSlide((luminaBannerIndex + 1) % slides.length, false);
        }, 5000);
      }
    }

    /* --------------------------------------------------
       SEGUNDO BANNER — NOVIDADES
       Mesmas interações do banner principal: autoplay,
       pontos, clique para tela cheia e gesto lateral.
    -------------------------------------------------- */
    let newProductsBannerTimer = null;
    let newProductsBannerIndex = 0;

    function initNewProductsBanner() {
      const banner = document.getElementById("newProductsBanner");
      const slides = document.getElementById("newProductsBannerSlides");
      const dots = document.getElementById("newProductsBannerDots");
      const configured = Array.isArray(window.LUMINA_NEW_BANNER_IMAGES) ? window.LUMINA_NEW_BANNER_IMAGES : [];
      if (!banner || !slides || !dots || !configured.length) return;
      function normalizeNewBannerImageUrl(value){
        const url=String(value||'').trim();
        const match=url.match(/(?:drive\.google\.com\/file\/d\/|[?&]id=)([^\/?&#]+)/i);
        if(!match) return url;
        return 'https://drive.google.com/thumbnail?id='+encodeURIComponent(decodeURIComponent(match[1]))+'&sz=w2000';
      }
      function newBannerCandidates(url){
        const value=String(url||'').trim();
        const match=value.match(/(?:drive\.google\.com\/file\/d\/|[?&]id=)([^\/?&#]+)/i);
        if(!match) return [value];
        const id=encodeURIComponent(decodeURIComponent(match[1]));
        return ['https://drive.google.com/thumbnail?id='+id+'&sz=w2000','https://drive.google.com/uc?export=view&id='+id,'https://drive.google.com/uc?export=download&id='+id];
      }
      window.__MR_NEW_BANNER_CONFIGURED = configured.map(item => ({...item, src: normalizeNewBannerImageUrl(item.src)}));
      const normalized = window.__MR_NEW_BANNER_CONFIGURED;
      slides.innerHTML = normalized.map((item,index)=>`<div class="lumina-banner-slide ${index===0?"active":""}" aria-hidden="${index===0?"false":"true"}"><img src="${String(item.src).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" alt="${String(item.alt||'Novidade RAYSSA PRIME BEAUTY').replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" ${index===0?'loading="eager" fetchpriority="high"':'loading="lazy"'} decoding="async" referrerpolicy="no-referrer"></div>`).join("");
      dots.innerHTML = normalized.map((_,index)=>`<button type="button" class="lumina-banner-dot ${index===0?'active':''}" data-new-banner-index="${index}" aria-label="Mostrar imagem ${index+1}"></button>`).join("");
      dots.querySelectorAll("[data-new-banner-index]").forEach(dot=>dot.addEventListener("click",e=>{e.stopPropagation();setNewProductsBannerSlide(Number(dot.dataset.newBannerIndex));}));
      slides.querySelectorAll("img").forEach(img=>{
        const original=img.getAttribute('src')||''; const candidates=newBannerCandidates(original); let i=0;
        img.addEventListener('error',()=>{i+=1;if(i<candidates.length)img.src=candidates[i];else img.classList.add('lumina-banner-image-error');});
      });
      banner.addEventListener("click",e=>{if(!e.target.closest('.lumina-banner-dot')) openNewProductsBannerViewer(newProductsBannerIndex);});
      let startX=0,startY=0;
      banner.addEventListener("touchstart",e=>{const t=e.changedTouches[0];startX=t.clientX;startY=t.clientY;clearInterval(newProductsBannerTimer);},{passive:true});
      banner.addEventListener("touchend",e=>{const t=e.changedTouches[0],dx=t.clientX-startX,dy=t.clientY-startY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))setNewProductsBannerSlide((newProductsBannerIndex+(dx<0?1:-1)+configured.length)%configured.length);restartNewProductsBanner();},{passive:true});
      const restartNewProductsBanner=()=>{clearInterval(newProductsBannerTimer);newProductsBannerTimer=setInterval(()=>setNewProductsBannerSlide((newProductsBannerIndex+1)%configured.length,false),5000);};
      banner.addEventListener("mouseenter",()=>clearInterval(newProductsBannerTimer));
      banner.addEventListener("mouseleave",restartNewProductsBanner);
      restartNewProductsBanner();
    }

    function setNewProductsBannerSlide(index,restart=true){
      const slides=Array.from(document.querySelectorAll("#newProductsBannerSlides .lumina-banner-slide"));
      const dots=Array.from(document.querySelectorAll("#newProductsBannerDots .lumina-banner-dot"));
      if(!slides.length)return; newProductsBannerIndex=(index+slides.length)%slides.length;
      slides.forEach((slide,i)=>{const active=i===newProductsBannerIndex;slide.classList.toggle('active',active);slide.setAttribute('aria-hidden',active?'false':'true');});
      dots.forEach((dot,i)=>dot.classList.toggle('active',i===newProductsBannerIndex));
      if(restart){clearInterval(newProductsBannerTimer);newProductsBannerTimer=setInterval(()=>setNewProductsBannerSlide((newProductsBannerIndex+1)%slides.length,false),5000);}
    }

    let newProductsBannerViewerIndex=0;
    function renderNewProductsBannerViewer(){
      const list=window.__MR_NEW_BANNER_CONFIGURED||[]; if(!list.length)return;
      newProductsBannerViewerIndex=(newProductsBannerViewerIndex+list.length)%list.length;
      const item=list[newProductsBannerViewerIndex];
      const image=document.getElementById('newProductsBannerViewerImage');
      const dots=document.getElementById('newProductsBannerViewerDots');
      if(image){image.src=item.src;image.alt=item.alt||'Novidade RAYSSA PRIME BEAUTY';}
      if(dots)dots.innerHTML=list.map((_,i)=>`<button type="button" class="lumina-banner-dot ${i===newProductsBannerViewerIndex?'active':''}" onclick="setNewProductsBannerViewerSlide(${i})" aria-label="Mostrar imagem ${i+1}"></button>`).join('');
    }
    function openNewProductsBannerViewer(index=0){newProductsBannerViewerIndex=index;renderNewProductsBannerViewer();luminaOpenOverlay('newProductsBannerViewer');document.body.style.overflow='hidden';}
    function closeNewProductsBannerViewer(){luminaCloseOverlay('newProductsBannerViewer');document.body.style.overflow='';}
    function setNewProductsBannerViewerSlide(index){const list=window.__MR_NEW_BANNER_CONFIGURED||[];if(!list.length)return;newProductsBannerViewerIndex=(index+list.length)%list.length;renderNewProductsBannerViewer();}
    function changeNewProductsBannerViewer(delta){setNewProductsBannerViewerSlide(newProductsBannerViewerIndex+delta);}
    (function(){const stage=document.getElementById('newProductsBannerViewerStage');if(!stage)return;let x=0;stage.addEventListener('touchstart',e=>x=e.changedTouches[0].clientX,{passive:true});stage.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x;if(Math.abs(dx)>45)changeNewProductsBannerViewer(dx<0?1:-1);},{passive:true});})();

    let bannerViewerIndex = 0;
    function renderBannerViewer() {
      const list = window.__MR_BANNER_CONFIGURED || [];
      const image = document.getElementById("bannerViewerImage");
      const dots = document.getElementById("bannerViewerDots");
      if (!image || !dots || !list.length) return;
      bannerViewerIndex = (bannerViewerIndex + list.length) % list.length;
      const item = list[bannerViewerIndex];
      image.src = item.src; image.alt = item.alt || "Banner RAYSSA PRIME BEAUTY";
      dots.innerHTML = list.map((_,i)=>`<button type="button" class="lumina-banner-dot ${i===bannerViewerIndex?"active":""}" onclick="setBannerViewerSlide(${i})" aria-label="Mostrar imagem ${i+1}"></button>`).join("");
    }
    function openBannerViewer(index = luminaBannerIndex) {
      const list = window.__MR_BANNER_CONFIGURED || [];
      if (!list.length) return;
      bannerViewerIndex = Math.max(0, Math.min(index, list.length - 1));
      renderBannerViewer();
      const viewer = document.getElementById("bannerViewer");
      if (!viewer) return;
      viewer.classList.add("active"); viewer.setAttribute("aria-hidden","false");
      luminaOpenOverlay("bannerViewer"); document.body.style.overflow="hidden";
    }
    function closeBannerViewer() {
      const viewer = document.getElementById("bannerViewer");
      if (!viewer) return;
      luminaCloseOverlay("bannerViewer"); viewer.setAttribute("aria-hidden","true");
      document.body.style.overflow="auto";
    }
    function setBannerViewerSlide(index) {
      const list = window.__MR_BANNER_CONFIGURED || []; if (!list.length) return;
      bannerViewerIndex = (index + list.length) % list.length; renderBannerViewer();
    }
    function changeBannerViewer(delta) { setBannerViewerSlide(bannerViewerIndex + delta); }
    let bannerViewerStartX = 0;
    document.getElementById("bannerViewerStage")?.addEventListener("touchstart", e => { bannerViewerStartX=e.changedTouches[0].clientX; }, {passive:true});
    document.getElementById("bannerViewerStage")?.addEventListener("touchend", e => { const dx=e.changedTouches[0].clientX-bannerViewerStartX; if(Math.abs(dx)>45) changeBannerViewer(dx<0?1:-1); }, {passive:true});

    // Exportação explícita para ambientes que não disponibilizam funções declaradas
    // globalmente e nova tentativa após o carregamento completo da página.
    window.setLuminaBannerSlide = setLuminaBannerSlide;
    window.initLuminaBanner = initLuminaBanner;
    window.initNewProductsBanner = initNewProductsBanner;
    window.setNewProductsBannerSlide = setNewProductsBannerSlide;
    window.openNewProductsBannerViewer = openNewProductsBannerViewer;
    window.closeNewProductsBannerViewer = closeNewProductsBannerViewer;
    window.setNewProductsBannerViewerSlide = setNewProductsBannerViewerSlide;
    window.changeNewProductsBannerViewer = changeNewProductsBannerViewer;
    window.addEventListener("load", () => {
      const banner = document.getElementById("luminaBannerSlides");
      if (banner && !banner.querySelector(".lumina-banner-slide")) initLuminaBanner();
    }, { once: true });

    /* --------------------------------------------------
       NAVEGAÇÃO DO BOTÃO VOLTAR (ANDROID / NAVEGADOR)
       Um toque em Voltar fecha somente a tela/modal atual.
       O histórico é usado como uma pilha de telas da aplicação.
    -------------------------------------------------- */
    const LUMINA_OVERLAY_IDS = [
      "categoriesFullscreen", "favFullscreen", "cartFullscreen", "productModal",
      "checkoutStep1", "checkoutStep2", "profileModal", "infoModal", "welcomeModal", "installModal", "bannerViewer", "productImageViewer"
    ];

    function luminaHideAllOverlays() {
      LUMINA_OVERLAY_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.remove("active");
          if (id === "profileModal") el.setAttribute("aria-hidden", "true");
        }
      });
      resetZoom();
      document.body.style.overflow = "auto";
    }

    function luminaApplyHistoryState(state) {
      luminaHideAllOverlays();
      const id = state && state.luminaOverlay;
      const parentId = state && state.luminaParent;
      [parentId, id].filter(Boolean).forEach(currentId => {
        const el = document.getElementById(currentId);
        if (!el) return;
        el.classList.add("active");
        if (currentId === "profileModal") el.setAttribute("aria-hidden", "false");
        if (currentId === "productImageViewer") el.setAttribute("aria-hidden", "false");
      });
      if (id || parentId) document.body.style.overflow = "hidden";
    }

    function luminaOpenOverlay(id) {
      const current = history.state;
      if (current && current.luminaOverlay === id) {
        luminaApplyHistoryState(current);
        return;
      }
      const parentId = current?.luminaOverlay && id === "infoModal" && current.luminaOverlay === "profileModal"
        ? "profileModal"
        : null;
      history.pushState({ ...(current || {}), luminaOverlay: id, ...(parentId ? { luminaParent: parentId } : {}) }, "", location.href);
      luminaApplyHistoryState(history.state);
    }

    function luminaCloseOverlay(id) {
      const current = history.state;
      if (current && current.luminaOverlay === id) {
        history.back();
      } else {
        const el = document.getElementById(id);
        if (el) el.classList.remove("active");
      }
    }

    if (!history.state || !history.state.luminaBase) {
      history.replaceState({ luminaBase: true }, "", location.href);
    }

    window.addEventListener("popstate", event => {
      luminaApplyHistoryState(event.state || { luminaBase: true });
    });

    /* --------------------------------------------------
       VERIFICAÇÃO DE VERSÃO PUBLICADA
       Não limpa Sacola/Favoritos/Perfil: apenas detecta atualização.
    -------------------------------------------------- */
    async function checkPublishedVersion() {
      try {
        const versionFile = window.LUMINA_VERSION_FILE || "version.json";
        const response = await fetch(`${versionFile}?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" }
        });
        if (!response.ok) return false;
        const data = await response.json();
        const publishedVersion = String(data.version || "").trim();
        if (!publishedVersion || publishedVersion === LUMINA_SITE_VERSION) return false;

        // A nova publicação já existe no servidor. Solicita ao Service Worker
        // que busque a versão mais recente, sem apagar nenhum dado local.
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration && typeof registration.update === "function") {
            await registration.update().catch(() => {});
          }
        }

        const toast = document.getElementById("updateNotification");
        const versionText = document.getElementById("updateNotificationVersion");
        const status = document.getElementById("updateNotificationStatus");
        if (versionText) versionText.textContent = `Nova versão ${publishedVersion} disponível`;
        if (status) status.textContent = "Atualizando para a versão mais recente sem alterar sua Sacola ou Favoritos.";
        // A atualização publicada é aplicada pelo Service Worker sem interromper a entrada na loja.
        // O detalhe da atualização continua disponível pelo sino de notificações.
        return true;
      } catch (error) {
        // Falha de rede não interfere no funcionamento offline da loja.
        return false;
      }
    }

    /* --------------------------------------------------
       SERVICE WORKER
    -------------------------------------------------- */

    if ("serviceWorker" in navigator) {
      let luminaReloadingForUpdate = false;
      window.addEventListener("load", async () => {
        const hadController = !!navigator.serviceWorker.controller;
        try {
          const registration = await navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(LUMINA_SITE_VERSION)}`, { updateViaCache: "none" });
          if (registration && typeof registration.update === "function") {
            await registration.update().catch(() => {});
          }

          navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (!hadController || luminaReloadingForUpdate) return;
            luminaReloadingForUpdate = true;
            // Recarrega somente a interface para aplicar os arquivos novos.
            // localStorage permanece intacto, preservando Sacola e Favoritos.
            setTimeout(() => window.location.reload(), 300);
          });
        } catch (error) {
          console.warn("Service Worker não registrado:", error);
        } finally {
          setTimeout(checkPublishedVersion, 700);
        }
      });
    } else {
      window.addEventListener("load", () => setTimeout(checkPublishedVersion, 700));
    }

    /* --------------------------------------------------
       SIMULAÇÃO DE CARREGAMENTO NAS INTERAÇÕES
    -------------------------------------------------- */
    let interactionLoadingTimer = null;
    function showInteractionLoading(text = "Carregando...") {
      const overlay = document.getElementById("interactionLoading");
      const label = document.getElementById("interactionLoadingText");
      if (!overlay) return;
      if (label) label.textContent = text;
      overlay.classList.add("active");
      clearTimeout(interactionLoadingTimer);
      interactionLoadingTimer = setTimeout(() => overlay.classList.remove("active"), 480);
    }

    /* --------------------------------------------------
       INICIALIZAÇÃO
    -------------------------------------------------- */

    /* --------------------------------------------------
       VALIDAÇÃO DO CATÁLOGO
       Um cadastro incompleto não deve apagar a vitrine.
    -------------------------------------------------- */
    function validateCatalog() {
      if (!Array.isArray(products)) return;

      const seenIds = new Set();

      for (let i = products.length - 1; i >= 0; i--) {
        const p = products[i];

        if (!p || typeof p !== "object") {
          products.splice(i, 1);
          continue;
        }

        const id = Number(p.id);
        if (!Number.isFinite(id) || seenIds.has(id)) {
          console.warn("LUMINA: produto ignorado por ID inválido/duplicado:", p);
          products.splice(i, 1);
          continue;
        }

        p.id = id;
        seenIds.add(id);
        p.title = String(p.title || "Produto sem nome").trim();
        p.category = String(p.category || "Outros").trim();
        p.description = String(p.description || "").trim();

        p.status = normalizeProductStatus(p.status);
        p.highlight = normalizeProductHighlight(p.highlight || p.badge);

        const price = Number(p.priceNumber);
        p.priceNumber = Number.isFinite(price) ? price : 0;
        p.images = Array.isArray(p.images)
          ? p.images.filter(Boolean).map(normalizeProductImageUrl).filter(Boolean)
          : [];
        if (p.variations && typeof p.variations === "object" && !Array.isArray(p.variations)) {
          const normalizedVariations = {};
          Object.entries(p.variations).forEach(([name, values]) => {
            const cleanName = String(name || "").trim();
            if (!cleanName) return;
            const list = Array.isArray(values) ? values : [values];
            const cleanValues = list.map(v => String(v ?? "").trim()).filter(Boolean);
            if (cleanValues.length) normalizedVariations[cleanName] = cleanValues;
          });
          p.variations = normalizedVariations;
        } else {
          p.variations = {};
        }

        if (p.variantPrices && typeof p.variantPrices !== "object") {
          p.variantPrices = {};
        }
      }

      if (products.length === 0) {
        console.warn("LUMINA: nenhum produto válido foi encontrado em js/products.js.");
      }
    }

    validateCatalog();

    // Cada parte da interface inicia de forma independente.
    // Assim, um cadastro de produto incompleto ou uma imagem indisponível
    // nunca impede banners, perfil, sacola ou os demais produtos de carregar.
    const safeInit = (name, fn) => {
      try {
        fn();
      } catch (error) {
        console.error(`LUMINA: falha isolada em ${name}.`, error);
      }
    };

    safeInit("produtos", () => renderProducts(products));
    safeInit("estado compartilhado", refreshSharedUI);
    safeInit("banner principal", initLuminaBanner);
    safeInit("banner de novidades", initNewProductsBanner);

    // Libera a interface depois que o conteúdo inicial foi preparado.
    window.addEventListener("load", () => {
      setTimeout(() => {
        document.getElementById("appLoadingScreen").classList.add("hidden");
      }, 1100);
    });

    // Fallback para ambientes em que o evento load já ocorreu.
    setTimeout(() => {
      const loader = document.getElementById("appLoadingScreen");
      if (loader) loader.classList.add("hidden");
    }, 3200);

    showWelcomeIfNeeded();
    prepareNotificationPermissionUI();
    // O aviso de atualização fica silencioso na entrada e pode ser aberto pelo sino.
    setUpdateUnread(false);

  