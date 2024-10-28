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

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                var pointData = JSON.parse(eventbody.body);
                var receivedPoint = new Point(pointData.x, pointData.y);
                addPointToCanvas(receivedPoint);
            });
        });
    };

    return {
        init: function () {
            connectAndSubscribe();
        },

        publishPoint: function (px, py) {
            var pt = new Point(px, py);
            console.info("Publishing point at " + pt.x + ", " + pt.y);
            addPointToCanvas(pt);
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
        }
    };
})();

// Espera a que la página cargue y configura el botón de publicación de puntos
window.onload = function () {
    app.init();
    document.querySelector("button").onclick = function () {
        var x = document.getElementById("x").value;
        var y = document.getElementById("y").value;
        if (x && y) {
            app.publishPoint(parseInt(x), parseInt(y));
        } else {
            alert("Por favor, ingrese valores válidos para X y Y.");
        }
    };
};
