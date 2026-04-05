/**
 * 홈 히어로·위클리 포커스용 이미지.
 * thehyundai / lotteon 등은 Referer 제한으로 로컬·GitHub Pages 등에서 깨지는 경우가 많아 Unsplash로 통일.
 */
function unsplash(photoId: string, width = 1920) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=85`
}

export type HeroBannerSlide = {
  image: string
  /** 1차 URL 실패 시(404 등) 시도 */
  imageFallback?: string
  title: string
  description: string
}

export const heroBannerSlides: HeroBannerSlide[] = [
  {
    image: unsplash('photo-1469334031218-e382a71b716b'),
    title: 'PREMIUM COLLECTION',
    description: '프리미엄 컬렉션'
  },
  {
    image: unsplash('photo-1445205170230-053b83016050'),
    title: 'PREMIUM FALL 2025',
    description: '프리미엄 가을 컬렉션'
  },
  {
    // photo-1617137968427-85924c192a8f 는 Unsplash CDN 404
    image: unsplash('photo-1560250097-0b93528c311a'),
    imageFallback:
      'https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: "MEN'S LUXURY",
    description: '세련된 남성을 위한 럭셔리 컬렉션'
  },
  {
    image: unsplash('photo-1567401893414-76b7b1e5a7a5'),
    title: 'PREMIUM STORE',
    description: '프리미엄 쇼핑의 새로운 경험'
  },
  {
    image: unsplash('photo-1503919545889-aef636e10ad4'),
    title: 'KIDS COLLECTION',
    description: '사랑스러운 아이들을 위한 특별한 컬렉션'
  }
]

/** 상단 큰 영역(기존 외부 동영상 — 차단 대비 정적 이미지) */
export const weeklyFocusHeroImage = unsplash('photo-1558618666-fcd25c85cd64', 1600)

export const weeklyFocusSideImages = {
  beauty: unsplash('photo-1570172619644-dfd03ed5d881', 900),
  fashion: unsplash('photo-1490481651871-ab68de25d43d', 900)
} as const

export const brandAvenueImages = {
  sports: unsplash('photo-1542291026-7eec264c27ff', 1200),
  luxury: unsplash('photo-1539533018447-63fcce2678e3', 1200),
  perfume: unsplash('photo-1541643600914-78b084683601', 1200),
  fashion: unsplash('photo-1584917865442-de89df76afd3', 1200)
} as const
