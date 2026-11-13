package com.cgdn.cinema.modules.moviedetail.exception;

import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.modules.moviedetail.controller.MovieDetailController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.DateTimeException;

@RestControllerAdvice(assignableTypes = MovieDetailController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MovieDetailExceptionHandler {

    @ExceptionHandler(MovieDetailNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(MovieDetailNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(404, exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
        return invalidParameter("movieId".equals(exception.getName()));
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(HandlerMethodValidationException exception) {
        return invalidParameter(exception.getAllValidationResults().stream()
                .anyMatch(result -> {
                    PathVariable pathVariable = result.getMethodParameter().getParameterAnnotation(PathVariable.class);
                    return pathVariable != null && ("movieId".equals(pathVariable.value())
                            || "movieId".equals(pathVariable.name()));
                }));
    }

    @ExceptionHandler(DateTimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidDate() {
        return invalidParameter(false);
    }

    private ResponseEntity<ApiResponse<Void>> invalidParameter(boolean invalidMovieId) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, invalidMovieId
                        ? "ID phim phải là số nguyên dương hợp lệ." : "Tham số yêu cầu không hợp lệ."));
    }
}
