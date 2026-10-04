package com.hostel.audit;

import com.hostel.entity.User;
import com.hostel.repository.UserRepository;
import com.hostel.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    @AfterReturning(pointcut = "@annotation(com.hostel.audit.Auditable)", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Auditable auditable = method.getAnnotation(Auditable.class);

        Long userId = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String email = ((UserDetails) authentication.getPrincipal()).getUsername();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                userId = user.getId();
            }
        }

        String ipAddress = null;
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            ipAddress = request.getRemoteAddr();
        }

        Long entityId = null; // Extract from result if it's an entity/DTO with an ID
        try {
            if (result != null) {
                Method getIdMethod = result.getClass().getMethod("getId");
                entityId = (Long) getIdMethod.invoke(result);
            }
        } catch (Exception e) {
            // Ignore if no getId method
        }

        auditLogService.log(
                userId,
                auditable.action(),
                auditable.entityType(),
                entityId,
                null, // Getting oldValue/newValue requires more complex generic inspection, skipping for brevity
                result != null ? result.toString() : null,
                ipAddress
        );
    }
}
