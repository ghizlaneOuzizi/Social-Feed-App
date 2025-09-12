package com.hoaxify.hoaxify.user;



import java.beans.Transient;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonView;
import com.hoaxify.hoaxify.hoax.Hoax;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Entity
@Table(name="users")
public class User implements UserDetails{
	

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
    @NotNull(message = "{hoaxify.constraints.username.NotNull.message}")
    @Size(min=4, max=255)
    @UniqueUsername
	private String username;
	
    @NotNull
    @Size(min=4, max=255)
	private String displayName;
	
    @NotNull
    @Size(min=8, max=255)
    @Pattern(regexp="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", message = "{hoaxify.constraints.password.Pattern.message}")
	private String password;

    private String image; 
    
	@OneToMany(mappedBy = "user", fetch = FetchType.EAGER)
    private List<Hoax> hoaxes;
    
	@Override
	@Transient
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return AuthorityUtils.createAuthorityList("Role_USER");
	}

}
