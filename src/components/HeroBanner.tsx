import React from 'react';
import { Sparkles, ShieldCheck, Truck, ArrowRight, MessageCircle } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  whatsappNumber: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick, whatsappNumber }) => {
  const cleanWa = whatsappNumber.replace(/\D/g, '');

  return (
    <section className="relative overflow-hidden bg-[#f4eee4] border-b border-[#e5ded4]">
      {/* Decorative subtle texture */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8decd] border border-[#d9cdb8] text-xs font-semibold tracking-wider uppercase text-[#735a2e]">
              <Sparkles className="w-3.5 h-3.5 text-[#b48a4d]" />
              Coleção Exclusiva & Alfaiataria Autoral
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1c1917] font-normal leading-[1.15] tracking-tight">
              A elegância que veste <br />
              <span className="italic font-light text-[#8e6e34]">a sua melhor versão.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5c544c] max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Descubra peças impecáveis para mulheres que valorizam corte sofisticado, tecidos nobres e exclusividade. Escolha seus looks, adicione à sacola e finalize rapidamente seu atendimento pelo WhatsApp com pagamento seguro via PIX.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                id="hero-explore-button"
                onClick={onExploreClick}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#1c1917] text-white hover:bg-[#322c29] text-xs font-semibold uppercase tracking-[0.15em] rounded-full transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                Ver Catálogo de Roupas
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('Olá Mariane! Gostaria de consultar os lançamentos da Mariane Moreira Concepts.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-white text-[#1c1917] hover:bg-[#faf7f2] border border-[#d5cbbe] text-xs font-semibold uppercase tracking-[0.15em] rounded-full transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                Atendimento VIP WhatsApp
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-[#e2d8ca] grid grid-cols-3 gap-3 text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2">
                <div className="p-2 rounded-full bg-[#eae1d3] text-[#735a2e]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1c1917]">Pagamento PIX</div>
                  <div className="text-[11px] text-[#786e64]">Chave imediata na sacola</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2">
                <div className="p-2 rounded-full bg-[#eae1d3] text-[#735a2e]">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1c1917]">Envio Brasil</div>
                  <div className="text-[11px] text-[#786e64]">Correios ou retirada local</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2">
                <div className="p-2 rounded-full bg-[#eae1d3] text-[#735a2e]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1c1917]">Acabamento Luxo</div>
                  <div className="text-[11px] text-[#786e64]">Linho, seda e alfaiataria</div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase (Featured Image Trio) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              
              {/* Main Card */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
                  alt="Mariane Moreira Concepts Editorial"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#e6c687] bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                    Nova Coleção
                  </span>
                  <p className="font-serif text-lg mt-1 font-medium">Linho Puro & Alfaiataria Feminina</p>
                  <p className="text-xs text-stone-200">Modelagens autênticas pensadas no caimento perfeito.</p>
                </div>
              </div>

              {/* Floating Accent Card */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white p-3.5 rounded-xl shadow-lg border border-[#e4dcd0] max-w-[200px] hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#f4eee4] flex items-center justify-center font-serif font-bold text-[#8e6e34]">
                    MM
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#1c1917]">Mariane Moreira</div>
                    <div className="text-[10px] text-[#786e64]">Atendimento Personalizado</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
