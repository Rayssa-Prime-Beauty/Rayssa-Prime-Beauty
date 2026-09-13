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

    let currentStep = 1;

    /* --------------------------------------------------
       ELEMENTOS
    -------------------------------------------------- */

    const grid =
      document.getElementById("productsGrid");

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
    function getProductStatus(product) {
      const status = String(product?.status || "disponivel").toLowerCase().trim();
      return ["disponivel", "sem-estoque", "vendido"].includes(status)
        ? status
        : "disponivel";
    }

    function getProductStatusLabel(product) {
      const status = getProductStatus(product);
      if (status === "vendido") return "Vendido";
      if (status === "sem-estoque") return "Sem estoque";
      return "";
    }

    function isProductAvailable(product) {
      return getProductStatus(product) === "disponivel";
    }

    function createCardHTML(p) {

      const isFav =
        favorites.includes(p.id);

      return `

        <div
          class="product-card ${isProductAvailable(p) ? "" : "product-card-unavailable"}"
          onclick="openModal(${p.id})">

          <button
            class="card-fav-btn ${isFav ? "active" : ""}"
            onclick="toggleFavorite(event, ${p.id})">

            <svg viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>

          </button>

          <div class="product-image-wrap">

            <img
              src="${p.images[0]}" data-original-image="${p.images[0]}" data-image-candidate="0"
              alt="${p.title}"
              loading="lazy">

          </div>

          <div class="product-info">

            <h3 class="product-title">
              ${p.title}
            </h3>

            <div class="product-price ${isProductAvailable(p) ? "" : "product-status-unavailable"}">
              ${isProductAvailable(p) ? formatCurrency(p.priceNumber) : getProductStatusLabel(p)}
            </div>

          </div>

        </div>

      `;

    }

    function renderProducts(items) {

      if (items.length === 0) {

        grid.innerHTML = `
          <div style="
            grid-column:1/-1;
            text-align:center;
            padding:40px;
            color:#888;
          ">
            Nenhum produto encontrado.
          </div>
        `;

        return;
      }

      grid.innerHTML =
        items.map(
          p => createCardHTML(p)
        ).join("");

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
      document.getElementById("modalDesc").textContent = activeProduct.description;
      const modalMainImage = document.getElementById("modalImgMain");
      modalMainImage.dataset.originalImage = activeProduct.images[0];
      modalMainImage.dataset.imageCandidate = "0";
      modalMainImage.src = activeProduct.images[0];
      const modalPrice = document.getElementById("modalPrice");
      const addButton = document.querySelector("#productModal .add-to-cart");
      const available = isProductAvailable(activeProduct);
      if (modalPrice) {
        modalPrice.textContent = available
          ? formatCurrency(getProductPrice(activeProduct))
          : getProductStatusLabel(activeProduct);
        modalPrice.classList.toggle("product-status-unavailable", !available);
      }
      if (addButton) {
        addButton.disabled = !available;
        addButton.textContent = available ? "Adicionar à Sacola" : getProductStatusLabel(activeProduct);
        addButton.classList.toggle("is-unavailable", !available);
      }

      document.getElementById("thumbnailsRow").innerHTML = activeProduct.images.map((imgUrl, index) => `
        <img src="${imgUrl}" data-original-image="${imgUrl}" data-image-candidate="0" class="thumb-img ${index === 0 ? "active" : ""}"
             onclick="changeMainImage('${imgUrl}', this)" alt="${activeProduct.title}">
      `).join("");

      renderVariationOptions();
      modal.classList.add("active");
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
        priceEl.textContent = isProductAvailable(activeProduct)
          ? formatCurrency(getProductPrice(activeProduct))
          : getProductStatusLabel(activeProduct);
      }
    });

    function changeMainImage(
      url,
      element
    ) {

      document.getElementById(
        "modalImgMain"
      ).src = url;

      document
        .querySelectorAll(
          ".thumb-img"
        )
        .forEach(
          t =>
            t.classList.remove("active")
        );

      element.classList.add("active");

    }

    function handleZoom(e) {

      const img =
        document.getElementById(
          "modalImgMain"
        );

      const rect =
        e.currentTarget.getBoundingClientRect();

      const x =
        ((e.clientX - rect.left) /
          rect.width) *
        100;

      const y =
        ((e.clientY - rect.top) /
          rect.height) *
        100;

      img.style.transformOrigin =
        `${x}% ${y}%`;

      img.style.transform =
        "scale(2)";

    }

    function resetZoom() {

      const img =
        document.getElementById(
          "modalImgMain"
        );

      img.style.transform =
        "scale(1)";

      img.style.transformOrigin =
        "center center";

    }

    function closeModal() {

      luminaCloseOverlay("productModal");

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
                src="${item.images[0]}" data-original-image="${item.images[0]}" data-image-candidate="0"
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

        checkoutStep1.classList.add(
          "active"
        );
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

    function proceedToReview() {

      if (deliveryType === "delivery") {

        const bairro =
          document.getElementById(
            "inpBairro"
          ).value;

        const rua =
          document.getElementById(
            "inpRua"
          ).value;

        const numero =
          document.getElementById(
            "inpNumero"
          ).value;

        const contato =
          document.getElementById(
            "inpContato"
          ).value;

        const cpf =
          document.getElementById(
            "inpCpf"
          ).value;

        if (
          !bairro ||
          !rua ||
          !numero ||
          !contato ||
          !cpf
        ) {

          alert(
            "Por favor, preencha todos os campos obrigatórios (*)."
          );

          return;

        }

      }

      else {

        const nome =
          document.getElementById(
            "inpNomePickup"
          ).value;

        const cpf =
          document.getElementById(
            "inpCpfPickup"
          ).value;

        if (!nome || !cpf) {

          alert(
            "Por favor, preencha o Nome e o CPF."
          );

          return;

        }

      }

      const spinner =
        document.getElementById(
          "reviewSpinner"
        );

      const btnText =
        document.getElementById(
          "btnReviewText"
        );

      spinner.style.display =
        "inline-block";

      btnText.textContent =
        "Validando dados...";

      setTimeout(() => {

        spinner.style.display =
          "none";

        btnText.textContent =
          "Prosseguir para Revisão";

        renderReceiptPreview();

        updateProgressStep(3);

        checkoutStep2.classList.add(
          "active"
        );
        luminaOpenOverlay("checkoutStep2");

      }, 900);

    }

    /* --------------------------------------------------
       RECIBO / PEDIDO
    -------------------------------------------------- */

    function generateReceiptText() {

      let total =
        cart.reduce(
          (acc, i) =>
            acc +
            ((Number(i.priceNumber) || 0) * (Number(i.qty) || 0)),
          0
        );

      let text =
        `==============================\n`;

      text +=
        `       RAYSSA PRIME BEAUTY - NOTA    \n`;

      text +=
        `==============================\n\n`;

      text +=
        `ITENS DO PEDIDO:\n`;

      cart.forEach(item => {

        text +=
          `- ${item.title}${item.variantLabel ? ` (${item.variantLabel})` : ""}\n`;

        text +=
          `  ${Number(item.qty) || 0}x ${formatCurrency(item.priceNumber)} = ${formatCurrency((Number(item.priceNumber) || 0) * (Number(item.qty) || 0))}\n`;

      });

      text +=
        `\n------------------------------\n`;

      text +=
        `TOTAL: ${formatCurrency(total)}\n`;

      text +=
        `------------------------------\n\n`;

      text +=
        `DADOS DE ENTREGA:\n`;

      if (deliveryType === "delivery") {

        text +=
          `Tipo: Entrega Local (Chapadinha - MA)\n`;

        text +=
          `Bairro: ${
            document.getElementById(
              "inpBairro"
            ).value
          }\n`;

        text +=
          `Rua: ${
            document.getElementById(
              "inpRua"
            ).value
          }, Nº ${
            document.getElementById(
              "inpNumero"
            ).value
          }\n`;

        text +=
          `Contato: ${
            document.getElementById(
              "inpContato"
            ).value
          }\n`;

        text +=
          `CPF: ${
            document.getElementById(
              "inpCpf"
            ).value
          }\n`;

        if (
          document.getElementById(
            "inpRef"
          ).value
        ) {

          text +=
            `Ref: ${
              document.getElementById(
                "inpRef"
              ).value
            }\n`;

        }

        if (
          document.getElementById(
            "inpNota"
          ).value
        ) {

          text +=
            `Nota: ${
              document.getElementById(
                "inpNota"
              ).value
            }\n`;

        }

      }

      else {

        text +=
          `Tipo: Retirar com o Vendedor\n`;

        text +=
          `Nome: ${
            document.getElementById(
              "inpNomePickup"
            ).value
          }\n`;

        text +=
          `CPF: ${
            document.getElementById(
              "inpCpfPickup"
            ).value
          }\n`;

      }

      text +=
        `==============================`;

      return text;

    }

    function renderReceiptPreview() {

      const receipt =
        generateReceiptText();

      document.getElementById(
        "receiptPreview"
      ).textContent =
        receipt;

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

      if (profileName) {
        if (saved) {
          try {
            const user = JSON.parse(saved);
            profileName.textContent = user && user.name
              ? `Olá, ${user.name}!`
              : "Olá!";
          } catch (e) {
            profileName.textContent = "Olá!";
          }
        } else {
          profileName.textContent = "Olá! Você não precisa criar uma conta. Sua sacola e seus favoritos ficam salvos neste dispositivo.";
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
    const LUMINA_SITE_VERSION = String(window.LUMINA_SITE_VERSION || "6.1.5");
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
              icon: "./icon-192-v6-1-8.png",
              badge: "./icon-192-v6-1-8.png",
              tag: `lumina-update-${LUMINA_SITE_VERSION}`,
              renotify: true,
              data: { url: "./" }
            });
            return;
          }
        }
        new Notification(title, { body, icon: "./icon-192-v6-1-8.png", tag: "lumina-update" });
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

    // Exportação explícita para ambientes que não disponibilizam funções declaradas
    // globalmente e nova tentativa após o carregamento completo da página.
    window.setLuminaBannerSlide = setLuminaBannerSlide;
    window.initLuminaBanner = initLuminaBanner;
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
      "checkoutStep1", "checkoutStep2", "profileModal", "infoModal", "welcomeModal", "installModal"
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
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add("active");
      if (id === "profileModal") el.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function luminaOpenOverlay(id) {
      const current = history.state;
      if (current && current.luminaOverlay === id) {
        luminaApplyHistoryState(current);
        return;
      }
      history.pushState({ ...(current || {}), luminaOverlay: id }, "", location.href);
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
        if (toast) toast.classList.add("active");
        setUpdateUnread(true);
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

        const status = String(p.status || "disponivel").toLowerCase().trim();
        p.status = ["disponivel", "sem-estoque", "vendido"].includes(status)
          ? status
          : "disponivel";

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

    try {
      renderProducts(products);
      refreshSharedUI();
      initLuminaBanner();
    } catch (error) {
      console.error("LUMINA: erro na inicialização da interface.", error);
      const loader = document.getElementById("appLoadingScreen");
      if (loader) loader.classList.add("hidden");
    }

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
    restoreUpdateBell();
    setTimeout(showUpdateNotification, 350);

  