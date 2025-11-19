package com.aeternus.user_service.config;


// Process sign up by using Gooogle to create account and jwt
// Authorizate jwt from cookie when client send request

import com.aeternus.user_service.security.CustomOAuth2UserService;
import com.aeternus.user_service.security.JwtAuthenticationFilter;
import com.aeternus.user_service.security.OAuth2LoginSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService; // Save user and email to the database
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler; // Create jwt and save device to the database
    private final JwtAuthenticationFilter jwtAuthenticationFilter; // Read jwt from cookie

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(request -> 
                new org.springframework.web.cors.CorsConfiguration().applyPermitDefaultValues())) // Thêm CORS
            .csrf(csrf -> csrf.disable()) 
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/oauth2/**", "/login/oauth2/code/google").permitAll() 
                // starting to sign up
                // google call back
                //.requestMatchers("/api/auth/logout", "/api/users/me", "/api/users/devices").authenticated()
                .requestMatchers("/api/**", "/admin/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(auth -> auth.baseUri("/oauth2/authorization")) // Set the endpoint of api gateway that client call to signup
                .redirectionEndpoint(redirect -> redirect.baseUri("/login/oauth2/code/*")) // Set the endpoint of api gateway that google will call back
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))  // Save user and email to the database
                .successHandler(oAuth2LoginSuccessHandler) // Create jwt, save Device to the database, set cookie and redirect to Frontend
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}