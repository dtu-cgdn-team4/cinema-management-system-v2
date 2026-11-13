package com.cgdn.cinema.modules.moviedetail.repository;

import java.math.BigDecimal;

public interface MovieDetailPriceProjection {
    Long getRoomId();

    String getSeatType();

    BigDecimal getAmount();
}
