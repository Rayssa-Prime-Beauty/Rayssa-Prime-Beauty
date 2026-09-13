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

    const luminaChannel = "BroadcastChannel" in window
      ? new BroadcastChannel("lumina-sync")
      : null;

    function readJSON(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch (error) {
        console.warn("LUMINA: não foi possível ler", key, error);
        return fallback;
      }
    }

    let cart = readJSON(LUMINA_STORAGE.cart, []);
    let favorites = readJSON(LUMINA_STORAGE.favorites, []);

    function persistSharedState(source = "local") {
      localStorage.setItem(LUMINA_STORAGE.cart, JSON.stringify(cart));
      localStorage.setItem(LUMINA_STORAGE.favorites, JSON.stringify(favorites));

      const detail = { cart, favorites, source, at: Date.now() };
      window.dispatchEvent(new CustomEvent("lumina:statechange", { detail }));

      if (luminaChannel) {
        luminaChannel.postMessage(detail);
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
      if (detail.source === "local") return;
      cart = Array.isArray(detail.cart) ? detail.cart : [];
      favorites = Array.isArray(detail.favorites) ? detail.favorites : [];
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
