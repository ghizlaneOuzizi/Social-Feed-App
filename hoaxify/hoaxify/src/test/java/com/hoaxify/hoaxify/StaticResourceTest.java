package com.hoaxify.hoaxify;

import java.io.File;
import java.io.IOException;


import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.hoaxify.hoaxify.configuration.AppConfiguration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment=WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class StaticResourceTest {
	
	@Autowired
	AppConfiguration appconfiguration;
	
	@Autowired
	MockMvc mockMvc;
	
	@Test
	public void checkStaticFolder_whenAppIsInitialized_uploadFolderMustExist() {
		File uploadFolder = new File(appconfiguration.getUploadPath());
	    boolean uploadFolderExist = uploadFolder.exists() && uploadFolder.isDirectory();
	    assertThat(uploadFolderExist).isTrue();
	}
	
	@Test
	public void checkStaticFolder_whenAppIsInitialized_profileImageFolderMustExist() {
		String profileImageFolderPath = appconfiguration.getFullProfileImagesPath();
		File profileImageFolder = new File(profileImageFolderPath);
	    boolean profileImageFolderExist = profileImageFolder.exists() && profileImageFolder.isDirectory();
	    assertThat(profileImageFolderExist).isTrue();
	}
	
	@Test
	public void checkStaticFolder_whenAppIsInitialized_attachementsSubFolderMustExist() {
		String attachementsFolderPath = appconfiguration.getFullAttachementsPath();
		File attachementsFolder = new File(attachementsFolderPath);
	    boolean attachementsFolderExist = attachementsFolder.exists() && attachementsFolder.isDirectory();
	    assertThat(attachementsFolderExist).isTrue();
	}
	
	@Test
	public void getStaticFile_whenImageExistInProfileUploadFolder_receiveOK() throws Exception {
		String fileName = "profile-picture.png";
		File source = new ClassPathResource("profile.png").getFile();
	    File target = new File(appconfiguration.getFullProfileImagesPath()+ '/'+ fileName);
	    FileUtils.copyFile(source, target);
	    mockMvc.perform(get("/images/"+appconfiguration.getProfileImagesFolder()+"/"+fileName)).andExpect(status().isOk());
	}
	
	@Test
	public void getStaticFile_whenImageExistInAttachementFolder_receiveOK() throws Exception {
		String fileName = "profile-picture.png";
		File source = new ClassPathResource("profile.png").getFile();
	   
		File target = new File(appconfiguration.getFullAttachementsPath()+ '/'+ fileName);
	    FileUtils.copyFile(source, target);
	    
	    MvcResult result = mockMvc.perform(get("/images/"+appconfiguration.getAttachementFolder()+"/"+fileName)).andReturn();
	    String cacheControl = result.getResponse().getHeaderValue("Cache-Control").toString();
	    assertThat(cacheControl).containsIgnoringCase("max-age=31536000");
	}
	
	@Test
	public void getStaticFile_whenImageExistInAttachementFolder_receiveOKWithCacheHeaders() throws Exception {
		String fileName = "profile-picture.png";
		File source = new ClassPathResource("profile.png").getFile();
	    File target = new File(appconfiguration.getFullAttachementsPath()+ '/'+ fileName);
	    FileUtils.copyFile(source, target);
	    mockMvc.perform(get("/images/"+appconfiguration.getAttachementFolder()+"/"+fileName)).andExpect(status().isOk());
	}
	@Test
	public void getStaticFile_whenImageDoesNotExist_receiveOK() throws Exception {
		mockMvc.perform(get("/images/"+appconfiguration.getAttachementFolder()+"/there-is-no-image.png"))
		.andExpect(status().isNotFound());
	}
	@AfterEach
	public void cleanup() throws IOException {
		FileUtils.cleanDirectory(new File(appconfiguration.getFullProfileImagesPath()));
		FileUtils.cleanDirectory(new File(appconfiguration.getFullAttachementsPath()
				));
		
	}
}
