package com.hoaxify.hoaxify;

//import java.util.function.IntFunction;
//import java.util.stream.IntStream;
//import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Profile;
//import com.hoaxify.hoaxify.user.User;
//import com.hoaxify.hoaxify.user.UserService;
//import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HoaxifyApplication {

	public static void main(String[] args) {
		SpringApplication.run(HoaxifyApplication.class, args);
	}
	
	//@Bean
	//@Profile("!test")
	//CommandLineRunner run(UserService userService) {
		//return (args) -> {
			//IntStream.rangeClosed(1, 15)
		    //.mapToObj((IntFunction<User>) i -> {
		      //  User user = new User();
		       // user.setUsername("user" + i);
		       // user.setDisplayName("display" + i);
		       // user.setPassword("P4ssword");
		       // return user;
		     //})
		     //.forEach(userService::save);
			
		//};
	//}

}
