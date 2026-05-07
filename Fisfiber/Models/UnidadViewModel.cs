using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Fisfiber.Models
{
    public class UnidadViewModel
    {
        public int Id { get; set; }
        public string TipoUnidad { get; set; }
        public int Capacidad { get; set; }
        public string EstadoNombre { get; set; }
        public string Comentarios { get; set; }
        public string Operador { get; set; }
        public string Ayudante1 { get; set; }
        public string Ayudante2 { get; set; }
        public string Ayudante3 { get; set; }
        public string Ayudante4 { get; set; }
    }

}