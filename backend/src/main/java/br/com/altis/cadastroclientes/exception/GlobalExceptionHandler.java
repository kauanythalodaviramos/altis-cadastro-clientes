package br.com.altis.cadastroclientes.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> erros = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
            erros.put(normalizarCampo(fe.getField()), fe.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(montarResposta(HttpStatus.BAD_REQUEST, "Dados invalidos", erros));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DuplicateResourceException ex) {
        Map<String, String> erros = new LinkedHashMap<>();
        erros.put(ex.getField(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(montarResposta(HttpStatus.CONFLICT, ex.getMessage(), erros));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(montarResposta(HttpStatus.NOT_FOUND, ex.getMessage(), null));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(montarResposta(HttpStatus.UNAUTHORIZED, ex.getMessage(), null));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegal(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
            .body(montarResposta(HttpStatus.BAD_REQUEST, ex.getMessage(), null));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUpload(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
            .body(montarResposta(HttpStatus.PAYLOAD_TOO_LARGE, "Arquivo excede o tamanho maximo permitido (5MB)", null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenerica(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(montarResposta(HttpStatus.INTERNAL_SERVER_ERROR, "Erro inesperado: " + ex.getMessage(), null));
    }

    private Map<String, Object> montarResposta(HttpStatus status, String mensagem, Map<String, String> erros) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", mensagem);
        if (erros != null && !erros.isEmpty()) {
            body.put("errors", erros);
        }
        return body;
    }

    // "request.endereco.cep" -> "endereco.cep" (remove o prefixo do DTO root)
    private String normalizarCampo(String field) {
        return field;
    }
}
