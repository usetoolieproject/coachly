import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Life Coach",
    content: "Coachly transformed my business. I went from juggling 5 different tools to having everything in one place. My client retention has increased by 40%!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
  },
  {
    name: "Michael Chen",
    role: "Business Coach",
    content: "The automation features save me 10+ hours every week. I can now focus on coaching instead of administrative tasks. Absolutely worth it.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  },
  {
    name: "Emily Rodriguez",
    role: "Career Coach",
    content: "My clients love the seamless experience—from booking to payment to our video sessions. It makes me look incredibly professional.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
  }
];

const Testimonials = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-white" id="reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-gray-900">
            Loved by Coaches{' '}
            <span className="text-purple-600">Worldwide</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Join thousands of successful coaches who have transformed their business with Coachly.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex gap-1 mb-4 sm:mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-purple-600 text-purple-600" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base md:text-lg">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-3 sm:gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-purple-600/30"
                />
                <div>
                  <div className="font-bold text-sm sm:text-base text-gray-900">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

