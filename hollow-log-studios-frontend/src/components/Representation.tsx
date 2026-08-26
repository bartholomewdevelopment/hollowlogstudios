import React from 'react';
import { Mail, Instagram } from 'lucide-react';

const CONTACT_EMAIL = 'bethany@hollowlogstudios.com';

/** A direct route for literary agents and publishers. Deliberately separate
 *  from the commission form and the shop — the people this is aimed at are
 *  not buying a print. */
const Representation: React.FC = () => (
  <section id="representation" className="fairy-lattice-light bg-[#245b3f] py-16 text-white">
    <div className="container mx-auto max-w-4xl px-4 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-green-100">
        For Agents &amp; Publishers
      </span>

      <h2 className="mt-5 font-griffy text-4xl md:text-5xl">Seeking Representation</h2>

      <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-green-100">
        Bethany is a watercolor illustrator with two published picture books and two
        original worlds in development. She is looking for a literary agent to
        represent her children&rsquo;s book work &mdash; both illustration for other
        authors and her own author-illustrator projects.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=Representation%20enquiry`}
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#245b3f] shadow-lg transition hover:bg-green-50"
        >
          <Mail className="h-5 w-5" />
          {CONTACT_EMAIL}
        </a>
        <a
          href="https://instagram.com/hollowlogstudios"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-6 py-3 font-semibold text-white transition hover:border-white hover:bg-white/10"
        >
          <Instagram className="h-5 w-5" />
          @hollowlogstudios
        </a>
      </div>

      <p className="mt-6 text-sm text-green-200">
        Full portfolio, character work and sample spreads available on request.
      </p>
    </div>
  </section>
);

export default Representation;
