var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.stroke();
    };

    return {
        connect: function (id) {
            console.info('Connecting to WS...');
            var socket = new SockJS('/stompendpoint');
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                // Suscribirse a un tópico dinámico basado en el ID ingresado
                stompClient.subscribe('/topic/newpoint.' + id, function (eventbody) {
                    var pointData = JSON.parse(eventbody.body);
                    var receivedPoint = new Point(pointData.x, pointData.y);
                    addPointToCanvas(receivedPoint);
                });
            });
        },

        publishPoint: function (px, py, id) {
            if (stompClient === null) {
                console.warn("STOMP client is not connected. Unable to publish point.");
                return; // Salir si no está conectado
            }
            var pt = new Point(px, py);
            console.info("Publishing point at " + pt.x + ", " + pt.y);
            addPointToCanvas(pt);
            stompClient.send("/topic/newpoint." + id, {}, JSON.stringify(pt)); // Cambié a pt.y para usar el ID
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
                stompClient = null; // Limpiar la referencia después de desconectar
            }
            console.log("Disconnected");
        }
    };
})();