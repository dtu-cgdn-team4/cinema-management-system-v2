package com.cgdn.cinema.modules.moviedetail.controller;

import com.cgdn.cinema.modules.moviedetail.entity.MovieDetailEntity;
import com.cgdn.cinema.modules.moviedetail.mapper.MovieDetailMapper;
import com.cgdn.cinema.modules.moviedetail.service.MovieDetailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MovieDetailController.class)
@WithMockUser
class MovieDetailControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MovieDetailService service;

    @Test
    void serializesNullFieldsAndEmptyListsWithoutInventingValues() throws Exception {
        // Required database columns cannot be NULL; exercise defensive serialization at the HTTP layer.
        MovieDetailEntity movie = new MovieDetailEntity();
        movie.setId(7L);
        movie.setGenres(null);
        when(service.getMovieDetail(7L)).thenReturn(new MovieDetailMapper().toResponse(movie, null,
                LocalDate.of(2026, 11, 11)));

        mockMvc.perform(get("/api/v1/movies/7"))
                .andExpect(status().isOk())
                .andExpect(content().json("""
                        {
                          "code": 200,
                          "message": "Thành công",
                          "data": {
                            "id": 7,
                            "title": null,
                            "posterUrl": null,
                            "originalTitle": null,
                            "backdropUrl": null,
                            "subtitle": null,
                            "galleryImages": [],
                            "director": null,
                            "actors": [],
                            "genres": [],
                            "duration": null,
                            "releaseDate": null,
                            "endDate": null,
                            "productionCompany": null,
                            "screeningStatus": null,
                            "format": "2D",
                            "ageRating": null,
                            "description": null,
                            "trailerUrl": null,
                            "status": null,
                            "showtimes": []
                          }
                        }
                        """, true));
    }
}
