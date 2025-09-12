package com.hoaxify.hoaxify;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;
import com.hoaxify.hoaxify.configuration.AppConfiguration;
import com.hoaxify.hoaxify.file.FileService;

@ActiveProfiles("test")
@TestInstance(Lifecycle.PER_CLASS)
public class FileServiceTest {

	FileService fileService;
	
	AppConfiguration appConfiguration;
	
	@BeforeAll
	public void  init() {
		appConfiguration = new AppConfiguration();
		appConfiguration.setUploadPath("uploads-test");
        
		fileService = new FileService(appConfiguration);
		
		new File(appConfiguration.getUploadPath()).mkdir();
		new File(appConfiguration.getFullProfileImagesPath()).mkdir();
		new File(appConfiguration.getFullAttachementsPath()).mkdir();
	}
	
	@Test
	public void detectType_whenPngFileProvided_returnsImagePng() throws IOException {
		ClassPathResource resourceFile = new ClassPathResource("test-png.png");
		byte[] fileArr = FileUtils.readFileToByteArray(resourceFile.getFile());
		String fileType = fileService.detectType(fileArr);
		assertThat(fileType).isEqualToIgnoringCase("image/png");
	}
	
	@AfterAll
	public void cleanup() throws IOException {
		FileUtils.cleanDirectory(new File(appConfiguration.getFullProfileImagesPath()));
		FileUtils.cleanDirectory(new File(appConfiguration.getFullAttachementsPath()));
	}
}
