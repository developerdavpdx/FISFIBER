namespace Fisfiber.Models
{
    public class Correos
    {
        public string Id { get; set; }
        public string Correo { get; set; }
        public int IdMail { get; set; }
        public string NombreDestinatario { get; set; }
        public int IdCargo { get; set; }
        public string Cargo { get; set; }
        public int Estatus { get; set; }
    }
}