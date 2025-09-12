package com.hoaxify.hoaxify.hoax;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hoaxify.hoaxify.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Entity
@Table(name="hoaxs")
public class Hoax {
	@Id
	@GeneratedValue
	private long id;
	
	@NotNull
	@Size(min=10, max = 5000)
	@Column(length=5000)
	private String content;
	 
	@Temporal(TemporalType.TIMESTAMP)
	private Date timesStamp;
	
	@ManyToOne
	@JsonIgnore
	private User user;

}
