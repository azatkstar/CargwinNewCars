import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Play } from 'lucide-react';

const VideoGallery = ({ videos = [] }) => {
  if (!videos || videos.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Video Walk-Around
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video, idx) => (
            <div key={idx} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {video.type === 'youtube' ? (
                <iframe
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  title={video.title || 'Vehicle Video'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <video
                  controls
                  className="w-full h-full object-cover"
                  src={video.url}
                  poster={video.thumbnail}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {video.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2">
                  <p className="text-sm">{video.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoGallery;
