package com.hoaxify.hoaxify.file;

import java.util.Date;

import com.hoaxify.hoaxify.hoax.Hoax;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Data
@Entity
public class FileAttachment {
	
	@Id
	@GeneratedValue
    private long id;
	
	@Temporal(TemporalType.TIMESTAMP)
	private Date date;
	
	private String name;
	
	private String fileType;
	
	@OneToOne
	private Hoax hoax;
}
