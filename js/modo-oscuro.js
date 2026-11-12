(function () {
    const storageKey = "modo-oscuro";

    function setDarkMode(enabled) {
        document.documentElement.classList.toggle("dark", enabled);

        const button = document.getElementById("theme-toggle");
        if (button) {
            button.setAttribute("aria-pressed", String(enabled));
            button.innerHTML = enabled
                ? '<i class="fa-solid fa-sun" aria-hidden="true"></i><span>Modo claro</span>'
                : '<i class="fa-solid fa-moon" aria-hidden="true"></i><span>Modo oscuro</span>';
        }

        try {
            localStorage.setItem(storageKey, String(enabled));
        } catch (error) {
            console.error("No se pudo guardar la preferencia del tema.", error);
        }
    }

    try {
        document.documentElement.classList.toggle("dark", localStorage.getItem(storageKey) === "true");
    } catch (error) {
        console.error("No se pudo leer la preferencia del tema.", error);
    }

    function addThemeButton() {
        const button = document.createElement("button");
        button.id = "theme-toggle";
        button.type = "button";
        button.setAttribute("aria-label", "Cambiar tema de color");
        button.addEventListener("click", function () {
            setDarkMode(!document.documentElement.classList.contains("dark"));
        });
        document.body.appendChild(button);
        setDarkMode(document.documentElement.classList.contains("dark"));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addThemeButton, { once: true });
    } else {
        addThemeButton();
    }
})();
