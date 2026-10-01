with open("static/js/main_ui.js", "r") as f:
    content = f.read()

content = content.replace('"PEGAR_AQUI_LA_URL_DEL_WEB_APP"', '"https://script.google.com/macros/s/AKfycbwIUgcewvDd5Bh3RpgJ4W0wOku7Xwk5KtVSBobXp0LA2Az4Ctf3hZBpwAIu6HevLIpDNQ/exec"')

with open("static/js/main_ui.js", "w") as f:
    f.write(content)
