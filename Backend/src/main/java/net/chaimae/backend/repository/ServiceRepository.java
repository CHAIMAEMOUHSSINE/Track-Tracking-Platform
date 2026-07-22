package net.chaimae.backend.repository;

import net.chaimae.backend.entity.Service;
import org.springframework.data.repository.CrudRepository;

public interface ServiceRepository extends CrudRepository<Service, Long> {
}
