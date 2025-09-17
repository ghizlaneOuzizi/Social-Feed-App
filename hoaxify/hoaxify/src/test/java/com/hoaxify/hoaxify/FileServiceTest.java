package com.hoaxify.hoaxify;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Date;

import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;
import com.hoaxify.hoaxify.configuration.AppConfiguration;
import com.hoaxify.hoaxify.file.FileAttachementRepository;
import com.hoaxify.hoaxify.file.FileAttachment;
import com.hoaxify.hoaxify.file.FileService;

@ActiveProfiles("test")
@TestInstance(Lifecycle.PER_CLASS)
public class FileServiceTest {

	FileService fileService;
	
	AppConfiguration appConfiguration;
	
	@Mock
	FileAttachementRepository fileAttachmentRepository;
	
	@BeforeAll
	public void  init() {
		MockitoAnnotations.openMocks(this);
		appConfiguration = new AppConfiguration();
		appConfiguration.setUploadPath("uploads-test");
        
		fileService = new FileService(appConfiguration, fileAttachmentRepository);
		
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
	
	@Test
	public void cleanupStorage_whenOldFilesExist_remoevsFilesFromStorage() throws IOException {
		String fileName = "random-file";
		String filePath = appConfiguration.getFullAttachementsPath() + "/" + fileName;
		File source = new ClassPathResource("profile.png").getFile();
		File target = new File(filePath);
		FileUtils.copyFile(source, target);
		
		FileAttachment fileAttachment = new FileAttachment();
		fileAttachment.setId(5);
		fileAttachment.setName(fileName);
		
		Mockito.when(fileAttachmentRepository.findByDateBeforeAndHoaxIsNull(Mockito.any(Date.class)))
		.thenReturn(Arrays.asList(fileAttachment));
		
		fileService.cleanupStorage();
		File storedImage = new File(filePath);
		assertThat(storedImage.exists()).isFalse();
	}
	
	@AfterAll
	public void cleanup() throws IOException {
		FileUtils.cleanDirectory(new File(appConfiguration.getFullProfileImagesPath()));
		FileUtils.cleanDirectory(new File(appConfiguration.getFullAttachementsPath()));
	}
}
