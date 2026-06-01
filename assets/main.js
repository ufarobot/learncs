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
