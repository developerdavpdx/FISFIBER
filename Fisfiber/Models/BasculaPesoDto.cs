using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Fisfiber.Models
{
    public class BasculaPesoDto
    {
        public decimal Peso { get; set; }
        public string Marca { get; set; }
        public string Modelo { get; set; }
        public string Estatus { get; set; }
    }
}