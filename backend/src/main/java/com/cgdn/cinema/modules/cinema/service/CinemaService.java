package com.cgdn.cinema.modules.cinema.service;

import java.util.List;
import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.modules.cinema.dto.response.CinemaResponse;
import com.cgdn.cinema.modules.cinema.mapper.CinemaMapper;
import com.cgdn.cinema.modules.cinema.repository.CinemaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CinemaService {

    private final CinemaRepository cinemaRepository;

    /** Rạp đang hoạt động, xếp theo thành phố. */
    public List<CinemaResponse> getCinemas() {
        return cinemaRepository.findByStatusOrderByCityAscIdAsc(AppConstants.STATUS_ACTIVE).stream()
                .map(CinemaMapper::toResponse)
                .toList();
    }
}
