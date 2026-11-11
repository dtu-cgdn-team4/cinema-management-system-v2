package com.cgdn.cinema.modules.moviedetail.controller;

import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.modules.moviedetail.exception.MovieDetailNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.DateTimeException;

@RestControllerAdvice(assignableTypes = MovieDetailController.class)
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
                .anyMatch(result -> result.getMethodParameter().getParameterIndex() == 0));
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
