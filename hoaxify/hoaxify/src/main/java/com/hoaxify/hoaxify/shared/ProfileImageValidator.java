package com.hoaxify.hoaxify.shared;

import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;

import com.hoaxify.hoaxify.file.FileService;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ProfileImageValidator implements ConstraintValidator<ProfileImage, String>{

	@Autowired 
	FileService fileService;
	
	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {
		if(value == null) {
			return true;
		}
		byte[] decodedBytes = Base64.getDecoder().decode(value);
		String fileType = fileService.detectType(decodedBytes);
		if(fileType.equalsIgnoreCase("image/png") || fileType.equalsIgnoreCase("image/jpeg")) {
			return true;
		}
		
		return false;
	}

}
