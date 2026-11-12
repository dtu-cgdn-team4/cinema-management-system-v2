package com.cgdn.cinema.modules.booking.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import com.cgdn.cinema.modules.room.entity.Seat;
import org.junit.jupiter.api.Test;

/**
 * Quy tắc ghế trống lẻ, business-rules "Quy tắc chọn ghế" mục 4.
 * Một hàng 12 ghế, lối đi sau ghế 03 và 09: dãy 01–03, 04–09, 10–12. Id ghế = số ghế.
 */
class SeatRuleValidatorTest {

    private static final List<Seat> ROW = IntStream.rangeClosed(1, 12).mapToObj(SeatRuleValidatorTest::seat).toList();

    @Test
    void exampleFromBusinessRules() {
        // Dãy 04–09, ghế 04 và 09 đã có người
        Set<Long> occupied = Set.of(4L, 9L);
        assertThat(leavesGap(occupied, 5, 6)).as("05, 06: còn 07–08").isFalse();
        assertThat(leavesGap(occupied, 6, 7)).as("06, 07: 05 và 08 thành ghế lẻ").isTrue();
    }

    @Test
    void emptyBlockOfThreeDoesNotTakeAGroupOfTwo() {
        assertThat(leavesGap(Set.of(), 1, 2)).isTrue();
        assertThat(leavesGap(Set.of(), 2, 3)).isTrue();
        assertThat(leavesGap(Set.of(), 1, 3)).isTrue();
        assertThat(leavesGap(Set.of(), 1, 2, 3)).isFalse();
    }

    @Test
    void rowEndAndAisleAreBlockBoundaries() {
        assertThat(leavesGap(Set.of(), 5)).as("04 kẹt giữa lối đi và 05").isTrue();
        assertThat(leavesGap(Set.of(), 8)).as("09 kẹt giữa 08 và lối đi").isTrue();
        assertThat(leavesGap(Set.of(), 11)).as("12 kẹt giữa 11 và đầu hàng").isTrue();
        assertThat(leavesGap(Set.of(), 4, 5)).as("còn 06–09").isFalse();
        assertThat(leavesGap(Set.of(10L), 11, 12)).as("dãy 10–12 kín").isFalse();
    }

    @Test
    void existingSingleSeatDoesNotBlockAndCanBeChosen() {
        // 05 là ghế lẻ có sẵn giữa 04 và 06
        Set<Long> occupied = Set.of(4L, 6L);
        assertThat(leavesGap(occupied, 7, 8, 9)).as("chọn chỗ khác, 05 vẫn lẻ").isFalse();
        assertThat(leavesGap(occupied, 8, 9)).as("07 thành ghế lẻ mới").isTrue();
        assertThat(leavesGap(occupied, 5)).as("chọn chính ghế lẻ").isFalse();
    }

    @Test
    void gapsAreCheckedPerRow() {
        Seat otherRow = seat(2);
        otherRow.setId(102L);
        otherRow.setRowName("B");
        List<Seat> seats = List.of(seat(1), seat(2), seat(3), otherRow);
        // Hàng B chỉ có 1 ghế đang trống, không dính tới lựa chọn ở hàng A
        assertThat(SeatRuleValidator.leavesSingleGap(seats, Set.of(), Set.of(1L, 2L, 3L))).isFalse();
    }

    private static boolean leavesGap(Set<Long> occupied, int... selected) {
        Set<Long> chosen = IntStream.of(selected).mapToObj(Long::valueOf).collect(Collectors.toSet());
        return SeatRuleValidator.leavesSingleGap(ROW, occupied, chosen);
    }

    /** Cột lưới như sơ đồ thật: 01–03 → 1–3, 04–09 → 5–10, 10–12 → 12–14. */
    private static Seat seat(int number) {
        Seat seat = new Seat();
        seat.setId((long) number);
        seat.setRowName("A");
        seat.setNumber(number);
        seat.setGridColumn(number <= 3 ? number : number <= 9 ? number + 1 : number + 2);
        return seat;
    }
}
