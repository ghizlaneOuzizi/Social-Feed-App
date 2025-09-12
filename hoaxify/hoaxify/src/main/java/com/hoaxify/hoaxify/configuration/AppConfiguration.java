package com.hoaxify.hoaxify.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "hoaxify")
@Data
public class AppConfiguration {

	String uploadPath;
	String profileImagesFolder = "profile";
	String attachementFolder = "attachements";
    
	public String getFullProfileImagesPath() {
		return this.uploadPath + "/" + this.profileImagesFolder;
	}

	public String getFullAttachementsPath() {
		return this.uploadPath + "/" + this.attachementFolder;
	}
}
