/**
 * TopScrollTable - Crea un scroll horizontal virtual en la parte superior de tablas
 */
class TopScrollTable {
    constructor(idContTable, idScroll) {
        this.idContTable = idContTable;
        this.idScroll = idScroll;

        console.log('TopScrollTable inicializado:', {
            idContTable: this.idContTable,
            idScroll: this.idScroll
        });
    }

    /**
     * Crea el elemento HTML del scroll superior
     */
    createScroll() {
        const $tableWrapper = $(`#${this.idContTable}`); 

        if ($tableWrapper.length === 0) {
            console.error(`No se encontró el contenedor: #${this.idContTable}`);
            return;
        }

        // Solo crear si no existe
        if (!$(`#${this.idScroll}`).length) {
            const scrollTopHtml = `
                <div class="horizontal-scroll-top" id="${this.idScroll}">
                    <div class="scroll-content"></div>
                </div>
            `;
            $tableWrapper.before(scrollTopHtml);
            console.log(`Scroll superior creado: #${this.idScroll}`);
        } else {
            console.log(`Scroll superior ya existe: #${this.idScroll}`);
        }
    }

    /**
     * Inicializa la sincronización de scrolls
     */
    initScroll() {
        const $tableWrapper = $(`#${this.idContTable}`);
        const $scrollTop = $(`#${this.idScroll}`);

        if ($tableWrapper.length === 0) {
            console.error(`No se encontró el contenedor: #${this.idContTable}`);
            return;
        }

        if ($scrollTop.length === 0) {
            console.error(`No se encontró el scroll superior: #${this.idScroll}`);
            return;
        }

        // ✅ Sincroniza scroll superior → tabla
        $scrollTop.on('scroll', () => {
            $tableWrapper.scrollLeft($scrollTop.scrollLeft());
        });

        // ✅ Sincroniza tabla → scroll superior
        $tableWrapper.on('scroll', () => {
            $scrollTop.scrollLeft($tableWrapper.scrollLeft());
        });

        // Ajusta ancho inicial
        this.syncScrollWidth();

        // Configurar eventos de ventana
        this.configurarEventos();

        console.log('Sincronización de scrolls inicializada');
    }

    /**
     * Sincroniza el ancho del scroll con la tabla
     */
    syncScrollWidth() {
        const $scrollContent = $(`#${this.idScroll} .scroll-content`);
        const $tableWrapper = $(`#${this.idContTable}`);

        if ($tableWrapper.length === 0 || $scrollContent.length === 0) {
            return;
        }

        // Obtener el ancho real del contenido scrolleable
        const scrollWidth = $tableWrapper[0].scrollWidth;
        $scrollContent.width(scrollWidth);

        console.log(`Ancho sincronizado: ${scrollWidth}px`);
    }

    /**
     * Configura eventos de ventana (resize y scroll)
     */
    configurarEventos() {
        // ✅ Arrow function para mantener el contexto de 'this'
        $(window).on('resize', () => {
            this.syncScrollWidth();
        });

        // ✅ Arrow function para acceder a this.idScroll y this.idContTable
        $(window).on('scroll', () => {
            const $scrollTop = $(`#${this.idScroll}`);
            const $table = $(`#${this.idContTable}`);

            if ($table.length === 0 || $scrollTop.length === 0) {
                return;
            }

            // Posición vertical actual del viewport
            const scrollTop = $(window).scrollTop();

            // Donde inicia la tabla
            const tableTop = $table.offset().top;

            // Donde termina la tabla
            const tableBottom = tableTop + $table.outerHeight();

            // Si el viewport está dentro del rango de la tabla
            if (scrollTop > tableTop && scrollTop < tableBottom) {
                // Muestra el scroll y lo fija arriba
                $scrollTop.addClass('fixed').show();
            }
            else if (scrollTop < tableTop) {
                // Se muestra pero en posición normal (no fixed)
                $scrollTop.removeClass('fixed').show();
            }
            else {
                // Se oculta completamente
                $scrollTop.removeClass('fixed').hide();
            }
        });

        console.log('Eventos de ventana configurados');
    }

    /**
     * Destruye los event listeners para evitar memory leaks
     */
    destroy() {
        const $tableWrapper = $(`#${this.idContTable}`);
        const $scrollTop = $(`#${this.idScroll}`);

        // Remover eventos específicos de la tabla
        $scrollTop.off('scroll');
        $tableWrapper.off('scroll');

        // Remover scroll superior del DOM
        $scrollTop.remove();

        console.log('TopScrollTable destruido correctamente');
    }

    /**
     * Recalcula y actualiza el scroll (útil después de cargar datos con AJAX)
     */
    refresh() {
        this.syncScrollWidth();
        console.log('TopScrollTable refrescado');
    }
}

// ========================================
// EJEMPLO DE USO
// ========================================

// Inicialización básica
//const topScroll = new TopScrollTable(
//    "ManntoScroll",               // ID del contenedor de la tabla
//    "scrollTopMannto"             // ID del scroll superior
//);

//topScroll.createScroll();
//topScroll.initScroll();

//// Después de cargar datos con DataTables o AJAX
//$('#tablaMantenimientosRango').on('draw.dt', function () {
//    topScroll.refresh();
//});

// Para destruir cuando cambies de vista
// topScroll.destroy();