import React, { useState, useRef } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import { Building2, MapPin, Target, Users, Copy, Share2, Download, Image } from 'lucide-react';
import html2canvas from 'html2canvas';

const GET_OPPORTUNITY = gql`
  query GetOpportunityByIdQuery($id: ID!) {
    opportunity(id: $id) {
      id
      project_description
      host_lc {
        name
      }
      home_mc {
        name
      }
      project {
        project_name
        sdg_info {
          sdg_target {
            target_id
          }
        }
      }
      branch {
        company {
          name
        }
      }
      location
      cover_photo(cdn_links: true)
    }
  }
`;

interface SDGTarget {
  target_id: string;
}

interface Opportunity {
  id: string;
  project_description: string;
  host_lc: { name: string };
  home_mc: { name: string };
  project: {
    project_name: string;
    sdg_info: {
      sdg_target: SDGTarget | SDGTarget[];
    };
  };
  branch: {
    company: {
      name: string;
    };
  };
  location: string;
  cover_photo: {
    url: string;
  };
}

export default function OpportunityViewer() {
  const [opportunityId, setOpportunityId] = useState('');
  const [getOpportunity, { loading, error, data }] = useLazyQuery(GET_OPPORTUNITY);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSearch = () => {
    if (opportunityId) {
      getOpportunity({ variables: { id: opportunityId } });
    }
  };

  const handleCopy = () => {
    if (data?.opportunity) {
      const opp = data.opportunity;
      const text = `
Project: ${opp.project.project_name}
Location: ${opp.location}
Company: ${opp.branch.company.name}
Host LC: ${opp.host_lc.name}
Home MC: ${opp.home_mc.name}

${opp.project_description}
      `.trim();
      navigator.clipboard.writeText(text);
    }
  };

  const handleDownload = async (format: 'png' | 'jpg') => {
    if (!cardRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const image = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 1.0);
      const link = document.createElement('a');
      link.download = `opportunity-${opportunityId}.${format}`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setDownloading(false);
    }
  };

  const getSdgTargets = (sdgInfo: Opportunity['project']['sdg_info']) => {
    if (!sdgInfo?.sdg_target) return '';
    
    const targets = Array.isArray(sdgInfo.sdg_target) 
      ? sdgInfo.sdg_target 
      : [sdgInfo.sdg_target];
    
    return targets.map(t => t.target_id).join(', ');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={opportunityId}
            onChange={(e) => setOpportunityId(e.target.value)}
            placeholder="Enter opportunity ID..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !opportunityId}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Fetching opportunity details...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Error: {error.message}
          </div>
        )}

        {data?.opportunity && (
          <div ref={cardRef} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {data.opportunity.cover_photo?.url && (
              <div className="relative h-64">
                <img
                  src={data.opportunity.cover_photo.url}
                  alt="Project cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            )}
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{data.opportunity.project.project_name}</h2>
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{data.opportunity.location}</span>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Building2 className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium">{data.opportunity.branch.company.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Host LC</p>
                    <p className="font-medium">{data.opportunity.host_lc.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Target className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">SDG Targets</p>
                    <p className="font-medium">
                      {getSdgTargets(data.opportunity.project.sdg_info)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2">Project Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{data.opportunity.project_description}</p>
              </div>
              
              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy size={18} />
                  Copy Details
                </button>
                <div className="relative group">
                  <button
                    disabled={downloading}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group-hover:rounded-b-none"
                  >
                    {downloading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                    ) : (
                      <Image size={18} />
                    )}
                    Download as Image
                  </button>
                  <div className="absolute hidden group-hover:block w-full bg-white border border-gray-200 rounded-b-lg shadow-lg overflow-hidden">
                    <button
                      onClick={() => handleDownload('png')}
                      className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      PNG
                    </button>
                    <button
                      onClick={() => handleDownload('jpg')}
                      className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      JPG
                    </button>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}