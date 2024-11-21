import React, { useState } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import { Share2, Copy, Download } from 'lucide-react';

interface Post {
  title: string;
  content: string;
  image: string;
}

const SAMPLE_QUERY = gql`
  query GetPost($topic: String!) {
    post(topic: $topic) {
      title
      content
      image
    }
  }
`;

export default function PostGenerator() {
  const [topic, setTopic] = useState('');
  const [getPost, { loading, error, data }] = useLazyQuery(SAMPLE_QUERY);
  
  const handleGenerate = () => {
    if (topic) {
      getPost({ variables: { topic } });
    }
  };

  const handleCopy = () => {
    if (data?.post) {
      navigator.clipboard.writeText(`${data.post.title}\n\n${data.post.content}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your topic..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating your post...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Error: {error.message}
          </div>
        )}

        {data?.post && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-64">
              <img
                src={data.post.image}
                alt="Post visual"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">{data.post.title}</h2>
              <p className="text-gray-600 leading-relaxed">{data.post.content}</p>
              
              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy size={18} />
                  Copy
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 size={18} />
                  Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}