package com.cgdn.cinema.modules.booking.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.IntPredicate;
import java.util.stream.Collectors;
import com.cgdn.cinema.modules.room.entity.Seat;

/**
 * Quy tắc ghế trống lẻ (business-rules "Quy tắc chọn ghế" mục 4, Q&A #8):
 * - Lựa chọn không hợp lệ khi tạo ra một đoạn trống dài đúng 1 ghế nằm sát ghế khách vừa chọn.
 * - Đầu hàng và lối đi là biên của dãy; lối đi là chỗ cột lưới (vi_tri_cot) bị ngắt quãng.
 * - Ghế lẻ có sẵn từ trước không chặn khách, và khách được chọn chính ghế lẻ đó.
 * - Loại ghế (thường, VIP) không ảnh hưởng.
 */
public final class SeatRuleValidator {

    private SeatRuleValidator() {
    }

    /**
     * @param occupied ghế đang giữ hoặc đã thanh toán
     * @param selected ghế khách đang chọn
     */
    public static boolean leavesSingleGap(Collection<Seat> roomSeats, Set<Long> occupied, Set<Long> selected) {
        Map<String, List<Seat>> rows = roomSeats.stream()
                .sorted(Comparator.comparing(Seat::getGridColumn))
                .collect(Collectors.groupingBy(Seat::getRowName, LinkedHashMap::new, Collectors.toList()));
        for (List<Seat> row : rows.values()) {
            for (List<Seat> block : splitAtAisles(row)) {
                if (hasGapNextToSelection(block, occupied, selected)) {
                    return true;
                }
            }
        }
        return false;
    }

    /** Tách một hàng (đã xếp theo cột) thành các dãy ghế liền nhau. */
    private static List<List<Seat>> splitAtAisles(List<Seat> row) {
        List<List<Seat>> blocks = new ArrayList<>();
        List<Seat> block = new ArrayList<>();
        for (Seat seat : row) {
            if (!block.isEmpty() && seat.getGridColumn() - block.get(block.size() - 1).getGridColumn() > 1) {
                blocks.add(block);
                block = new ArrayList<>();
            }
            block.add(seat);
        }
        blocks.add(block);
        return blocks;
    }

    private static boolean hasGapNextToSelection(List<Seat> block, Set<Long> occupied, Set<Long> selected) {
        // Ngoài dãy coi như đã có người: biên dãy chặn hai đầu đoạn trống.
        IntPredicate filled = i -> i < 0 || i >= block.size()
                || occupied.contains(block.get(i).getId()) || selected.contains(block.get(i).getId());
        IntPredicate chosen = i -> i >= 0 && i < block.size() && selected.contains(block.get(i).getId());
        for (int i = 0; i < block.size(); i++) {
            boolean singleGap = !filled.test(i) && filled.test(i - 1) && filled.test(i + 1);
            if (singleGap && (chosen.test(i - 1) || chosen.test(i + 1))) {
                return true;
            }
        }
        return false;
    }
}
