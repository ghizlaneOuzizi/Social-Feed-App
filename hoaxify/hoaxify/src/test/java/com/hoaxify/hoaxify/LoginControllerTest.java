package com.hoaxify.hoaxify;


import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;

import com.hoaxify.hoaxify.error.ApiError;
import com.hoaxify.hoaxify.user.User;
import com.hoaxify.hoaxify.user.UserRepository;
import com.hoaxify.hoaxify.user.UserService;

@SpringBootTest(webEnvironment=WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class LoginControllerTest {
    
	private static final String API_1_0_LOGIN = "/api/1.0/login";
	
	@Autowired 
	TestRestTemplate testResTemplate;
	
	@Autowired 
	UserService userService;
	
	@Autowired 
	UserRepository userRepository;
	
	@BeforeEach
	public void cleaneup() {
		userRepository.deleteAll();
        testResTemplate.getRestTemplate().getInterceptors().clear();
	}
	
	@Test
	public void postLogin_WithoutUserCredentials_reveiveUnauthorized() {
		
		ResponseEntity<Object> response = login(Object.class);
		assertThat(response.getStatusCode(), equalTo(HttpStatus.UNAUTHORIZED));
	}
	
	@Test
	public void postLogin_WithIncorrectCredentials_reveiveUnauthorized() {
		authenticate();
		ResponseEntity<Object> response = login(Object.class);
		assertThat(response.getStatusCode(), equalTo(HttpStatus.UNAUTHORIZED));
	}
	
	@Test
	public void postLogin_WithIncorrectCredentials_reveiveApiError() {
		ResponseEntity<ApiError> response = login(ApiError.class);
		assertThat(response.getBody().getUrl(), equalTo(API_1_0_LOGIN));
	}
	
	@Test
	public void postLogin_WithoutUserCorrectCredentials_reveiveUnauthorizedWithoutwwwAuthenticcationHeader() {
		authenticate();
		ResponseEntity<Object> response = login(Object.class);
		assertThat(response.getHeaders()).doesNotContainKey("WWW-Authenticate");
	}
	@Test
	public void postLogin_WithoutUserCredentials_reveiveApiWithoutValidationError() {
		ResponseEntity<String> response = login(String.class);
		assertThat(response.getBody().toString()).doesNotContain("validationErrors");
	}
	
	@Test
	public void postLogin_withValidCredentials() {
		userService.save(UserUtil.createValidUser());
		authenticate();
		ResponseEntity<Object> response = login(Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
	}
	
	
	@Test
	public void postLogin_withValidCredentials_receiveLoggedInUserId() {
		User inDB = userService.save(UserUtil.createValidUser());
		authenticate();
		ResponseEntity<Map<String,Object>> response = login(new ParameterizedTypeReference<Map<String,Object>>(){});
		Map<String, Object> body = response.getBody();
		Integer id = (Integer) body.get("id");
		assertThat(id).isEqualTo(inDB.getId());
	}
	
	@Test
	public void postLogin_withValidCredentials_receiveLoggedInUserImage() {
		User inDB = userService.save(UserUtil.createValidUser());
		authenticate();
		ResponseEntity<Map<String,Object>> response = login(new ParameterizedTypeReference<Map<String,Object>>(){});
		Map<String, Object> body = response.getBody();
		String image = (String) body.get("image");
		assertThat(image).isEqualTo(inDB.getImage());
	}
	
	@Test
	public void postLogin_withValidCredentials_receiveLoggedInDisplayName() {
		User inDB = userService.save(UserUtil.createValidUser());
		authenticate();
		ResponseEntity<Map<String,Object>> response = login(new ParameterizedTypeReference<Map<String,Object>>(){});
		Map<String, Object> body = response.getBody();
		String displayName = (String) body.get("displayName");
		assertThat(displayName).isEqualTo(inDB.getDisplayName());
	}
	
	public void postLogin_withValidCredentials_receiveLoggedInUsername() {
		User inDB = userService.save(UserUtil.createValidUser());
		authenticate();
		ResponseEntity<Map<String,Object>> response = login(new ParameterizedTypeReference<Map<String,Object>>(){});
		Map<String, Object> body = response.getBody();
		String username = (String) body.get("username");
		assertThat(username).isEqualTo(inDB.getUsername());
	}
	
	public void postLogin_withValidCredentials_notReceiveLoggedInUsersPassword() {
		userService.save(UserUtil.createValidUser());
		authenticate();
		ResponseEntity<Map<String,Object>> response = login(new ParameterizedTypeReference<Map<String,Object>>(){});
		Map<String, Object> body = response.getBody();
		assertThat(body).doesNotContainKey("password");
	}
	private void authenticate() {
		testResTemplate.getRestTemplate().getInterceptors()
		.add(new BasicAuthenticationInterceptor("test-user", "P4ssword"));
	}
	
	public <T> ResponseEntity<T> login(Class<T> responseType){
		return testResTemplate.postForEntity(API_1_0_LOGIN, null, responseType);
	}
	
	public <T> ResponseEntity<T> login(ParameterizedTypeReference<T> responseType){
		return testResTemplate.exchange(API_1_0_LOGIN, HttpMethod.POST, null, responseType);
	}
}
