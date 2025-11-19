

##--- Interpretaion ---##

# Multi-stage build: In stage 1, compiling the app and creating the jar file. So, only need a jre and jar file in the stage 2.
# COPY --from=builder... : Copying the jar file from stage 1 to the stage 2.
# RUN mkdir -p /etc ... : Creating a folder in container environment where contains private key, host key, passphrase,...
# chmod 700: Ensure that only the root user have the accessing permission.
# ENTRYPOINT ["java", "-jar", "app.jar"] : Commands will be running when container be initialized.
# Stage 1: Build the application (using Maven and JDK)
# Dùng image maven:3.9.6-openjdk-17 (hoặc tag tương ứng bạn đã tìm thấy)
FROM maven:3.9-eclipse-temurin-21 AS builder 
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests


# Stage 2: Create the final lightweight runtime image (using JRE/JDK)
# BẮT BUỘC phải có dòng FROM thứ hai này để bắt đầu một giai đoạn mới
FROM eclipse-temurin:21-jre-jammy AS runtime 
# Hoặc FROM eclipse-temurin:21-jdk-jammy AS runtime nếu bạn cần JDK ở runtime
WORKDIR /app
# Cú pháp ĐÚNG để sao chép từ giai đoạn 'builder'
COPY --from=builder /app/target/*.jar app.jar 

# Vẫn cần entrypoint.sh cho việc đọc Docker Secret

ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_TOOL_OPTIONS="-Xmx256m -Xms256m"

EXPOSE 8888

CMD ["/bin/sh", "-c", "java $JAVA_TOOL_OPTIONS -jar app.jar"]