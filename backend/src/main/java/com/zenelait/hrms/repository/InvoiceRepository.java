package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByOrganizationId(Long organizationId);
    Optional<Invoice> findByInvoiceCodeAndOrganizationId(String invoiceCode, Long organizationId);
}
