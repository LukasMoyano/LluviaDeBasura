document.addEventListener('DOMContentLoaded', () => {
    console.log("UI Inicializada: Tema Cyberpunk Andino");
    
    const btnPlay = document.getElementById('btn-calibrate');
    if (btnPlay) {
        btnPlay.addEventListener('click', () => {
            document.getElementById('game-ui-overlay').style.display = 'none';
            if (window.startGameEngine) {
                window.startGameEngine();
            }
        });
    }
});
