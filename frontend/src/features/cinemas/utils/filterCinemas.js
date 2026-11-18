/** Bỏ dấu tiếng Việt, chữ thường: "Quận Bình Thạnh" -> "quan binh thanh". */
const fold = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

/** Rạp trong thành phố có tên hoặc địa chỉ chứa từ khóa, không phân biệt dấu và hoa thường. */
export const filterCinemas = (cinemas, city, query) => {
  const keyword = fold(query.trim());
  return cinemas.filter((c) => c.city === city && fold(`${c.name} ${c.address}`).includes(keyword));
};
