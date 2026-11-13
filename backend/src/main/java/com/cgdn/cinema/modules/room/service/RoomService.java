package com.cgdn.cinema.modules.room.service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.modules.room.entity.Seat;
import com.cgdn.cinema.modules.room.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {

    private final SeatRepository seatRepository;

    /** Số ghế đang dùng của từng phòng. */
    public Map<Long, Integer> countSeatsByRoom(Collection<Long> roomIds) {
        if (roomIds.isEmpty()) {
            return Map.of();
        }
        return seatRepository.countByRoom(roomIds, AppConstants.STATUS_ACTIVE).stream()
                .collect(Collectors.toMap(r -> (Long) r[0], r -> ((Long) r[1]).intValue()));
    }

    /** Ghế đang dùng của một phòng, xếp theo hàng rồi theo cột. */
    public List<Seat> getSeats(Long roomId) {
        return seatRepository.findByRoomIdAndStatusOrderByRowNameAscGridColumnAsc(roomId, AppConstants.STATUS_ACTIVE);
    }
}
