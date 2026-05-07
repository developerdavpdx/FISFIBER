namespace Fisfiber.Models
{
    public class EmailRequest
    {
        public string To { get; set; } // Dirección del destinatario
        public string Subject { get; set; } // Asunto del correo
        public string Body { get; set; } // Contenido del correo
        public bool IsHtml { get; set; } = true; // Si el contenido es HTML o texto plano
    }
}