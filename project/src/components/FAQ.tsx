import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems: FAQItem[] = [
    {
      question: 'What is a URL shortener?',
      answer: 'A URL shortener is a tool that converts long URLs into shorter, more manageable links that redirect to the original URL. This makes sharing links easier, especially on platforms with character limits like social media.'
    },
    {
      question: 'How do I shorten a URL for free?',
      answer: 'Simply paste your long URL in the input field at the top of this page, click "Shorten URL", and you\'ll instantly get a shortened link that you can copy and share.'
    },
    {
      question: 'How do I change a long URL to a short URL?',
      answer: 'Paste your long URL in the input field, click the "Shorten URL" button, and your shortened URL will be generated instantly. You can then copy and use it anywhere you need.'
    },
    {
      question: 'Which link shortener is best?',
      answer: 'The best link shortener depends on your specific needs. Our service offers a great balance of simplicity, reliability, and analytics features without requiring any sign-up or payment.'
    },
    {
      question: 'What are the benefits of a short URL?',
      answer: 'Short URLs are easier to share, look cleaner in messages and posts, save character space on platforms with limits, and can be easier to remember. Our service also provides analytics to track how many people click your links.'
    },
    {
      question: 'Do I have to create an account to use this service?',
      answer: 'No, our URL shortener is completely free to use without any registration required. Simply paste your URL and get a shortened link instantly.'
    },
    {
      question: 'How long do the shortened URLs remain active?',
      answer: 'Our shortened URLs remain active for 30 days by default. After this period, they may be removed from our system if they haven\'t been accessed.'
    },
    {
      question: 'Can I see how many people clicked my shortened link?',
      answer: 'Yes, our service provides analytics for each shortened URL. You can see the total clicks, clicks by day, referrer sources, and device types used to access your link.'
    }
  ];

  return (
    <section id="faq" className="py-16 bg-blue-500 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="max-w-2xl mx-auto text-blue-100">
            Find answers to common questions about our URL shortening service.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className="border-b border-blue-400 py-4 cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{item.question}</h3>
                  <svg 
                    className={`w-5 h-5 transition-transform ${openIndex === index ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {openIndex === index && (
                  <div className="mt-2 text-blue-100">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
