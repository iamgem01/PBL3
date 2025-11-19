# Stage 1: Build the application (using a Maven/JDK image)
# Thay đổi tag ở đây
FROM maven:3.9-eclipse-temurin-21 AS builder 
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the final lightweight runtime image
FROM eclipse-temurin:21-jre-jammy AS runtime 
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_OPTS="-Xmx256m -Xms256m"

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 8761

CMD ["/bin/sh", "-c", "java $JAVA_OPTS -jar app.jar"]
