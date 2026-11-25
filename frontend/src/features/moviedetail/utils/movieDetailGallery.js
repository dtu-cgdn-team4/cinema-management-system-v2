export function getGalleryImages(movie) {
  const rawGallery = movie.galleryImages?.length > 0
    ? movie.galleryImages
    : [movie.backdropUrl, movie.posterUrl].filter(Boolean);
  const uniqueImages = [...new Map(rawGallery.map(u => [u, u])).values()];

  return uniqueImages.length >= 2
    ? uniqueImages.slice(0, 2)
    : uniqueImages.length === 1
      ? [uniqueImages[0], uniqueImages[0]]
      : [];
}
