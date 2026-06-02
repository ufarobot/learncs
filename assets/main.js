(() => {
  const METRIKA_COUNTER_ID = 109571501;

  window.learncsReachGoal = (goal, params = {}) => {
    if (!goal || typeof window.ym !== "function") return;
    window.ym(METRIKA_COUNTER_ID, "reachGoal", goal, params);
  };

  const isOrderLink = (link) => {
    const href = link.getAttribute("href") || "";
    return href === "#order" || href.endsWith("/#order") || link.hash === "#order";
  };

  const isChatLink = (link) => {
    const host = link.hostname.replace(/^www\./, "");
    return host === "t.me" || host === "max.ru";
  };

  const isSamePageHashLink = (link) => {
    if (link.hash !== "#order") return false;
    return link.origin === window.location.origin && link.pathname === window.location.pathname;
  };

  const scrollToOrder = () => {
    const target = document.querySelector("#order");
    if (!target) return;

    const header = document.querySelector("[data-header]");
    const headerOffset = header ? header.getBoundingClientRect().height + 16 : 82;
    const scroll = (behavior = "smooth") => {
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior });
    };
    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    const imagesBeforeTarget = Array.from(document.querySelectorAll("img")).filter((image) => {
      return image.getBoundingClientRect().top + window.scrollY < targetTop;
    });

    scroll();
    imagesBeforeTarget.forEach((image) => {
      if (!image.complete) {
        image.addEventListener("load", () => scroll("auto"), { once: true });
      }
    });
    [350, 900, 1600, 2600, 4200, 6200].forEach((delay) => {
      window.setTimeout(() => scroll("auto"), delay);
    });
  };

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const link = event.target.closest("a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;

    const goal = isOrderLink(link)
      ? "ym-open-leadform"
      : isChatLink(link)
        ? "ym-open-chat"
        : "";
    const sourceGoal = link.dataset.metrikaGoal || "";
    const source = link.dataset.metrikaSource || "";

    if (!goal) return;

    const goalParams = {
      href: link.href,
      source,
      text: link.textContent.trim(),
    };

    window.learncsReachGoal(goal, goalParams);
    if (sourceGoal && sourceGoal !== goal) {
      window.learncsReachGoal(sourceGoal, goalParams);
    }

    if (goal === "ym-open-leadform" && isSamePageHashLink(link)) {
      event.preventDefault();
      scrollToOrder();
    }
  });
})();

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
  const forms = document.querySelectorAll("[data-order-form]");

  forms.forEach((form) => {
    const fields = form.querySelector("[data-form-fields]");
    const status = form.querySelector("[data-form-status]");
    const submit = form.querySelector('button[type="submit"]');

    if (!fields || !status || !submit) return;

    const submitLabel = submit.textContent;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const payload = {
        name: String(data.get("name") || "").trim(),
        contact: String(data.get("contact") || "").trim(),
        page: window.location.href,
        comment: "",
      };

      status.hidden = false;
      status.textContent = "Отправляем заявку...";
      status.className = "order-form-status is-pending";
      submit.disabled = true;
      submit.textContent = "Отправляем...";

      try {
        const response = await fetch(form.dataset.endpoint, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(payload),
        });

        if (response.type !== "opaque" && !response.ok) {
          throw new Error("Request failed");
        }

        form.reset();
        form.classList.add("is-sent");
        status.textContent = form.dataset.successText;
        status.className = "order-form-status is-success";

        if (typeof window.learncsReachGoal === "function") {
          window.learncsReachGoal("ym-submit-leadform", {
            page: window.location.href,
          });
        }
      } catch {
        status.textContent = form.dataset.errorText;
        status.className = "order-form-status is-error";
      } finally {
        submit.disabled = false;
        submit.textContent = submitLabel;
      }
    });
  });
})();
