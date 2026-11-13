package com.cgdn.cinema.support;

import java.net.ServerSocket;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;
import org.apache.qpid.server.SystemLauncher;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Broker AMQP nhúng (Qpid Broker-J) cho test có profile "mq": client RabbitMQ của Spring kết nối như với
 * RabbitMQ thật, nên mvn test và CI không cần cài RabbitMQ. Chỉ một context bật profile này, để hàng đợi
 * có đúng một consumer. Qpid chỉ chạy trên JDK 22 trở xuống (JDK 23+ bỏ Subject.getSubject).
 */
@Configuration(proxyBeanMethods = false)
@Profile("mq")
public class EmbeddedRabbitConfig {

    // ponytail: một broker cho cả JVM test, khởi động lần đầu class được nạp và tắt khi JVM dừng
    private static final int PORT = startBroker();

    @Bean
    public CachingConnectionFactory rabbitConnectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory("localhost", PORT);
        factory.setUsername("guest");
        factory.setPassword("guest");
        return factory;
    }

    private static int startBroker() {
        try {
            int port;
            try (ServerSocket socket = new ServerSocket(0)) {
                port = socket.getLocalPort();
            }
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("type", "Memory");
            attributes.put("initialConfigurationLocation",
                    EmbeddedRabbitConfig.class.getResource("/qpid-config.json").toExternalForm());
            attributes.put("startupLoggedToSystemOut", false);
            attributes.put("context", Map.of(
                    "qpid.amqp_port", String.valueOf(port),
                    "qpid.work_dir", Files.createTempDirectory("qpid").toString()));
            SystemLauncher launcher = new SystemLauncher();
            launcher.startup(attributes);
            Runtime.getRuntime().addShutdownHook(new Thread(launcher::shutdown));
            return port;
        } catch (Exception e) {
            throw new IllegalStateException("Không khởi động được broker AMQP nhúng", e);
        }
    }
}
