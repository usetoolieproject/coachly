import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion';

const faqs = [
  {
    question: "What happens after I pay?",
    answer: "After your one-time payment, you get immediate lifetime access to all features in your chosen plan. No recurring charges, no subscriptions to manage."
  },
  {
    question: "Can I upgrade from Basic to Pro later?",
    answer: "Yes! You can upgrade from Basic to Pro at any time by paying the difference. Contact support or manage your plan in settings."
  },
  {
    question: "Is my client data secure?",
    answer: "Yes, security is our top priority. We use bank-level encryption (256-bit SSL), are HIPAA compliant, and regularly undergo third-party security audits. Your data is stored in secure, redundant data centers."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with Coachly within the first 30 days of your purchase, we'll refund your payment in full—no questions asked."
  },
  {
    question: "What kind of support do you provide?",
    answer: "All plans include email support with response times under 24 hours. Pro plan customers get priority support with faster response times. We're here to help you succeed with your coaching business."
  }
];

const FAQ = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-white" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-gray-900">
            Frequently Asked{' '}
            <span className="text-purple-600">Questions</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
            Have questions? We've got answers. Can't find what you're looking for? Reach out to our support team.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-1 hover:border-purple-600 transition-colors shadow-sm"
            >
              <AccordionTrigger className="text-left font-bold text-sm sm:text-base md:text-lg text-gray-900 hover:text-purple-600">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-700 leading-relaxed pt-2 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;

