import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Star, DollarSign, Instagram, ExternalLink } from 'lucide-react';
import { mockReviews, mockInstagramReviews } from '../mock';
import { formatPrice } from '../utils/timer';
import { useI18n } from '../hooks/useI18n';

const Reviews = () => {
  const { t } = useI18n();
  
  return (
    <section id="reviews" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('reviews.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('reviews.subtitle')}
          </p>
        </div>

        {/* Text Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {mockReviews.map((review) => (
            <Card key={review.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{review.text}"
                </p>

                {/* Savings Highlight */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">
                      {t('reviews.saved')}: {formatPrice(review.savings)}
                    </span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    {review.model}
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {review.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {review.city}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Подтверждён
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instagram Video Reviews */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('reviews.instagram_title')}
            </h3>
            <p className="text-gray-600">
              Смотрите реальные истории наших клиентов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockInstagramReviews.map((video) => (
              <div key={video.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-purple-500 to-pink-500">
                  <img 
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                  
                  {/* Instagram Icon */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <Instagram className="w-5 h-5 text-pink-600" />
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="w-0 h-0 border-l-[16px] border-l-red-600 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                    {video.title}
                  </h4>
                  
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-4 h-4 mr-2" />
                      {t('reviews.watch_on_instagram')}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">
                4.9/5
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                {t('reviews.average_rating')}
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                847
              </div>
              <div className="text-sm text-gray-600">
                {t('reviews.reviews_per_month')}
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                96%
              </div>
              <div className="text-sm text-gray-600">
                {t('reviews.recommend_friends')}
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                $5,200
              </div>
              <div className="text-sm text-gray-600">
                {t('reviews.average_savings')}
              </div>
            </div>
          </div>
        </div>

        {/* Review CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('reviews.share_experience')}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Помогите другим принять правильное решение — расскажите о своей экономии
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
              {t('reviews.leave_review')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;