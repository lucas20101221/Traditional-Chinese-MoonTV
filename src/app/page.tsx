'use client';

/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any */

import { ChevronUp, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

import {
  addSearchHistory,
  clearSearchHistory,
  deleteSearchHistory,
  getSearchHistory,
  subscribeToDataUpdates,
} from '@/lib/db.client';

import { toSimplified, toTW } from '@/lib/translate';
import { SearchResult } from '@/lib/types';
import { yellowWords } from '@/lib/yellow';

import PageLayout from '@/components/PageLayout';
import VideoCard from '@/components/VideoCard';

function SearchPageClient() {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const getDefaultAggregate = () => {
    if (typeof window !== 'undefined') {
      const userSetting = localStorage.getItem('defaultAggregateSearch');
      if (userSetting !== null) return JSON.parse(userSetting);
    }
    return true;
  };

  const [viewMode, setViewMode] = useState<'agg' | 'all'>(() =>
    getDefaultAggregate() ? 'agg' : 'all'
  );

  const aggregatedResults = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    searchResults.forEach((item) => {
      const key = `${item.title.replaceAll(' ', '')}-${item.year || 'unknown'}-${
        item.episodes.length === 1 ? 'movie' : 'tv'
      }`;
      const arr = map.get(key) || [];
      arr.push(item);
      map.set(key, arr);
    });
    return Array.from(map.entries()).sort((a, b) => {
      const aExact = a[1][0].title.replaceAll(' ', '').includes(searchQuery.trim().replaceAll(' ', ''));
      const bExact = b[1][0].title.replaceAll(' ', '').includes(searchQuery.trim().replaceAll(' ', ''));
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aYear = a[1][0].year;
      const bYear = b[1][0].year;

      if (aYear === bYear) return a[0].localeCompare(b[0]);
      if (aYear === 'unknown') return 1;
      if (bYear === 'unknown') return -1;
      return aYear > bYear ? -1 : 1;
    });
  }, [searchResults]);

  useEffect(() => {
    !searchParams.get('q') && document.getElementById('searchInput')?.focus();
    getSearchHistory().then(setSearchHistory);

    const unsubscribe = subscribeToDataUpdates('searchHistoryUpdated', (newHistory: string[]) => {
      setSearchHistory(newHistory);
    });

    const getScrollTop = () => document.body.scrollTop || 0;
    let isRunning = false;

    const checkScrollPosition = () => {
      if (!isRunning) return;
      const scrollTop = getScrollTop();
      setShowBackToTop(scrollTop > 300);
      requestAnimationFrame(checkScrollPosition);
    };

    isRunning = true;
    checkScrollPosition();

    const handleScroll = () => {
      setShowBackToTop(getScrollTop() > 300);
    };

    document.body.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      unsubscribe();
      isRunning = false;
      document.body.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const query = searchParams.get('q');
    if (!query) return;
    (async () => {
      const simplified = toSimplified(query);
      setSearchQuery(query);
      fetchSearchResults(simplified);
      addSearchHistory(query);
    })();
  }, [searchParams]);

  const fetchSearchResults = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      let results = data.results;

      if (typeof window !== 'undefined' && !(window as any).RUNTIME_CONFIG?.DISABLE_YELLOW_FILTER) {
        results = results.filter((result: SearchResult) => {
          const typeName = result.type_name || '';
          return !yellowWords.some((word: string) => typeName.includes(word));
        });
      }

      setSearchResults(results.sort((a: SearchResult, b: SearchResult) => {
        const aExact = a.title === query.trim();
        const bExact = b.title === query.trim();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        if (a.year === b.year) return a.title.localeCompare(b.title);
        if (a.year === 'unknown') return 1;
        if (b.year === 'unknown') return -1;
        return parseInt(a.year) > parseInt(b.year) ? -1 : 1;
      }));

      setShowResults(true);
    } catch {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim().replace(/\s+/g, ' ');
    if (!trimmed) return;
    const simplified = toSimplified(trimmed);
    setSearchQuery(trimmed);
    setIsLoading(true);
    setShowResults(true);
    router.push(`/search?q=${encodeURIComponent(simplified)}`);
    fetchSearchResults(simplified);
    addSearchHistory(trimmed);
  };

  const scrollToTop = () => {
    try {
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      document.body.scrollTop = 0;
    }
  };

  return (
    <PageLayout activePath='/search'>
      <div className='px-4 sm:px-10 py-4 sm:py-8 overflow-visible mb-10'>
        {/* 搜索框 */}
        <div className='mb-8'>
          <form onSubmit={handleSearch} className='max-w-2xl mx-auto'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500' />
              <input
                id='searchInput'
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='搜索电影、电视剧...'
                className='w-full h-12 rounded-lg bg-gray-50/80 py-3 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white border border-gray-200/50 shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:placeholder-gray-500 dark:focus:bg-gray-700 dark:border-gray-700'
              />
            </div>
          </form>
        </div>

        {/* 搜索結果或歷史 */}
        <div className='max-w-[95%] mx-auto mt-12 overflow-visible'>
          {isLoading ? (
            <div className='flex justify-center items-center h-40'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500'></div>
            </div>
          ) : showResults ? (
            <section className='mb-12'>
              {/* 標題 + 聚合開關 */}
              <div className='mb-8 flex items-center justify-between'>
                <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200'>
                  搜索結果
                </h2>
                <label className='flex items-center gap-2 cursor-pointer select-none'>
                  <span className='text-sm text-gray-700 dark:text-gray-300'>聚合</span>
                  <div className='relative'>
                    <input
                      type='checkbox'
                      className='sr-only peer'
                      checked={viewMode === 'agg'}
                      onChange={() => setViewMode(viewMode === 'agg' ? 'all' : 'agg')}
                    />
                    <div className='w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors dark:bg-gray-600'></div>
                    <div className='absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4'></div>
                  </div>
                </label>
              </div>
              <div
                key={`search-results-${viewMode}`}
                className='justify-start grid grid-cols-3 gap-x-2 gap-y-14 sm:gap-y-20 px-0 sm:px-2 sm:grid-cols-[repeat(auto-fill,_minmax(11rem,_1fr))] sm:gap-x-8'
              >
                {viewMode === 'agg'
                  ? aggregatedResults.map(([mapKey, group]) => (
                      <div key={`agg-${mapKey}`} className='w-full'>
                        <VideoCard from='search' items={group} query={searchQuery.trim() !== group[0].title ? searchQuery.trim() : ''} />
                      </div>
                    ))
                  : searchResults.map((item) => (
                      <div key={`all-${item.source}-${item.id}`} className='w-full'>
                        <VideoCard
                          id={item.id}
                          title={item.title + ' ' + item.type_name}
                          poster={item.poster}
                          episodes={item.episodes.length}
                          source={item.source}
                          source_name={item.source_name}
                          douban_id={item.douban_id?.toString()}
                          query={searchQuery.trim() !== item.title ? searchQuery.trim() : ''}
                          year={item.year}
                          from='search'
                          type={item.episodes.length > 1 ? 'tv' : 'movie'}
                        />
                      </div>
                    ))}
                {searchResults.length === 0 && (
                  <div className='col-span-full text-center text-gray-500 py-8 dark:text-gray-400'>
                    未找到相關結果
                  </div>
                )}
              </div>
            </section>
          ) : searchHistory.length > 0 ? (
            <section className='mb-12'>
              <h2 className='mb-4 text-xl font-bold text-gray-800 dark:text-gray-200'>
                搜索歷史
                {searchHistory.length > 0 && (
                  <button
                    onClick={() => clearSearchHistory()}
                    className='ml-3 text-sm text-gray-500 hover:text-red-500 transition-colors dark:text-gray-400 dark:hover:text-red-500'
                  >
                    清空
                  </button>
                )}
              </h2>
              <div className='flex flex-wrap gap-2'>
                {searchHistory.map((item) => (
                  <div key={item} className='relative group'>
                    <button
                      onClick={() => {
                        setSearchQuery(item);
                        router.push(`/search?q=${encodeURIComponent(item.trim())}`);
                      }}
                      className='px-4 py-2 bg-gray-500/10 hover:bg-gray-300 rounded-full text-sm text-gray-700 transition-colors duration-200 dark:bg-gray-700/50 dark:hover:bg-gray-600 dark:text-gray-300'
                    >
                      {item}
                    </button>
                    <button
                      aria-label='刪除歷史'
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        deleteSearchHistory(item);
                      }}
                      className='absolute -top-1 -right-1 w-4 h-4 opacity-0 group-hover:opacity-100 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] transition-colors'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {/* 返回頂部按鈕 */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-20 md:bottom-6 right-6 z-[500] w-12 h-12 bg-green-500/90 hover:bg-green-500 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out flex items-center justify-center group ${
          showBackToTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label='返回頂部'
      >
        <ChevronUp className='w-6 h-6 transition-transform group-hover:scale-110' />
      </button>
    </PageLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageClient />
    </Suspense>
  );
}
