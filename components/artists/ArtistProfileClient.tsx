'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { bgnToEur } from '@/lib/currency';
import ArtistProfileSidebar from './ArtistProfileSidebar';
import ArtistProfileMobileFilters from './ArtistProfileMobileFilters';
import "./styles/artist-profile.css";

interface Artist {
  id: string;
  bio: string | null;
  user: {
    name: string | null;
    image: string | null;
  };
  paintings: Painting[];
  tags: Tag[];
  faqs: ArtistFAQ[];
}

interface Painting {
  id: string;
  title: string;
  price: number;
  images: string[];
  technique: string | null;
  subject: string | null;
  style: string | null;
  tags: string[];
  widthCm: number;
  heightCm: number;
  isOnSale: boolean;
  salePercentage: number | null;
  finalPrice: number | null;
  originalPrice: number | null;
  createdAt: Date;
}

interface Tag {
  id: string;
  name: string;
}

interface ArtistFAQ {
  id: string;
  question: string;
  answer: string;
}

interface ArtistProfileClientProps {
  artist: Artist;
}

interface FilterOptions {
  technique: string[];
  subject: string[];
  style: string[];
  priceRange: [number, number];
  tags: string[];
  sortBy: string;
}

export default function ArtistProfileClient({ artist }: ArtistProfileClientProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    technique: [],
    subject: [],
    style: [],
    priceRange: [0, 10000],
    tags: [],
    sortBy: 'newest'
  });

  const [filteredPaintings, setFilteredPaintings] = useState<Painting[]>(artist.paintings);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get unique filter options from paintings
  const techniqueOptions = Array.from(new Set(artist.paintings.map(p => p.technique).filter(Boolean))) as string[];
  const subjectOptions = Array.from(new Set(artist.paintings.map(p => p.subject).filter(Boolean))) as string[];
  const styleOptions = Array.from(new Set(artist.paintings.map(p => p.style).filter(Boolean))) as string[];
  const allTags = Array.from(new Set(artist.paintings.flatMap(p => p.tags)));

  const sortOptions = [
    { value: 'newest', label: 'Най-нови' },
    { value: 'oldest', label: 'Най-стари' },
    { value: 'price-low', label: 'Цена: ниска → висока' },
    { value: 'price-high', label: 'Цена: висока → ниска' },
    { value: 'title', label: 'Заглавие A-Z' }
  ];

  // Apply filters
  useEffect(() => {
    let filtered = [...artist.paintings];

    // Apply technique filter
    if (filters.technique.length > 0) {
      filtered = filtered.filter(painting =>
        painting.technique && filters.technique.includes(painting.technique)
      );
    }

    // Apply subject filter
    if (filters.subject.length > 0) {
      filtered = filtered.filter(painting =>
        painting.subject && filters.subject.includes(painting.subject)
      );
    }

    // Apply style filter
    if (filters.style.length > 0) {
      filtered = filtered.filter(painting =>
        painting.style && filters.style.includes(painting.style)
      );
    }

    // Apply price range filter
    filtered = filtered.filter(painting => {
      const price = painting.isOnSale && painting.finalPrice ? painting.finalPrice : painting.price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(painting =>
        filters.tags.some(tag => painting.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = a.isOnSale && a.finalPrice ? a.finalPrice : a.price;
          const priceB = b.isOnSale && b.finalPrice ? b.finalPrice : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = a.isOnSale && a.finalPrice ? a.finalPrice : a.price;
          const priceB = b.isOnSale && b.finalPrice ? b.finalPrice : b.price;
          return priceB - priceA;
        });
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'bg'));
        break;
    }

    setFilteredPaintings(filtered);
  }, [filters, artist.paintings]);

  const handleFilterChange = (key: keyof FilterOptions, value: string | string[] | [number, number]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      technique: [],
      subject: [],
      style: [],
      priceRange: [0, 10000],
      tags: [],
      sortBy: 'newest'
    });
  };

  const getDisplayPrice = (painting: Painting) => {
    if (painting.isOnSale && painting.finalPrice) {
      return {
        price: painting.finalPrice,
        originalPrice: painting.originalPrice || painting.price,
        isOnSale: true,
        salePercentage: painting.salePercentage
      };
    }
    return {
      price: painting.price,
      originalPrice: null,
      isOnSale: false,
      salePercentage: null
    };
  };

  return (
    <div className="artist-profile-page">
      {/* Artist Header */}
      <div className="artist-header">
        <div className="artist-header-content">
          <div className="artist-avatar-container">
            <Image
              src={artist.user.image || "/placeholder-avatar.jpg"}
              alt={artist.user.name || "Профилна снимка"}
              fill
              style={{ objectFit: "cover" }}
              className="artist-avatar"
            />
          </div>
          <div className="artist-info">
            <h1 className="artist-name">{artist.user.name}</h1>
            {artist.bio && (
              <p className="artist-bio">{artist.bio}</p>
            )}
            {artist.tags.length > 0 && (
              <div className="artist-tags">
                {artist.tags.map((tag) => (
                  <span key={tag.id} className="artist-tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="mobile-filter-toggle">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="filter-toggle-btn"
          aria-label="Покажи филтри"
        >
          <span>Филтри</span>
          <svg className={`filter-icon ${showMobileFilters ? 'rotated' : ''}`} viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
      </div>

      <div className="artist-content">
        {/* Desktop Sidebar */}
        <ArtistProfileSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          techniqueOptions={techniqueOptions}
          subjectOptions={subjectOptions}
          styleOptions={styleOptions}
          allTags={allTags}
          sortOptions={sortOptions}
        />

        {/* Mobile Filters */}
        {showMobileFilters && (
          <ArtistProfileMobileFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            techniqueOptions={techniqueOptions}
            subjectOptions={subjectOptions}
            styleOptions={styleOptions}
            allTags={allTags}
            sortOptions={sortOptions}
            onClose={() => setShowMobileFilters(false)}
          />
        )}

        {/* Paintings Grid */}
        <div className="paintings-section">
          <div className="paintings-header">
            <h2 className="paintings-title">
              Галерия на {artist.user.name}
              <span className="paintings-count">({filteredPaintings.length})</span>
            </h2>
          </div>

          {filteredPaintings.length > 0 ? (
            <div className="paintings-grid">
              {filteredPaintings.map((painting) => {
                const priceInfo = getDisplayPrice(painting);
                return (
                  <div key={painting.id} className="painting-card">
                    <Link href={`/gallery/${painting.id}`} className="painting-link">
                      <div className="painting-image-container">
                        <Image
                          src={painting.images[0]}
                          alt={painting.title}
                          fill
                          style={{ objectFit: "cover" }}
                          className="painting-image"
                        />
                        {painting.images.length > 1 && (
                          <Image
                            src={painting.images[1]}
                            alt={painting.title}
                            fill
                            style={{ objectFit: "cover" }}
                            className="painting-image-hover"
                          />
                        )}
                        {priceInfo.isOnSale && (
                          <div className="sale-badge">
                            -{priceInfo.salePercentage}%
                          </div>
                        )}
                      </div>
                      <div className="painting-info">
                        <h3 className="painting-title">{painting.title}</h3>
                        <div className="painting-price">
                          {priceInfo.isOnSale ? (
                            <>
                              <span className="final-price">{priceInfo.price.toFixed(2)} лв.</span>
                              <span className="original-price">{priceInfo.originalPrice?.toFixed(2)} лв.</span>
                            </>
                          ) : (
                            <span className="price">{priceInfo.price.toFixed(2)} лв.</span>
                          )}
                          <span className="price-eur">{bgnToEur(priceInfo.price).toFixed(2)} €</span>
                        </div>
                        <div className="painting-details">
                          <span className="painting-dimensions">
                            {painting.widthCm} × {painting.heightCm} см
                          </span>
                          {painting.technique && (
                            <span className="painting-technique">{painting.technique}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-paintings">
              <p>Няма картини, отговарящи на избраните филтри.</p>
              <button onClick={clearFilters} className="clear-filters-btn">
                Изчисти филтрите
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FAQs Section */}
      {artist.faqs.length > 0 && (
        <div className="faqs-section">
          <h2 className="faqs-title">Често задавани въпроси</h2>
          <div className="faqs-list">
            {artist.faqs.map((faq) => (
              <div key={faq.id} className="faq-item">
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
