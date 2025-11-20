package com.aeternus.user_service.security;

// Create and Read jwt
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Set;
import java.util.UUID;

@Component
public class JwtTokenProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);
    private final SecretKey secretKey;
    private final long validityInMilliseconds; // Live time for session token

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret, 
            @Value("${app.jwt.expiration-ms}") long validityInMilliseconds) {
        // Create secret key from secret string >= 32 character
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.validityInMilliseconds = validityInMilliseconds;
    }

    public String createToken(UUID userId, Set<String> roles) {
    
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .subject(UUID.randomUUID().toString())         
                .claim("roles", roles)            
                .issuedAt(now)
                .expiration(validity)
                .signWith(secretKey)                 
                .compact();
            // return Jwts.builder()
            //         .setClaims(claims)
            //         .setId(UUID.randomUUID().toString())
            //         .setIssuedAt(now)
            //         .setExpiration(validity)
            //         .signWith(secretKey, SignatureAlgorithm.HS256)
            //         .compact();
    }



    // Get the content from the token
    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)               
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            logger.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public String getUserId(String token) {
        return getClaims(token).getSubject();
    }
}
