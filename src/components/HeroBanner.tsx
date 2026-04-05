import React, { useState, useEffect, useCallback } from 'react'
import { heroBannerSlides, type HeroBannerSlide } from '../data/homePromoMedia'

function HeroSlideImage({
  slide,
  index,
  isCurrent
}: {
  slide: HeroBannerSlide
  index: number
  isCurrent: boolean
}) {
  const [src, setSrc] = useState(slide.image)

  useEffect(() => {
    setSrc(slide.image)
  }, [slide.image])

  return (
    <img
      src={src}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      loading={index === 0 ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={index === 0 && isCurrent ? 'high' : 'low'}
      onError={() => {
        if (slide.imageFallback && src !== slide.imageFallback) {
          setSrc(slide.imageFallback)
        }
      }}
    />
  )
}

const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const showSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroBannerSlides.length)
  }, [])

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroBannerSlides.length) % heroBannerSlides.length)
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000)
    return () => clearInterval(interval)
  }, [nextSlide])

  return (
    <section className="relative w-full h-[500px] overflow-hidden">
      <div className="relative w-full h-full">
        {heroBannerSlides.map((slide, index) => (
          <div
            key={`${slide.title}-${index}`}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <HeroSlideImage slide={slide} index={index} isCurrent={index === currentSlide} />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-20 px-4">
              <h2 className="text-5xl font-bold mb-4 tracking-wide">{slide.title}</h2>
              <p className="text-xl font-light">{slide.description}</p>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-40 text-white text-2xl font-bold rounded-full flex items-center justify-center transition-all duration-300"
          onClick={previousSlide}
          aria-label="이전 슬라이드"
        >
          ‹
        </button>
        <button
          type="button"
          className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-40 text-white text-2xl font-bold rounded-full flex items-center justify-center transition-all duration-300"
          onClick={nextSlide}
          aria-label="다음 슬라이드"
        >
          ›
        </button>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
          {heroBannerSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              onClick={() => showSlide(index)}
              aria-label={`슬라이드 ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
