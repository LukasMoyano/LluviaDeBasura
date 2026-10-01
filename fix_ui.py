with open("static/js/main_ui.js", "r") as f:
    content = f.read()

# Fix the global replace mistake
content = content.replace(
    'if (GOOGLE_SCRIPT_URL === "https://script.google.com/macros/s/AKfycbwIUgcewvDd5Bh3RpgJ4W0wOku7Xwk5KtVSBobXp0LA2Az4Ctf3hZBpwAIu6HevLIpDNQ/exec") {',
    'if (GOOGLE_SCRIPT_URL === "PEGAR_AQUI_LA_URL_DEL_WEB_APP") {'
)

with open("static/js/main_ui.js", "w") as f:
    f.write(content)
