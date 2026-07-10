/**
 * ==========================================================================================
 * Animador de pesos para indicadores industriales.
 *
 * Responsabilidades:
 *  - Mostrar el peso con una transición suave.
 *  - Nunca acumular animaciones.
 *  - Siempre perseguir el último valor recibido.
 *  - No alterar el dato real recibido desde SignalR.
 * ==========================================================================================
 */
class PesoAnimator {

    /**
     * @param {string} selector Selector del elemento HTML.
     */
    constructor(selector) {

        this.$element = $(selector);

        this.valorMostrado = 0;
        this.valorDestino = 0;

        this.animando = false;

        this.frameId = null;

        this.ultimoTiempo = null;

        this.duracion = 100; // ms

    }

    /**
     * Solicita mostrar un nuevo peso.
     * @param {number} nuevoPeso
     */
    actualizar(nuevoPeso) {

        this.valorDestino = nuevoPeso;

        if (!this.animando) {

            this.animando = true;

            this.ultimoTiempo = null;

            this.frameId = requestAnimationFrame(
                this.animar.bind(this)
            );

        }

    }

    /**
     * Animación principal.
     */
    animar(timestamp) {

        if (!this.ultimoTiempo)
            this.ultimoTiempo = timestamp;

        const delta = timestamp - this.ultimoTiempo;

        this.ultimoTiempo = timestamp;

        const diferencia = this.valorDestino - this.valorMostrado;

        // Ya llegó al destino.
        if (Math.abs(diferencia) < 0.01) {

            this.valorMostrado = this.valorDestino;

            this.render();

            this.animando = false;

            this.frameId = null;

            return;
        }

        // Velocidad adaptativa.
        const velocidad = delta / this.duracion;

        this.valorMostrado += diferencia * velocidad;

        this.render();

        this.frameId = requestAnimationFrame(
            this.animar.bind(this)
        );

    }

    /**
     * Actualiza el HTML.
     */
    render() {

        this.$element.text(
            this.valorMostrado.toFixed(2) + " kg"
        );

    }

}