var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var currentSubscription = null; // Para almacenar la suscripción activa

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
                
                // Si hay una suscripción activa, se desuscribe antes de crear una nueva
                if (currentSubscription !== null) {
                    currentSubscription.unsubscribe();
                    console.info("Unsubscribed from previous topic.");
                }
                
                currentSubscription = stompClient.subscribe('/topic/newpoint.' + id, function (eventbody) {
                    var pointData = JSON.parse(eventbody.body);
                    var receivedPoint = new Point(pointData.x, pointData.y);
                    addPointToCanvas(receivedPoint);
                });

                console.info("Subscribed to /topic/newpoint." + id);
            });
        },

        publishPoint: function (px, py, id) {
            if (stompClient === null) {
                console.warn("STOMP client is not connected. Unable to publish point.");
                return; 
            }
            var pt = new Point(px, py);
            console.info("Publishing point at " + pt.x + ", " + pt.y);
            addPointToCanvas(pt);
            //stompClient.send("/topic/newpoint." + id, {}, JSON.stringify(pt)); //esto envia a topic/newpoint."algo" 
            stompClient.send("/app/newpoint." + id, {}, JSON.stringify(pt));

        },

        disconnect: function () {
            if (stompClient !== null) {
                if (currentSubscription !== null) {
                    currentSubscription.unsubscribe();
                    currentSubscription = null;
                }
                stompClient.disconnect();
                stompClient = null; 
            }
            console.log("Disconnected");
        }
    };
})();
