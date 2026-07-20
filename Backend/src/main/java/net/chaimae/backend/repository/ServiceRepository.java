package net.chaimae.backend.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

public interface ServiceRepository extends CrudRepository<Service, Long> {
}
