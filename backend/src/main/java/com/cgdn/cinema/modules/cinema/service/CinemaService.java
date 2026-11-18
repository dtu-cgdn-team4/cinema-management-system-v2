package com.cgdn.cinema.modules.cinema.service;

import java.util.List;
import java.util.Map;
import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.modules.cinema.dto.response.CinemaResponse;
import com.cgdn.cinema.modules.cinema.mapper.CinemaMapper;
import com.cgdn.cinema.modules.cinema.repository.CinemaRepository;
import com.cgdn.cinema.modules.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CinemaService {

    private final CinemaRepository cinemaRepository;
    private final RoomService roomService;

    /** Rạp đang hoạt động kèm số phòng chiếu, xếp theo thành phố (màn chọn rạp). */
    public List<CinemaResponse> getCinemas() {
        Map<Long, Integer> roomCounts = roomService.countRoomsByCinema();
        return cinemaRepository.findByStatusOrderByCityAscIdAsc(AppConstants.STATUS_ACTIVE).stream()
                .map(c -> CinemaMapper.toResponse(c, roomCounts.getOrDefault(c.getId(), 0)))
                .toList();
    }
}
