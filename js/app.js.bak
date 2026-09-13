/* --------------------------------------------------
       PRODUTOS
    -------------------------------------------------- */

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

      return val.toLocaleString(
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

      document.body.style.overflow = "hidden";

    }

    function closeCategories() {

      categoriesFullscreen.classList.remove("active");

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

    function createCardHTML(p) {

      const isFav =
        favorites.includes(p.id);

      return `

        <div
          class="product-card"
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
              src="${p.images[0]}"
              alt="${p.title}"
              loading="lazy">

          </div>

          <div class="product-info">

            <h3 class="product-title">
              ${p.title}
            </h3>

            <div class="product-price">
              ${formatCurrency(p.priceNumber)}
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

          const matchesSearch =
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query);

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

      document.body.style.overflow =
        "hidden";

      renderFavorites();

    }

    function closeFavorites() {

      favFullscreen.classList.remove("active");

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
      if (!product || !product.variations || typeof product.variations !== "object") return {};
      return product.variations;
    }

    function buildVariantKey(variations = {}) {
      return Object.keys(variations)
        .sort()
        .map(key => `${key}=${variations[key]}`)
        .join("|");
    }

    function getSelectedVariantLabel(variations = selectedVariations) {
      const entries = Object.entries(variations || {});
      if (!entries.length) return "";
      return entries.map(([name, value]) => `${name}: ${value}`).join(" • ");
    }

    function getCartVariantKey(item) {
      if (item?.variantKey) return item.variantKey;
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
      const names = Object.keys(variations).filter(name => Array.isArray(variations[name]) && variations[name].length);

      if (!names.length) {
        wrapper.style.display = "none";
        container.innerHTML = "";
        return;
      }

      wrapper.style.display = "block";
      container.innerHTML = names.map(name => `
        <div class="variation-group" data-variation-name="${name}">
          <p>${name.toUpperCase()}</p>
          <div class="sizes">
            ${variations[name].map(value => `
              <button type="button"
                class="size-btn ${selectedVariations[name] === value ? "selected" : ""}"
                data-variation-name="${name}"
                data-variation-value="${value}">
                ${value}
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
      document.getElementById("modalImgMain").src = activeProduct.images[0];
      document.getElementById("modalPrice").textContent = formatCurrency(getProductPrice(activeProduct));

      document.getElementById("thumbnailsRow").innerHTML = activeProduct.images.map((imgUrl, index) => `
        <img src="${imgUrl}" class="thumb-img ${index === 0 ? "active" : ""}"
             onclick="changeMainImage('${imgUrl}', this)" alt="${activeProduct.title}">
      `).join("");

      renderVariationOptions();
      modal.classList.add("active");
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

      document.getElementById("modalPrice").textContent = formatCurrency(getProductPrice(activeProduct));
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

      modal.classList.remove("active");

      document.body.style.overflow =
        "auto";

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
      if (!activeProduct) return;

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

      document.body.style.overflow =
        "hidden";

      renderCart();

    }

    function closeCart() {

      cartFullscreen.classList.remove(
        "active"
      );

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

        cart[index].qty += delta;

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

          const itemSubtotal =
            item.priceNumber *
            item.qty;

          total += itemSubtotal;

          return `

            <div class="cart-item">

              <img
                src="${item.images[0]}"
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
                  ${formatCurrency(item.priceNumber)}
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
                    ${item.qty}
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

      }, 900);

    }

    function closeCheckoutStep1() {

      checkoutStep1.classList.remove(
        "active"
      );

      updateProgressStep(1);

    }

    function closeCheckoutStep2() {

      checkoutStep2.classList.remove(
        "active"
      );

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
            (
              i.priceNumber *
              i.qty
            ),
          0
        );

      let text =
        `==============================\n`;

      text +=
        `       LUMINA STORE - NOTA    \n`;

      text +=
        `==============================\n\n`;

      text +=
        `ITENS DO PEDIDO:\n`;

      cart.forEach(item => {

        text +=
          `- ${item.title}${item.variantLabel ? ` (${item.variantLabel})` : ""}\n`;

        text +=
          `  ${item.qty}x ${formatCurrency(item.priceNumber)} = ${formatCurrency(item.priceNumber * item.qty)}\n`;

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

      const spinner =
        document.getElementById(
          "waSpinner"
        );

      const btnText =
        document.getElementById(
          "btnWaText"
        );

      spinner.style.display =
        "inline-block";

      btnText.textContent =
        "Redirecionando...";

      setTimeout(() => {

        const text =
          generateReceiptText();

        const encodedText =
          encodeURIComponent(text);

        const phone =
          "5598991762926";

        window.open(
          `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`,
          "_blank"
        );

        spinner.style.display =
          "none";

        btnText.textContent =
          "Finalizar no WhatsApp";

      }, 1200);

    }

    function openInfo(title, text) {
      showInteractionLoading("Carregando informação...");
      const profile = document.getElementById("profileModal");
      if (profile.classList.contains("active")) profile.classList.remove("active");
      document.getElementById("infoTitle").textContent = title;
      document.getElementById("infoText").textContent = text;
      document.getElementById("infoModal").classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeInfo() {
      document.getElementById("infoModal").classList.remove("active");
      document.body.style.overflow = "auto";
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
      showInteractionLoading("Abrindo seu perfil...");
      const saved = localStorage.getItem("luminaUser");
      const profileName = document.getElementById("profileUserName");
      if (saved) {
        try { profileName.textContent = `Olá, ${JSON.parse(saved).name}!`; }
        catch (e) { profileName.textContent = "Olá!"; }
      } else { profileName.textContent = "Olá! Crie seu usuário para personalizar sua experiência."; }
      profileModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeProfile() {
      profileModal.classList.remove("active");
      if (!welcomeModal.classList.contains("active") && !installModal.classList.contains("active")) document.body.style.overflow = "auto";
    }

    profileModal.addEventListener("click", e => { if (e.target === profileModal) closeProfile(); });

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
      welcomeModal.classList.remove("active");
      document.body.style.overflow = "auto";
    }

    function showWelcomeIfNeeded() {
      if (localStorage.getItem("luminaUser")) return;

      welcomeModal.classList.add("active");
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        const input = document.getElementById("welcomeUserName");
        if (input) input.focus();
      }, 250);
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
      document.body.style.overflow = "hidden";

      if (deferredInstallPrompt) {
        message.textContent = "A LUMINA está pronta para ser instalada no seu dispositivo.";
        button.style.display = "flex";
        button.textContent = "Instalar aplicativo";
        button.disabled = false;
        return;
      }

      if (window.matchMedia("(display-mode: standalone)").matches) {
        message.textContent = "A LUMINA já está instalada como aplicativo neste dispositivo.";
        button.style.display = "flex";
        button.textContent = "Aplicativo instalado";
        button.disabled = true;
        return;
      }

      button.textContent = "Instalar aplicativo";
      button.disabled = false;
      message.textContent =
        "A instalação depende do navegador. Toque no botão abaixo; se a instalação automática não estiver disponível, serão mostradas as instruções para adicionar a LUMINA à tela inicial.";
      button.style.display = "flex";
    }

    function closeInstall() {
      installModal.classList.remove("active");
      if (!welcomeModal.classList.contains("active")) {
        document.body.style.overflow = "auto";
      }
    }

    async function installApp() {
      if (!deferredInstallPrompt) {
        document.getElementById("installMessage").textContent =
          "Seu navegador não disponibilizou a instalação automática. Abra o menu do navegador e escolha “Instalar aplicativo” ou “Adicionar à tela inicial” para instalar a LUMINA.";
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
       SERVICE WORKER
    -------------------------------------------------- */

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(error => {
          console.warn("Service Worker não registrado:", error);
        });
      });
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

    renderProducts(products);
    refreshSharedUI();

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

  