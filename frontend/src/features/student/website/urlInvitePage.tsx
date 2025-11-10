import React, { useEffect } from 'react';
import { useCanonical } from '../../../components/shared/Seo';
import { useNavigate } from 'react-router-dom';
import { ProfilePicture } from '../../../components/shared';
import { 
  Loader2, Globe, Unlock, 
  Play,
  ChevronLeft, ChevronRight, Video
} from 'lucide-react';
import { CommunityStatusModal } from '.';
import { useUrlInvitePage } from './hooks/useUrlInvitePage';

const UrlInvitePage: React.FC = () => {
  useCanonical('/');
  const navigate = useNavigate();

  // Force light mode while on invite page
  useEffect(() => {
    const hadDarkHtml = document.documentElement.classList.contains('dark');
    const hadDarkBody = document.body.classList.contains('dark');
    if (hadDarkHtml) document.documentElement.classList.remove('dark');
    if (hadDarkBody) document.body.classList.remove('dark');
    const prevScheme = document.documentElement.style.colorScheme;
    document.documentElement.style.colorScheme = 'light';
    return () => {
      if (hadDarkHtml) document.documentElement.classList.add('dark');
      if (hadDarkBody) document.body.classList.add('dark');
      document.documentElement.style.colorScheme = prevScheme || (hadDarkHtml ? 'dark' : 'light');
    };
  }, []);
  const {
    state: {
      aboutPageData,
      loading,
      error,
      joiningCommunity,
      currentMediaIndex,
      paymentStatus,
      showStatusModal,
      modalStatus,
      currentCommunity,
      targetCommunity,
    },
    actions: {
      handleJoinCommunity,
      handleConfirmSwitch,
      closeModal,
      nextMedia,
      prevMedia,
      getEmbedUrl,
      setMediaIndex,
    }
  } = useUrlInvitePage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading community page...</p>
        </div>
      </div>
    );
  }

  if (error || !aboutPageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'This community page does not exist or is not published.'}</p>
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const introContent = aboutPageData.instructor_intro_content?.[0];
  const mediaItems = introContent?.instructor_intro_media_items || [];
  const currentMedia = mediaItems[currentMediaIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <CommunityStatusModal
        isOpen={showStatusModal}
        onClose={closeModal}
        status={modalStatus}
        currentCommunity={currentCommunity}
        targetCommunity={targetCommunity}
        onConfirmSwitch={handleConfirmSwitch}
        loading={joiningCommunity}
      />

      <div 
        className="h-48 w-full bg-cover bg-center relative"
        style={{
          backgroundImage: aboutPageData.banner_url ? `url(${aboutPageData.banner_url})` : 'none',
          backgroundColor: aboutPageData.banner_url ? 'transparent' : aboutPageData.primary_color
        }}
      >
        {!aboutPageData.banner_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold mb-2">{aboutPageData.title}</h1>
              <p className="text-lg opacity-90">Welcome to our learning community</p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {aboutPageData.title}
          </h1>
          
          <div className="flex justify-center mb-8">
            <button 
              onClick={handleJoinCommunity}
              disabled={joiningCommunity || paymentStatus.isProcessing}
              style={{ backgroundColor: aboutPageData.primary_color }}
              className="text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
            >
              {paymentStatus.isProcessing
                ? 'Processing...'
                : joiningCommunity
                  ? 'Checking Status...'
                  : aboutPageData.is_paid_community
                    ? `Join for $${aboutPageData.monthly_price}/month`
                    : 'Join Learning Community'}
            </button>
          </div>
          <p className="text-sm text-gray-600 flex items-center justify-center mb-2">
            <Unlock className="w-4 h-4 mr-2" />
            {aboutPageData.is_paid_community ? 'Join our premium community' : 'Free access to all courses • No credit card required'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Already have an account? <span className="text-purple-600 hover:underline cursor-pointer">Sign in</span>
          </p>
        </div>

        <div className="relative w-full flex flex-col items-center bg-gradient-to-b from-slate-50 to-white rounded-2xl">
          <div 
            className="pointer-events-none absolute -top-12 -left-12 h-36 w-36 rounded-full blur-3xl opacity-20" 
            style={{ backgroundColor: aboutPageData.primary_color }}
          />
          <div 
            className="pointer-events-none absolute top-16 -right-8 h-36 w-36 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: aboutPageData.secondary_color }}
          />

          <main className="w-full max-w-6xl px-6">
            <div className="rounded-2xl shadow-xl ring-1 ring-slate-100 bg-white">
              <div className="p-0">
                {introContent && mediaItems.length > 0 && (
                  <section className="p-5 md:p-7">
                    <div className="relative overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 flex items-center justify-center">
                      <div 
                        className="absolute inset-0 opacity-35"
                        style={{ 
                          background: `radial-gradient(circle at 30% 20%, ${aboutPageData.primary_color}35 0%, transparent 45%)`
                        }}
                      />
                      {currentMedia ? (
                        currentMedia.type === 'video' ? (
                          <iframe
                            src={getEmbedUrl(currentMedia.url)}
                            className="absolute inset-0 w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <img
                            src={currentMedia.url}
                            alt="Community content"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <button className="z-10 w-12 h-12 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-2xl">
                          <Play className="w-6 h-6 text-gray-800 ml-1" />
                        </button>
                      )}
                      {mediaItems.length > 1 && (
                        <>
                          <button
                            onClick={prevMedia}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextMedia}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                    
                    <p className="mt-2 text-[11px] md:text-sm text-slate-500">
                      {introContent.description} {mediaItems.length > 1 && `(${currentMediaIndex + 1} of ${mediaItems.length})`}
                    </p>

                    {mediaItems.length > 1 && (
                      <>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                          {mediaItems.slice(0, 6).map((item, i) => (
                            <button
                              key={i}
                              onClick={() => setMediaIndex(i)}
                              className={`rounded-md aspect-[4/3] overflow-hidden ring-1 flex items-center justify-center text-slate-400 text-[10px] ${
                                currentMediaIndex === i 
                                  ? 'ring-2' 
                                  : 'ring-slate-200/60'
                              }`}
                              style={currentMediaIndex === i ? { 
                                boxShadow: `0 0 0 2px ${aboutPageData.primary_color}` 
                              } : {}}
                            >
                              {item.type === 'video' ? (
                                <div className="bg-gradient-to-br from-slate-100 to-slate-50 w-full h-full flex items-center justify-center">
                                  <Video className="w-4 h-4" />
                                </div>
                              ) : (
                                <img src={item.url} alt="thumbnail" className="w-full h-full object-cover" />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 text-[9px] md:text-xs text-slate-500">
                          Community content: courses, community, live calls, and more.
                        </div>
                      </>
                    )}
                  </section>
                )}

                <div className="h-px w-full bg-slate-100" />

                <section className="p-6 md:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 text-left">
                      <h2 className="text-2xl font-semibold">About</h2>
                      <p className="mt-3 text-slate-700">{aboutPageData.description}</p>

                      <ul className="mt-6 space-y-3 text-slate-700">
                        {aboutPageData.custom_bullets.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span 
                              className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs"
                              style={{ 
                                borderColor: aboutPageData.primary_color + '40',
                                color: aboutPageData.primary_color 
                              }}
                            >
                              ✓
                            </span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="lg:col-span-1">
                      <div className="lg:sticky lg:top-8">
                        <div className="rounded-2xl shadow-md ring-1 ring-slate-100 bg-white">
                          <div className="p-6 text-left">
                            <div className="flex items-center gap-3">
                              <ProfilePicture
                                src={aboutPageData.instructor.users.profile_picture_url}
                                firstName={aboutPageData.instructor.users.first_name}
                                lastName={aboutPageData.instructor.users.last_name}
                                size="lg"
                              />
                              <div>
                                <div className="font-medium">{aboutPageData.title}</div>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                              {[
                                { value: `${(aboutPageData.stats.totalStudents / 1000).toFixed(1)}k`, label: "Members" },
                                { value: "24/7", label: "Support" },
                                { value: aboutPageData.stats.totalCourses.toString(), label: "Courses" }
                              ].map((stat, i) => (
                                <div key={i} className="rounded-lg ring-1 ring-slate-200 p-2 bg-slate-50">
                                  <div className="text-sm font-semibold">{stat.value}</div>
                                  <div className="text-[10px] text-slate-500">{stat.label}</div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-6">
                              <div className="rounded-2xl overflow-hidden shadow-lg">
                                <div 
                                  className="text-white text-center py-3"
                                  style={{ backgroundColor: aboutPageData.secondary_color }}
                                >
                                  <p className="text-lg font-semibold">
                                    {aboutPageData.is_paid_community ? `$${aboutPageData.monthly_price}/month` : 'Free to Join'}
                                  </p>
                                </div>
                                <button
                                  onClick={handleJoinCommunity}
                                  disabled={joiningCommunity || paymentStatus.isProcessing}
                                  className="w-full rounded-none text-white py-7 text-xl font-bold disabled:opacity-50 transition-colors hover:opacity-90"
                                  style={{ backgroundColor: aboutPageData.primary_color }}
                                >
                                  {paymentStatus.isProcessing ? 'PROCESSING...' : joiningCommunity ? 'CHECKING...' : 'JOIN COMMUNITY'}
                                </button>
                              </div>
                            </div>

                            <p className="mt-3 text-xs text-slate-500">
                              {aboutPageData.is_paid_community 
                                ? 'Premium community access'
                                : 'Free to join • Private community • No credit card required'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {aboutPageData.included_features.length > 0 && (
                  <section className="p-6 md:p-8">
                    <h2 className="text-2xl font-semibold mb-6">What's Included</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {aboutPageData.included_features.map((feature, i) => {
                        const featureConfig = {
                          courses: { k: "Courses", v: `${aboutPageData.stats.totalCourses} comprehensive courses`, color: "from-amber-400 to-orange-500" },
                          community: { k: "Community", v: "24/7 peer support & networking", color: "from-sky-400 to-indigo-500" },
                          live_sessions: { k: "Live Sessions", v: "Regular Q&A and coaching", color: "from-violet-500 to-fuchsia-500" }
                        }[feature as 'courses' | 'community' | 'live_sessions'] as any;
                        
                        if (!featureConfig) return null;
                        
                        return (
                          <div key={i} className={`p-[1px] rounded-2xl bg-gradient-to-br ${featureConfig.color} shadow-sm`}>
                            <div className="rounded-2xl bg-white p-6 text-center">
                              <div className="text-xl font-semibold">{featureConfig.k}</div>
                              <div className="text-sm text-slate-500 mt-2">{featureConfig.v}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            </div>

            <section className="w-full px-6 py-16">
              <h2 className="text-2xl font-semibold mb-6 text-left">What Our Students Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {aboutPageData.testimonials.map((testimonial, i) => (
                  <div key={i} className="rounded-2xl shadow-md ring-1 ring-slate-100 bg-white">
                    <div className="p-6 text-left">
                      <div 
                        className="text-3xl leading-none -mt-2"
                        style={{ color: aboutPageData.primary_color }}
                      >
                        "
                      </div>
                      <p className="-mt-2 mb-4 italic text-slate-700">{testimonial.quote}</p>
                      <p className="font-medium text-slate-800">– {testimonial.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((v) => (
                  <div key={v} className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-gradient-to-b from-slate-900 to-black flex items-center justify-center text-white">
                    <button className="z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl">
                      <Play className="w-6 h-6 text-gray-800 ml-1" />
                    </button>
                    <div 
                      className="absolute inset-0 opacity-25"
                      style={{ 
                        background: `radial-gradient(circle at 70% 80%, ${aboutPageData.primary_color}40 0%, transparent 40%)`
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>
          </main>

          <footer className="w-full border-t py-4 text-center text-sm text-slate-500 flex justify-center gap-6">
            <button className="hover:text-slate-700">Privacy Policy</button>
            <button className="hover:text-slate-700">Terms & Conditions</button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default UrlInvitePage;


