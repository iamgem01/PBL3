package com.aeternus.user_service.config;

import com.aeternus.user_service.security.CustomOAuth2UserService;
import com.aeternus.user_service.security.JwtAuthenticationFilter;
import com.aeternus.user_service.security.OAuth2LoginSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService; // Service OIDC tùy chỉnh
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ClientRegistrationRepository clientRegistrationRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(request -> 
                new org.springframework.web.cors.CorsConfiguration().applyPermitDefaultValues()))
            .csrf(csrf -> csrf.disable()) 
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/oauth2/**", "/login/oauth2/code/google").permitAll() 
                .requestMatchers("/api/**", "/admin/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                // 1. Cấu hình Endpoint bắt đầu (kèm Resolver để luôn hiện bảng chọn tài khoản)
                .authorizationEndpoint(auth -> auth
                    .baseUri("/oauth2/authorization")
                    .authorizationRequestResolver(authorizationRequestResolver(this.clientRegistrationRepository))
                ) 
                // 2. Cấu hình Endpoint Callback
                .redirectionEndpoint(redirect -> redirect.baseUri("/login/oauth2/code/*")) 
                
                // 3. Cấu hình UserInfo Endpoint (QUAN TRỌNG: Dùng oidcUserService)
                .userInfoEndpoint(userInfo -> userInfo
                    .oidcUserService(customOAuth2UserService) // Sử dụng Custom OIDC Service của chúng ta
                )
                
                // 4. Handler xử lý sau khi thành công
                .successHandler(oAuth2LoginSuccessHandler)
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Tùy chỉnh Request gửi sang Google để thêm "prompt=select_account"
     */
    private OAuth2AuthorizationRequestResolver authorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository) {

        DefaultOAuth2AuthorizationRequestResolver authorizationRequestResolver =
                new DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrationRepository, "/oauth2/authorization");

        // Sử dụng lambda để sửa đổi request, thêm tham số prompt
        authorizationRequestResolver.setAuthorizationRequestCustomizer(authorizationRequestBuilder -> {
            authorizationRequestBuilder.additionalParameters(params -> {
                params.put("prompt", "select_account");
            });
        });

        return authorizationRequestResolver;
    }
}