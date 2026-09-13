/* =========================================================
   LUMINA — ESTADO COMPARTILHADO
   Sincroniza sacola, favoritos e usuário entre abas/janelas.
   ========================================================= */

/* Estado compartilhado entre páginas/abas */
    const LUMINA_STORAGE = {
      cart: "luminaCart",
      favorites: "luminaFavorites",
      user: "luminaUser"
    };

    let luminaChannel = null;
    try {
      if ("BroadcastChannel" in window) {
        luminaChannel = new BroadcastChannel("lumina-sync");
      }
    } catch (error) {
      console.warn("LUMINA: sincronização entre abas indisponível.", error);
      luminaChannel = null;
    }

    function readJSON(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch (error) {
        console.warn("LUMINA: não foi possível ler", key, error);
        return fallback;
      }
    }

    // Garante que dados antigos/corrompidos nunca impeçam a inicialização.
    let cart = readJSON(LUMINA_STORAGE.cart, []);
    let favorites = readJSON(LUMINA_STORAGE.favorites, []);

    if (!Array.isArray(cart)) cart = [];
    if (!Array.isArray(favorites)) favorites = [];

    // Normaliza dados de versões anteriores sem mudar o conteúdo do usuário.
    cart = cart
      .filter(item => item && typeof item === "object" && item.id != null)
      .map(item => ({
        ...item,
        id: Number(item.id),
        qty: Math.max(1, Number(item.qty) || 1),
        priceNumber: Number(item.priceNumber) || 0,
        images: Array.isArray(item.images) ? item.images : [],
        variantKey: typeof item.variantKey === "string" ? item.variantKey : "",
        variantLabel: typeof item.variantLabel === "string" ? item.variantLabel : ""
      }));

    favorites = favorites
      .map(id => Number(id))
      .filter(id => Number.isFinite(id));

    function safeSetJSON(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        // O site continua funcionando mesmo quando o armazenamento do navegador
        // estiver bloqueado, cheio ou indisponível.
        console.warn("LUMINA: não foi possível salvar", key, error);
        return false;
      }
    }

    function persistSharedState(source = "local") {
      safeSetJSON(LUMINA_STORAGE.cart, cart);
      safeSetJSON(LUMINA_STORAGE.favorites, favorites);

      const detail = { cart, favorites, source, at: Date.now() };

      try {
        window.dispatchEvent(new CustomEvent("lumina:statechange", { detail }));
      } catch (_) {}

      if (luminaChannel) {
        try {
          // BroadcastChannel não envia a mensagem de volta para a própria aba.
          // Portanto, "local" não deve ser descartado no receptor.
          luminaChannel.postMessage(detail);
        } catch (_) {}
      }
    }

    function refreshSharedUI() {
      updateCartBadge();

      const bottomFavBadge = document.getElementById("bottomFavBadge");
      const favBadge = document.getElementById("favBadge");
      if (favBadge) favBadge.textContent = favorites.length;
      if (bottomFavBadge) {
        bottomFavBadge.textContent = favorites.length;
        bottomFavBadge.style.display = favorites.length > 0 ? "flex" : "none";
      }

      filterProducts();

      if (favFullscreen && favFullscreen.classList.contains("active")) {
        renderFavorites();
      }

      if (cartFullscreen && cartFullscreen.classList.contains("active")) {
        renderCart();
      }

      const profileName = document.getElementById("profileUserName");
      const savedUser = localStorage.getItem(LUMINA_STORAGE.user);
      if (profileName && savedUser) {
        try {
          profileName.textContent = `Olá, ${JSON.parse(savedUser).name}!`;
        } catch (_) {}
      }
    }

    function receiveSharedState(detail) {
      if (!detail) return;
      if (detail.type === "user") {
        refreshSharedUI();
        return;
      }
      cart = Array.isArray(detail.cart) ? detail.cart : [];
      favorites = Array.isArray(detail.favorites) ? detail.favorites : [];

      // Normaliza novamente dados recebidos de outra aba.
      cart = cart
        .filter(item => item && typeof item === "object" && item.id != null)
        .map(item => ({
          ...item,
          id: Number(item.id),
          qty: Math.max(1, Number(item.qty) || 1),
          priceNumber: Number(item.priceNumber) || 0,
          images: Array.isArray(item.images) ? item.images : [],
          variantKey: typeof item.variantKey === "string" ? item.variantKey : "",
          variantLabel: typeof item.variantLabel === "string" ? item.variantLabel : ""
        }));

      favorites = favorites.map(id => Number(id)).filter(id => Number.isFinite(id));
      refreshSharedUI();
    }

    window.addEventListener("storage", event => {
      if (event.key === LUMINA_STORAGE.cart || event.key === LUMINA_STORAGE.favorites) {
        cart = readJSON(LUMINA_STORAGE.cart, []);
        favorites = readJSON(LUMINA_STORAGE.favorites, []);
        refreshSharedUI();
      }
      if (event.key === LUMINA_STORAGE.user) {
        refreshSharedUI();
      }
    });

    if (luminaChannel) {
      luminaChannel.addEventListener("message", event => receiveSharedState(event.data));
    }

    window.addEventListener("lumina:statechange", event => {
      if (event.detail?.source === "remote") refreshSharedUI();
    });
