package com.hoaxify.hoaxify.hoax;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.hoaxify.hoaxify.file.FileAttachementRepository;
import com.hoaxify.hoaxify.file.FileAttachment;
import com.hoaxify.hoaxify.user.User;
import com.hoaxify.hoaxify.user.UserService;

@Service
public class HoaxService {
	
	HoaxRepository hoaxRepository;
	UserService userService;
	FileAttachementRepository fileAttachementRepository;
	public HoaxService(HoaxRepository hoaxRepository, UserService userService, FileAttachementRepository fileAttachementRepository) {
		super();
		this.hoaxRepository = hoaxRepository;
		this.userService = userService;
		this.fileAttachementRepository = fileAttachementRepository;
	}

	public Hoax save(User user, Hoax hoax) {
		hoax.setTimesStamp(new Date());
		hoax.setUser(user);
		if(hoax.getAttachement() != null) {
			FileAttachment inDB = fileAttachementRepository.findById(hoax.getAttachement().getId()).get();
			inDB.setHoax(hoax);
			hoax.setAttachement(inDB);
		}
		return hoaxRepository.save(hoax);
	}

	public Hoax save(Hoax hoax, User user) {
		hoax.setTimesStamp(new Date());
		hoax.setUser(user);
		return hoaxRepository.save(hoax);
	}

	public Page<Hoax> getAllHoaxes(Pageable pageable) {
		return hoaxRepository.findAll(pageable);
	}

	public Page<Hoax> getHoaxOfUser(String username, Pageable pageable) {
		User inDB = userService.getByUsername(username);
		return hoaxRepository.findByUser(inDB, pageable);
		
	}

	public Page<Hoax> getOldHoaxes(long id, String username, Pageable pageable) {
		Specification<Hoax> spec = Specification.where(idLessThan(id));
		if(username != null) {
			  User inDB = userService.getByUsername(username);
		      spec= spec.and(userIs(inDB));
		}
		return hoaxRepository.findAll(spec, pageable);
	}

    /*public Page<Hoax> getOldHoaxesOfUser(long id, String username, Pageable pageable) {
		User user = userService.getByUsername(username);
		return hoaxRepository.findByIdLessThanAndUser(id, user, pageable);
	}*/

	public List<Hoax> getNewHoaxers(long id, String username, Pageable pageable) {
		Specification<Hoax> spec = Specification.where(idGreaterThan(id));
		if(username != null) {			
			User inDB = userService.getByUsername(username);
			spec = spec.and(userIs(inDB));
		}
		return hoaxRepository.findAll(spec, pageable.getSort());
	}

	/*public List<Hoax> getNewHoaxesOfUser(long id, String username, Pageable pageable) {
		User inDB = userService.getByUsername(username);
		return hoaxRepository.findByIdGreaterThanAndUser(id, inDB, pageable.getSort());
	}
    */
	public long getHoaxesCount(long id, String username) {
		Specification<Hoax> spec = Specification.where(idGreaterThan(id));
		if(username != null) {			
			User inDB = userService.getByUsername(username);
			spec = spec.and(userIs(inDB));
		}
		return hoaxRepository.count(spec);
	}
	
	private Specification<Hoax> userIs(User user){
		return (root, query, criteriaBuilder) -> {
			return criteriaBuilder.equal(root.get("user"), user);
		};
	}

	private Specification<Hoax> idLessThan(long id){
		return (root, query, criteriaBuilder) -> {
			return criteriaBuilder.lessThan(root.get("id"), id);
		};
	}
	private Specification<Hoax> idGreaterThan(long id){
		return (root, query, criteriaBuilder) -> {
			return criteriaBuilder.greaterThan(root.get("id"), id);
		};
	}

}
