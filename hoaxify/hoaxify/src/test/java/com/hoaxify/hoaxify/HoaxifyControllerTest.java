package com.hoaxify.hoaxify;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.web.multipart.MultipartFile;

import com.hoaxify.hoaxify.configuration.AppConfiguration;
import com.hoaxify.hoaxify.error.ApiError;
import com.hoaxify.hoaxify.file.FileAttachementRepository;
import com.hoaxify.hoaxify.file.FileAttachment;
import com.hoaxify.hoaxify.file.FileService;
import com.hoaxify.hoaxify.hoax.Hoax;
import com.hoaxify.hoaxify.hoax.HoaxRepository;
import com.hoaxify.hoaxify.hoax.HoaxService;
import com.hoaxify.hoaxify.shared.GenericResponse;
import com.hoaxify.hoaxify.user.User;
import com.hoaxify.hoaxify.user.UserRepository;
import com.hoaxify.hoaxify.user.UserService;
import com.hoaxify.hoaxify.user.vm.HoaxVM;

import jakarta.transaction.Transactional;

@SpringBootTest(webEnvironment=WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class HoaxifyControllerTest {
	private static final String API_1_0_HOAXES = "/api/1.0/hoaxes";

	@Autowired 
	TestRestTemplate testRestTemplate;
	
	@Autowired 
	UserRepository userRepository;
	
	@Autowired
	UserService userService;
	
	@Autowired
	HoaxRepository hoaxRepository;
	
	@Autowired
	HoaxService hoaxService;
	
	@Autowired
	FileAttachementRepository fileAttachmentRepository;
	
	@Autowired
	FileService fileService;
	
	@Autowired
	AppConfiguration appConfiguration;
	
	@BeforeEach
	public void cleanup() throws IOException {
		fileAttachmentRepository.deleteAll();
		hoaxRepository.deleteAll();
		userRepository.deleteAll();
		testRestTemplate.getRestTemplate().getInterceptors().clear();
		FileUtils.cleanDirectory(new File(appConfiguration.getFullAttachementsPath()));
	}
	
	@Test 
	public void postHoax_WhenHoaxIsValidAndUserIsAuthorized_receiveOK() {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = UserUtil.createValidHoax();
		ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode(), equalTo(HttpStatus.OK));
	}
	@Test 
	public void postHoax_WhenHoaxIsValidAndUserIsUnAuthorized_receiveUnauthorized() {
		Hoax hoax = UserUtil.createValidHoax();
		ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode(), equalTo(HttpStatus.UNAUTHORIZED));
	}
	
	@Test
	public void postHoax_whenHoaxIsValidAndUserIsValid_hoaxSavedToDatabase() {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = UserUtil.createValidHoax();
		postHoax(hoax, Object.class);
	    assertEquals(1L, hoaxRepository.count());
	}
	@Test
	public void postHoax_whenHoaxIsValidAndUserIsValid_hoaxSavedToDatabaseWithTimesStamp() {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = UserUtil.createValidHoax();
		postHoax(hoax, Object.class);
		Hoax inDB = hoaxRepository.findAll().get(0);
	    assertThat(inDB.getTimesStamp()).isNotNull();
	}
	@Test 
	public void postHoax_WhenHoaxContentIsNullAndUserIsAuthorized_receiveBadRequest() {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = new Hoax();
		ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode(), equalTo(HttpStatus.BAD_REQUEST));
	}
	@Test 
	public void postHoax_WhenHoaxContentIs5000CharactersAndUserIsAuthorized_receiveOK() {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = new Hoax();
		String veryLongString= IntStream.rangeClosed(1, 5000).mapToObj(x ->"a").collect(Collectors.joining());
		hoax.setContent(veryLongString);
		ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode(), equalTo(HttpStatus.OK));
	}
	@Test 
	public void postHoax_WhenHoaxContentIsMoreThan5000CharactersAndUserIsAuthorized_receiveBadRequest() {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = new Hoax();
		String veryLongString= IntStream.rangeClosed(1, 5001).mapToObj(x ->"a").collect(Collectors.joining());
		hoax.setContent(veryLongString);
		ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode(), equalTo(HttpStatus.BAD_REQUEST));
	}
	@Test 
	public void postHoax_WhenHoaxContentIsNullAndUserIsAuthorized_receiveApiErrorWithValidationError() {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = new Hoax();
		ResponseEntity<ApiError> response = postHoax(hoax, ApiError.class);
        Map<String,String> validationErrors = response.getBody().getValidationErrors();
		assertThat(validationErrors.get("content")).isNotNull();
	}
	@Test
	public void postHoax_whenHoaxIsValidAndUserIsValid_hoaxSavedWithAuthentictedUserInfo() {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = UserUtil.createValidHoax();
		postHoax(hoax, Object.class);
		Hoax inDB = hoaxRepository.findAll().get(0);
	    assertEquals(inDB.getUser().getUsername(), "user1");
	}
	@Test
	@Transactional
	public void postHoax_whenHoaxIsValidAndUserIsValid_hoaxBeAccedFromUserEntity() {
		userService.save(UserUtil.createValidUser("user1"));
		TestTransaction.flagForCommit();
		TestTransaction.end();
		authenticate("user1");
		Hoax hoax = UserUtil.createValidHoax();
		postHoax(hoax, Object.class);
		TestTransaction.start();
		User inDBUser = userRepository.findByUsername("user1");
	    assertEquals(inDBUser.getHoaxes().size(), 1);
	}
	@Test
	public void getHoaxs_whenThereAreNoHoaxes_receiveOK() {
		ResponseEntity<Object> response = testRestTemplate.getForEntity(API_1_0_HOAXES, Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);   
	}
	
	@Test
	public void postHoaxs_whenHoaxeIsValidAndUserIsAuthorized_receiveOK() {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = UserUtil.createValidHoax();
		ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
		assertThat(response.getBody().getUser().getUsername()).isEqualTo("user1");   
	}
	
	@Test
	public void getHoaxsOfUsers_whenUsersExists_receivePageWithZeroHoaxes() {
		userService.save(UserUtil.createValidUser("user1"));
		ResponseEntity<TestPage<Object>> response = getHoaxesOfUser("user1", new ParameterizedTypeReference<TestPage<Object>>() {} );
		assertThat(response.getBody().getTotalElements()).isEqualTo(0);   
	}
	
	@Test
	public void getOldHoaxes_whenThereAreNoHoaxes_receiveOK() {
		ResponseEntity<Object> response = getOldHoaxes(5, new ParameterizedTypeReference<Object>() {} );
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK); 
	}
	@Test
	 public void getOldHoaxes_whenThereAreHoaxes_receivePageWithItemsBeforeProvidedId() {
		User user = userService.save(UserUtil.createValidUser("user1"));
		hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		
		ResponseEntity<TestPage<Object>> response = getOldHoaxes(fourth.getId(), new ParameterizedTypeReference<TestPage<Object>>() {});
		assertThat(response.getBody().getTotalElements()).isEqualTo(3);
	}
	
	@Test
	public void getOldHoaxes_whenThereAreHoaxes_receivePageWithHoaxVMBeforeProvidedId() {
		User user = userService.save(UserUtil.createValidUser("user1"));
		hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		
		ResponseEntity<TestPage<HoaxVM>> response = getOldHoaxes(fourth.getId(), new ParameterizedTypeReference<TestPage<HoaxVM>>() {});
		assertThat(response.getBody().getContent().get(0).getDate()).isGreaterThan(0);
	}

	@Test
	public void getOldHoaxesOfUser_whenUserExistThereAreNoHoaxes_receiveOk() {
		userService.save(UserUtil.createValidUser("user1"));
		ResponseEntity<Object> response = getOldHoaxesOfUser(5, "user1", new ParameterizedTypeReference<Object>() {});
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
	}
   
	@Test
	public void getOldHoaxesOfUser_whenUserExistAndThereAreHoaxes_receivePageWithItemsBeforeProvidedId() {
		User user = userService.save(UserUtil.createValidUser("user1"));
		hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		
		ResponseEntity<TestPage<Object>> response = getOldHoaxesOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<TestPage<Object>>() {});
		assertThat(response.getBody().getTotalElements()).isEqualTo(3);
	}
	
    @Test
	public void getOldHoaxesOfUser_whenUserExistAndThereAreHoaxes_receivePageWithHoaxVMBeforeProvidedId() {
		User user = userService.save(UserUtil.createValidUser("user1"));
		hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		
		ResponseEntity<TestPage<HoaxVM>> response = getOldHoaxesOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<TestPage<HoaxVM>>() {});
		assertThat(response.getBody().getContent().get(0).getDate()).isGreaterThan(0);
	    }
	
    @Test
	public void getOldHoaxesOfUser_whenUserExistAndThereAreNoHoaxes_receivePageWithZeroItemsBeforeProvidedId() {
		User user = userService.save(UserUtil.createValidUser("user1"));
		hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		
		userService.save(UserUtil.createValidUser("user2"));
		
		ResponseEntity<TestPage<HoaxVM>> response = getOldHoaxesOfUser(fourth.getId(), "user2", new ParameterizedTypeReference<TestPage<HoaxVM>>() {});
		assertThat(response.getBody().getTotalElements()).isEqualTo(0);
	}

	@Test
	public void getNewHoaxCount_whenThereAreHoaxes_receiveCountAfterProvidedId() {
		User user = userService.save(UserUtil.createValidUser("user1"));
		hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		Hoax fourth = hoaxService.save(user, UserUtil.createValidHoax());
		hoaxService.save(user, UserUtil.createValidHoax());
		
		ResponseEntity<Map<String, Long>> response = getNewHoaxeCount(fourth.getId(), new ParameterizedTypeReference<Map<String, Long>>() {});
		assertThat(response.getBody().get("count")).isEqualTo(1);
	}
	
	@Test
	public void postHoax_whenHoaxHasFileAttachmentAndUserIsAuthorized_fileAttachmentHoaxRelationIsUpdatedInDatabase() throws IOException {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		
		MultipartFile file = createFile();
		
		FileAttachment savedFile = fileService.saveAttachement(file);
		
		Hoax hoax = UserUtil.createValidHoax();
		hoax.setAttachement(savedFile);
		ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
		
		FileAttachment inDB = fileAttachmentRepository.findAll().get(0);
		assertThat(inDB.getHoax().getId()).isEqualTo(response.getBody().getId());
	}
	
	@Test
	public void postHoax_whenHoaxHasFileAttachmentAndUserIsAuthorized_receiveHoaxVMWithAttachment() throws IOException {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		
		MultipartFile file = createFile();
		
		FileAttachment savedFile = fileService.saveAttachement(file);
		
		Hoax hoax = UserUtil.createValidHoax();
		hoax.setAttachement(savedFile);
		ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
		
		assertThat(response.getBody().getAttachement().getName()).isEqualTo(savedFile.getName());
	}
	
	@Test
	public void deleteHoax_whenUserIsUnAuthorized_receiveUnauthorized() {
		ResponseEntity<Object> response = deleteHoax(555, Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}
	
	@Test
	public void deleteHoax_whenUserIsAuthorized_receiveOk() {
		User user = userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = hoaxService.save(user, UserUtil.createValidHoax());

		ResponseEntity<Object> response = deleteHoax(hoax.getId(), Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		
	}
	
	@Test
	public void deleteHoax_whenUserIsAuthorized_receiveGenericResponse() {
		User user = userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = hoaxService.save(user, UserUtil.createValidHoax());

		ResponseEntity<GenericResponse> response = deleteHoax(hoax.getId(), GenericResponse.class);
		assertThat(response.getBody().getMessage()).isNotNull();
		
	}
	
	@Test
	public void deleteHoax_whenUserIsAuthorized_hoaxRemovedFromDatabase() {
		User user = userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		Hoax hoax = hoaxService.save(user, UserUtil.createValidHoax());

		deleteHoax(hoax.getId(), Object.class);
		Optional<Hoax> inDB = hoaxRepository.findById(hoax.getId());
		assertThat(inDB.isPresent()).isFalse();
		
	}
	
	@Test
	public void deleteHoax_whenHoaxIsOwnedByAnotherUser_receiveForbidden() {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		User hoaxOwner = userService.save(UserUtil.createValidUser("hoax-owner"));
		Hoax hoax = hoaxService.save(hoaxOwner, UserUtil.createValidHoax());

		ResponseEntity<Object> response = deleteHoax(hoax.getId(), Object.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
		
	}
	@Test
	public void deleteHoax_whenHoaxHasAttachment_attachmentRemovedFromDatabase() throws IOException {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		
		MultipartFile file = createFile();
		
		FileAttachment savedFile = fileService.saveAttachement(file);
		
		Hoax hoax = UserUtil.createValidHoax();
		hoax.setAttachement(savedFile);
		ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
		
		long hoaxId = response.getBody().getId();
		
		deleteHoax(hoaxId, Object.class);
		
		Optional<FileAttachment> optionalAttachment = fileAttachmentRepository.findById(savedFile.getId());
		
		assertThat(optionalAttachment.isPresent()).isFalse();
	}
	@Test
	public void deleteHoax_whenHoaxHasAttachment_attachmentRemovedFromStorage() throws IOException {
		userService.save(UserUtil.createValidUser("user1"));
		authenticate("user1");
		
		MultipartFile file = createFile();
		
		FileAttachment savedFile = fileService.saveAttachement(file);
		
		Hoax hoax = UserUtil.createValidHoax();
		hoax.setAttachement(savedFile);
		ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
		
		long hoaxId = response.getBody().getId();
		
		deleteHoax(hoaxId, Object.class);
		String attachmentFolderPath = appConfiguration.getFullAttachementsPath() + "/" + savedFile.getName();
		File storedImage = new File(attachmentFolderPath);
		assertThat(storedImage.exists()).isFalse();
	}

	private MultipartFile createFile() throws IOException {
		ClassPathResource imageResource = new ClassPathResource("profile.png");
		byte[] fileAsByte = FileUtils.readFileToByteArray(imageResource.getFile());
		
		MultipartFile file = new MockMultipartFile("profile.png", fileAsByte);
		return file;
	}
	public <T> ResponseEntity<T> deleteHoax(long hoaxId, Class<T> responseType){
		return testRestTemplate.exchange(API_1_0_HOAXES + "/" + hoaxId, HttpMethod.DELETE, null, responseType);
	}
	private <T> ResponseEntity<T> getNewHoaxeCount(long hoaxId,ParameterizedTypeReference<T> responseType) {
		String path = API_1_0_HOAXES + "/" + hoaxId + "?direction=after&count=true";
		return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
	}
	private <T> ResponseEntity<T> getOldHoaxes(long hoaxId,ParameterizedTypeReference<T> responseType) {
		String path = API_1_0_HOAXES + "/" + hoaxId + "?direction=before&page=0&size=5&sort=id,desc";
		return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
	}
	public <T> ResponseEntity<T> getOldHoaxesOfUser(long hoaxId, String username, ParameterizedTypeReference<T> responseType){
		String path = "/api/1.0/users/" + username + "/hoaxes/" + hoaxId +"?direction=before&page=0&size=5&sort=id,desc";
		return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
	}
	private <T> ResponseEntity<T> getHoaxesOfUser(String username,ParameterizedTypeReference<T> responseType) {
		String path = "/api/1.0/users/" + username + "/hoaxes";
		return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
	}
	private <T> ResponseEntity<T> postHoax(Hoax hoax, Class<T> responseType) {
		return testRestTemplate.postForEntity(API_1_0_HOAXES, hoax, responseType);
	}
	private void authenticate(String username) {
		testRestTemplate.getRestTemplate()
			.getInterceptors().add(new BasicAuthenticationInterceptor(username, "P4ssword"));
	}
	
	@AfterEach
	public void cleanupAfter() {
		hoaxRepository.deleteAll();
		fileAttachmentRepository.deleteAll();
	}
}
