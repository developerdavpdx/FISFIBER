class GeneracionEtiquetaDto {
    constructor({
        tipoBtnGeneraEtiqueta = null,
        tipoEtiqueta = null,
        turnoEnCurso = null,
        // Agrega aquí los que vayas necesitando...
    } = {}) {
        this.tipoBtnGeneraEtiqueta = tipoBtnGeneraEtiqueta;
        this.tipoEtiqueta = tipoEtiqueta;
        this.turnoEnCurso = turnoEnCurso;
    }
}