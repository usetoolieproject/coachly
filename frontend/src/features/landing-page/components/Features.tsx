import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import featureAnalytics from '/feature-analytics.jpg';
import featureClients from '/feature-clients.jpg';
import featureVideo from '/feature-video.jpg';
import featureSecurity from '/feature-security.jpg';
import featureCalendar from '/feature-calendar.jpg';
import featurePayments from '/feature-payments.jpg';

const features = [
  {
    title: "COURSES",
    description: "Create and deliver online courses with video lessons, assignments, and progress tracking for your students.",
    image: featureAnalytics,
    bgColor: "bg-purple-50",
    link: "#"
  },
  {
    title: "COMMUNITY",
    description: "Build an engaged community with forums, discussions, and member interactions to keep everyone connected.",
    image: featureClients,
    bgColor: "bg-yellow-50",
    link: "#"
  },
  {
    title: "RECORD LESSONS",
    description: "Record and upload video lessons with high-quality playback, transcripts, and interactive elements.",
    image: featureVideo,
    bgColor: "bg-cyan-50",
    link: "#"
  },
  {
    title: "VIDEO HOSTING",
    description: "Secure, fast video hosting with unlimited storage, customizable players, and seamless streaming.",
    image: featureSecurity,
    bgColor: "bg-blue-50",
    link: "#"
  },
  {
    title: "MEET",
    description: "Host live meetings and coaching sessions with HD video conferencing built directly into your platform.",
    image: featureVideo,
    bgColor: "bg-green-50",
    link: "#"
  },
  {
    title: "SALES PAGE & WEBSITE",
    description: "Create beautiful sales pages and professional websites with drag-and-drop tools—no coding required.",
    image: featurePayments,
    bgColor: "bg-pink-50",
    link: "#"
  },
  {
    title: "CONTENT SCHEDULING",
    description: "Automated booking system that syncs with your calendar and sends reminders to clients.",
    image: featureCalendar,
    bgColor: "bg-indigo-50",
    link: "#"
  },
  {
    title: "MEMBER MANAGEMENT",
    description: "Track progress, notes, and goals for each client in one organized dashboard.",
    image: featureClients,
    bgColor: "bg-orange-50",
    link: "#"
  }
];

const Features = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    skipSnaps: false,
    slidesToScroll: 1
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-white overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-gray-900">
            One Platform.
            <br />
            All The Features.
          </h2>
        </div>

        {/* Carousel Section */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex-[0_0_90%] sm:flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 px-3 sm:px-4 md:px-5"
                >
                  <div className={`${feature.bgColor} rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-100`}>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-3 sm:mb-4 tracking-tight text-gray-900">
                      {feature.title}
                    </h3>
                    <div className="aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 bg-white/80 shadow-md">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
            <button
              onClick={scrollPrev}
              className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-white border border-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all shadow-md flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={scrollNext}
              className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-white border border-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all shadow-md flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

