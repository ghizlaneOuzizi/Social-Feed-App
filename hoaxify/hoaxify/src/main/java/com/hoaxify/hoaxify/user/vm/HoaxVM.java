package com.hoaxify.hoaxify.user.vm;

import com.hoaxify.hoaxify.hoax.Hoax;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class HoaxVM {
	
	private long id;
	
	private String content;
	
	private long date;
	
	private UserVM user;
	
	public HoaxVM(Hoax hoax) {
		this.setId(hoax.getId());
		this.setContent(hoax.getContent());
		this.setDate(hoax.getTimesStamp().getTime());
		this.setUser(new UserVM(hoax.getUser()));
	}

}
