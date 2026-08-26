import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Book } from '@/types';
import { fetchBooks } from '@/firebase/bookService';
import PreOrderBadge from '@/components/PreOrderBadge';

/** Publishing credits, front and centre. This is the first thing an agent,
 *  publisher or producer looks for, so it sits high on the page and leads
 *  with the credit rather than the price. */
const PublishedBooks: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks()
      .then(setBooks)
      .catch(err => console.error('Failed to load books:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || books.length === 0) return null;

  return (
    <section
      id="books"
      className="bg-gradient-to-b from-[#f8f1e7] via-[#f6f2e8] to-[#eef3ea] py-16"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d7d1c4] bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-[#6b5f4a] shadow-sm">
            Picture Books
          </span>
          <h2 className="mt-5 font-griffy text-4xl text-[#245b3f] md:text-5xl">
            Illustrated Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#3f4a45]">
            Watercolor illustration for children&rsquo;s picture books, from first
            character sketches through to finished spreads.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {books.map(book => (
            <article
              key={book.id}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-[#e3dccf] bg-white/85 shadow-[0_16px_40px_rgba(64,50,33,0.10)] backdrop-blur transition hover:shadow-[0_22px_55px_rgba(64,50,33,0.16)] sm:flex-row"
            >
              <button
                type="button"
                onClick={() => navigate(`/book/${book.id}`)}
                className="shrink-0 cursor-pointer bg-[#f4eadb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#245b3f] sm:w-2/5"
                aria-label={`View ${book.title}`}
              >
                <img
                  src={book.image_url}
                  alt={book.title}
                  className="h-56 w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03] sm:h-full"
                  loading="lazy"
                />
              </button>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {book.role && (
                    <span className="rounded-full bg-[#245b3f] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                      {book.role}
                    </span>
                  )}
                  {book.pre_order && <PreOrderBadge />}
                </div>

                <h3 className="font-griffy text-2xl leading-tight text-[#245b3f]">
                  {book.title}
                </h3>

                {(book.publisher || book.publication_year) && (
                  <p className="mt-1 text-sm text-[#6b5f4a]">
                    {[book.publisher, book.publication_year].filter(Boolean).join(' · ')}
                  </p>
                )}

                {book.description && (
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[#3f4a45]">
                    {book.description}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-4 pt-5">
                  <button
                    type="button"
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245b3f] hover:underline"
                  >
                    View the book
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {book.publisher_link && (
                    <a
                      href={book.publisher_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[#6b5f4a] hover:text-[#245b3f]"
                    >
                      Publisher
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PublishedBooks;
