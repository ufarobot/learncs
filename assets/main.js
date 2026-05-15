(() => {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");

  if (!header || !nav || !toggle) return;

  const setOpen = (isOpen) => {
    header.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  };

  toggle.addEventListener("click", () => {
    setOpen(!header.classList.contains("is-open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setOpen(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });
})();

(() => {
  const cards = document.querySelectorAll(".module-item");

  cards.forEach((card, index) => {
    const summary = card.querySelector("summary");
    const content = card.querySelector(".module-content");

    if (!(card instanceof HTMLDetailsElement) || !summary || !content) return;

    card.classList.add("is-flip-card");
    card.open = true;

    const contentId = content.id || `module-card-content-${index + 1}`;
    content.id = contentId;
    summary.setAttribute("aria-controls", contentId);

    const closeButton = document.createElement("button");
    closeButton.className = "module-card-close";
    closeButton.type = "button";
    closeButton.textContent = "Назад";
    content.prepend(closeButton);

    const updateHeight = () => {
      const activePanel = card.classList.contains("is-flipped") ? content : summary;
      card.style.setProperty("--module-card-height", `${activePanel.scrollHeight}px`);
    };

    let heightFrame = 0;
    const queueHeightUpdate = () => {
      cancelAnimationFrame(heightFrame);
      heightFrame = requestAnimationFrame(updateHeight);
    };

    const setFlipped = (isFlipped, returnFocus = false) => {
      card.classList.toggle("is-flipped", isFlipped);
      summary.setAttribute("aria-expanded", String(isFlipped));
      content.setAttribute("aria-hidden", String(!isFlipped));

      if ("inert" in content) {
        content.inert = !isFlipped;
      }

      closeButton.tabIndex = isFlipped ? 0 : -1;

      if (returnFocus) {
        summary.focus();
      }

      updateHeight();
    };

    setFlipped(false);

    summary.querySelectorAll("img").forEach((image) => {
      if (image.complete) return;

      image.addEventListener("load", queueHeightUpdate, { once: true });
      image.addEventListener("error", queueHeightUpdate, { once: true });
    });

    window.addEventListener("load", queueHeightUpdate, { once: true });
    window.addEventListener("resize", queueHeightUpdate);

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      setFlipped(!card.classList.contains("is-flipped"));
    });

    closeButton.addEventListener("click", () => {
      setFlipped(false, true);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && card.classList.contains("is-flipped")) {
        setFlipped(false, true);
      }
    });
  });
})();
