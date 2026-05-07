using Fisfiber.Controllers;
using log4net;
using Microsoft.AspNet.SignalR;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace Fisfiber.Hubs
{
    public class ParosHub : Hub
    {
        #region Ciclo de vida SignalR
        private static readonly ILog log = LogManager.GetLogger(typeof(ParosHub));

        public override Task OnConnected()
        {

            var userId = Context.QueryString["userId"] ?? "SIN_USUARIO";


            log.Info(
                $"[SignalR][ParosHub] Conectado | ConnId: {Context.ConnectionId} | User: {userId}"
            );

            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            log.Info(
                $"[SignalR][ParosHub] Desconectado | ConnId: {Context.ConnectionId} | stopCalled: {stopCalled} | {DateTime.Now:yyyy-MM-dd HH:mm:ss}"
            );

            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            log.Info(
                $"[SignalR][ParosHub] Reconectado | ConnId: {Context.ConnectionId} | {DateTime.Now:yyyy-MM-dd HH:mm:ss}"
            );

            return base.OnReconnected();
        }

        #endregion

        #region Eventos de negocio

        public void NuevoParo(string Paro)
        {
            log.Info(
                $"[SignalR][ParosHub] Evento NuevoParo enviado | Payload: {Paro} | {DateTime.Now:yyyy-MM-dd HH:mm:ss}"
            );

            // Notificación (NO lógica de negocio)
            Clients.All.updateParos(Paro);
            Clients.All.newParo(Paro);
            Clients.All.closeParo(Paro);
        }

        #endregion
    }
}
