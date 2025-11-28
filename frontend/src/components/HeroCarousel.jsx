import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import img1 from "../assets/carousel/img1.jpeg";
import img2 from "../assets/carousel/img2.jpeg";
import img3 from "../assets/carousel/img3.jpeg";
import img4 from "../assets/carousel/img4.jpeg";
import img5 from "../assets/carousel/img5.jpeg";
import img6 from "../assets/carousel/img6.jpeg";

const images = [img1, img2, img3, img4, img5, img6];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full flex justify-center bg-white">
      {/* Container */}
      <div className="relative w-full mx-auto h-[60vh] md:h-[80vh] overflow-hidden">

        {/* Slides */}
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt=""
            className={`
              absolute inset-0 w-full h-full
              object-contain md:object-cover
              transition-opacity duration-700
              ${index === current ? "opacity-100" : "opacity-0"}
            `}
          />
        ))}

        {/* Prev Button */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2
            bg-white/80 hover:bg-white shadow-md
            w-10 h-10 md:w-14 md:h-14 rounded-full
            flex items-center justify-center transition"
        >
          <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 text-primary-700" />
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2
            bg-white/80 hover:bg-white shadow-md
            w-10 h-10 md:w-14 md:h-14 rounded-full
            flex items-center justify-center transition"
        >
          <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-primary-700" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full cursor-pointer 
                ${i === current ? "bg-white" : "bg-gray-400"}`}
            ></span>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HeroCarousel;
