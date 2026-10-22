import React from 'react';

export const ClientQuotes: React.FC = () => {
  const quotes = [
    {
      text: 'Poder desabafar, chorar e rir na minha língua materna, sem precisar traduzir sentimentos na cabeça, foi o maior alívio que senti desde que me mudei para o exterior.',
      author: 'Camila A.',
      location: 'Miami, FL',
    },
    {
      text: 'A cobrança profissional no exterior e a culpa por estar longe dos meus pais estavam me consumindo. A terapia com a Steffany me devolveu o equilíbrio e paz mental.',
      author: 'Rodrigo M.',
      location: 'Boston, MA',
    },
    {
      text: 'A abordagem prática da TCC me deu ferramentas reais para superar as crises de ansiedade e o isolamento que enfrentei na minha adaptação fora do Brasil.',
      author: 'Mariana D.',
      location: 'San Francisco, CA',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#f6f6f3] border-b border-[#e6e6e6]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 text-left">
          {quotes.map((q, idx) => (
            <figure
              key={idx}
              className="flex flex-col justify-between border-t border-[#e6e6e6] pt-8 space-y-6"
            >
              <blockquote className="font-serif text-2xl sm:text-[28px] leading-[1.25] font-normal tracking-[-0.03em] text-[#191c18]">
                “{q.text}”
              </blockquote>
              <figcaption className="text-xs tracking-wider uppercase text-stone-500 font-medium">
                {q.author} • <span className="text-stone-400">{q.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
