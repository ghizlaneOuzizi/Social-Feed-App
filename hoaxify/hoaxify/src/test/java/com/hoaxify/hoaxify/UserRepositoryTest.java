package com.hoaxify.hoaxify;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.hamcrest.MatcherAssert.assertThat;

import java.sql.SQLException;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import com.hoaxify.hoaxify.user.User;
import com.hoaxify.hoaxify.user.UserRepository;


@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class UserRepositoryTest {

	@Autowired
	TestEntityManager testEntityManager;
	
	@Autowired 
	UserRepository userRepository;
	
	@Autowired
    private DataSource dataSource;
	
	@Test
    void printDatabaseUrl() throws SQLException {
        System.out.println(">>> JDBC URL: " + dataSource.getConnection().getMetaData().getURL());
    }
	
	@Test
	public void findByUsername_whenUserExists_returnsUser() {
	
		testEntityManager.persist(UserUtil.createValidUser());
		
		User inDB = userRepository.findByUsername("test-user");
		assertThat(inDB,is(notNullValue()));
	}
	
	@Test
	public void findByUsername_whenUserDoesNotExists_returnsUser() {
		User inDB = userRepository.findByUsername("nonexistinguser");
		assertThat(inDB,is(nullValue()));
	}
}
