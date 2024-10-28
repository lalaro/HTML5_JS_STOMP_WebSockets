package edu.eci.arsw.collabpaint;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class CollabPaintWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Configura el broker para los mensajes salientes con el prefijo "/topic"
        config.enableSimpleBroker("/topic");
        // Configura el prefijo para mensajes que llegan al servidor (controlador) con "/app"
        config.setApplicationDestinationPrefixes("/app");        
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Configura el endpoint de WebSocket con soporte para SockJS
        registry.addEndpoint("/stompendpoint").withSockJS();
    }
}
