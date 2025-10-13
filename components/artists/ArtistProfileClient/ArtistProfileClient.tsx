'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ArtistProfileArtworkCard from './ArtistProfileArtworkCard';
import ArtistProfileSidebar from './ArtistProfileSidebar';
import ArtistProfileMobileFilters from './ArtistProfileMobileFilters';
import { type ViewMode } from '@/components/ui/ViewModeControls';
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
  urlTitle?: string;
  isSold: boolean;
  artist?: {
    id: string;
    user: {
      name: string | null;
    };
  };
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
  widthRange: [number, number];
  heightRange: [number, number];
  tags: string[];
  sortBy: string;
  availability: string;
}

export default function ArtistProfileClient({ artist }: ArtistProfileClientProps) {
  // Calculate max values from actual paintings
  const maxPrice = Math.max(...artist.paintings.map(p => p.isOnSale && p.finalPrice ? p.finalPrice : p.price));
  const maxWidth = Math.max(...artist.paintings.map(p => p.widthCm || 0));
  const maxHeight = Math.max(...artist.paintings.map(p => p.heightCm || 0));

  const [filters, setFilters] = useState<FilterOptions>({
    technique: [],
    subject: [],
    style: [],
    priceRange: [0, maxPrice],
    widthRange: [0, maxWidth],
    heightRange: [0, maxHeight],
    tags: [],
    sortBy: 'newest',
    availability: ''
  });

  const [filteredPaintings, setFilteredPaintings] = useState<Painting[]>(artist.paintings);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Get unique filter options with counts from paintings
  const techniqueCountMap = new Map<string, number>();
  const subjectCountMap = new Map<string, number>();
  const styleCountMap = new Map<string, number>();
  const tagCountMap = new Map<string, number>();

  artist.paintings.forEach(painting => {
    // Count techniques
    if (painting.technique) {
      techniqueCountMap.set(painting.technique, (techniqueCountMap.get(painting.technique) || 0) + 1);
    }

    // Count subjects
    if (painting.subject) {
      subjectCountMap.set(painting.subject, (subjectCountMap.get(painting.subject) || 0) + 1);
    }

    // Count styles
    if (painting.style) {
      styleCountMap.set(painting.style, (styleCountMap.get(painting.style) || 0) + 1);
    }

    // Count tags
    painting.tags.forEach(tag => {
      if (tag && tag.trim().length > 0) {
        tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
      }
    });
  });

  const techniqueOptions = Array.from(techniqueCountMap.entries()).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const subjectOptions = Array.from(subjectCountMap.entries()).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const styleOptions = Array.from(styleCountMap.entries()).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const allTags = Array.from(tagCountMap.entries()).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

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

    // Apply price range filter - apply only if different from default [0, maxPrice]
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) {
      filtered = filtered.filter(painting => {
        const price = painting.isOnSale && painting.finalPrice ? painting.finalPrice : painting.price;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    // Apply width range filter - apply only if different from default [0, maxWidth]
    if (filters.widthRange[0] > 0 || filters.widthRange[1] < maxWidth) {
      filtered = filtered.filter(painting => {
        const width = painting.widthCm || 0;
        return width >= filters.widthRange[0] && width <= filters.widthRange[1];
      });
    }

    // Apply height range filter - apply only if different from default [0, maxHeight]
    if (filters.heightRange[0] > 0 || filters.heightRange[1] < maxHeight) {
      filtered = filtered.filter(painting => {
        const height = painting.heightCm || 0;
        return height >= filters.heightRange[0] && height <= filters.heightRange[1];
      });
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(painting =>
        filters.tags.some(tag => painting.tags.includes(tag))
      );
    }

    // Apply availability filter
    if (filters.availability) {
      const now = new Date();
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      switch (filters.availability) {
        case 'new':
          filtered = filtered.filter(painting => {
            const createdAt = new Date(painting.createdAt);
            return createdAt >= fourteenDaysAgo;
          });
          break;
        case 'promotion':
          filtered = filtered.filter(painting => painting.isOnSale);
          break;
        case 'sold':
          filtered = filtered.filter(painting => painting.isSold);
          break;
      }
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
  }, [filters, artist.paintings, maxPrice, maxWidth, maxHeight]);

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
      priceRange: [0, maxPrice],
      widthRange: [0, maxWidth],
      heightRange: [0, maxHeight],
      tags: [],
      sortBy: 'newest',
      availability: ''
    });
  };

  // Convert Painting to PaintingWithArtist format for ArtworkCard
  const convertToArtworkCardFormat = (painting: Painting) => {
    return {
      ...painting,
      description: null,
      dimensions: null,
      materials: null,
      artistId: artist.id,
      slug: null,
      urlTitle: painting.urlTitle || painting.id,
      updatedAt: painting.createdAt,
      artist: {
        id: artist.id,
        bio: artist.bio,
        user: {
          name: artist.user.name,
          email: null
        }
      }
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
          maxPrice={maxPrice}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Mobile Filters */}
        <div className="artist-sidebar-mobile">
          <ArtistProfileMobileFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            techniqueOptions={techniqueOptions}
            subjectOptions={subjectOptions}
            styleOptions={styleOptions}
            allTags={allTags}
            sortOptions={sortOptions}
            maxPrice={maxPrice}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
            onClose={() => { }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Paintings Grid */}
        <div className="paintings-section">
          <div className="paintings-header">
            <h2 className="paintings-title">
              Галерия на {artist.user.name}
              <span className="paintings-count">({filteredPaintings.length})</span>
            </h2>
          </div>

          {filteredPaintings.length > 0 ? (
            <div className={`paintings-grid ${viewMode === 'large' ? 'paintings-grid-large' : 'paintings-grid-normal'}`}>
              {filteredPaintings.map((painting) => (
                <ArtistProfileArtworkCard
                  key={painting.id}
                  painting={convertToArtworkCardFormat(painting)}
                  showSold={false}
                />
              ))}
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
