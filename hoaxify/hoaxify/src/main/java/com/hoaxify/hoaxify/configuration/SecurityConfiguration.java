package com.hoaxify.hoaxify.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration{
	 
	 @Bean
	 SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
	 
	        http.authorizeHttpRequests((authentication) -> 
	            authentication
	            .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/1.0/login")).authenticated()
	            .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PUT, "/api/1.0/users/{id:[0-9]+}")).authenticated()
	            .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/1.0/hoaxes/**")).authenticated()
	            .anyRequest().permitAll()
	        );
	       // http.httpBasic(Customizer.withDefaults());
	        http.httpBasic(httpBasicConfigurer -> httpBasicConfigurer.authenticationEntryPoint(new BasicAuthenticationEntryPoint()));
	        http.csrf(csrf -> csrf.disable());
	        http.headers(headers -> headers.disable());
	        
	        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
	        
	        return http.build();
	    }
	 
	 @Bean
	 public PasswordEncoder passwordEncoder() {
		 return new BCryptPasswordEncoder();
	 }
	 
}
