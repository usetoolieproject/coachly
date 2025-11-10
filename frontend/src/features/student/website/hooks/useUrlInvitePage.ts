import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTenant } from '../../../../contexts/TenantContext';
import { aboutPageService } from '../../../../services/aboutPageService';
import { studentCourseService } from '../../studentCourses/services';
import { usePayment } from '../../../instructor/websitev2/hooks/usePayment';
import type { PaymentData } from '../../../instructor/websitev2/services/paymentService';
import type { PublicAboutPageData, CommunityModalStatus } from '../types';

export const useUrlInvitePage = () => {
  const { slug: subdirectory } = useTenant();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [aboutPageData, setAboutPageData] = useState<PublicAboutPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningCommunity, setJoiningCommunity] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const { paymentStatus, handleCommunityPayment } = usePayment();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<CommunityModalStatus>(null);
  const [currentCommunity, setCurrentCommunity] = useState<any>(null);
  const [targetCommunity, setTargetCommunity] = useState<any>(null);

  useEffect(() => {
    if (subdirectory && subdirectory !== 'default') {
      loadPublicAboutPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdirectory]);

  const loadPublicAboutPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aboutPageService.getPublicAboutPage(subdirectory!);
      setAboutPageData({ ...data, subdirectory: subdirectory! });
    } catch (error) {
      console.error('Error loading about page:', error);
      setError('About page not found or not published');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    if (!aboutPageData) return;

    if (aboutPageData.is_paid_community) {
      const paymentData: PaymentData = {
        communityId: aboutPageData.id,
        instructorId: aboutPageData.instructor.id,
        amount: aboutPageData.monthly_price,
        currency: 'usd',
        description: `Join ${aboutPageData.title} - Monthly Subscription`,
      };
      // Persist intended community join so signup page can auto-join after Stripe returns
      try {
        const pending = {
          subdirectory: subdirectory,
          communityName: aboutPageData.title,
          instructorName: `${aboutPageData.instructor.users.first_name} ${aboutPageData.instructor.users.last_name}`,
          timestamp: Date.now(),
        };
        localStorage.setItem('pendingCommunityJoin', JSON.stringify(pending));
      } catch {}
      try {
        await handleCommunityPayment(paymentData);
      } catch (e) {}
      return;
    }

    if (user) {
      if (user.role === 'student') {
        try {
          setJoiningCommunity(true);
          const response = await studentCourseService.joinCommunityPublic(subdirectory!);
          if (response.status === 'already_joined') {
            setModalStatus('already_joined');
            setTargetCommunity(response.community);
            setShowStatusModal(true);
          } else if (response.status === 'has_existing_community') {
            setModalStatus('has_existing_community');
            setCurrentCommunity(response.currentCommunity);
            setTargetCommunity(response.targetCommunity);
            setShowStatusModal(true);
          } else if (response.status === 'success') {
            alert(response.message);
            navigate('/student/community');
          }
        } catch (error: any) {
          console.error('Error joining community:', error);
          alert(error.message || 'Failed to join community');
        } finally {
          setJoiningCommunity(false);
        }
      } else {
        alert('You need a student account to join this community');
      }
    } else {
      localStorage.setItem('pendingCommunityJoin', JSON.stringify({
        subdirectory: subdirectory,
        communityName: aboutPageData?.title || 'this community',
        instructorName: `${aboutPageData?.instructor.users.first_name} ${aboutPageData?.instructor.users.last_name}`,
        timestamp: Date.now()
      }));
      navigate('/signup/student', { state: { fromCommunity: true } });
    }
  };

  const handleConfirmSwitch = async () => {
    try {
      setJoiningCommunity(true);
      const response = await studentCourseService.joinCommunityPublic(subdirectory!, true);
      if (response.status === 'success') {
        setShowStatusModal(false);
        alert(response.message);
        navigate('/student/community');
      }
    } catch (error: any) {
      console.error('Error switching community:', error);
      alert(error.message || 'Failed to switch community');
    } finally {
      setJoiningCommunity(false);
    }
  };

  const closeModal = () => {
    setShowStatusModal(false);
    setModalStatus(null);
    setCurrentCommunity(null);
    setTargetCommunity(null);
  };

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getEmbedUrl = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const nextMedia = () => {
    const mediaItems = aboutPageData?.instructor_intro_content?.[0]?.instructor_intro_media_items || [];
    setCurrentMediaIndex((prev) => prev < mediaItems.length - 1 ? prev + 1 : 0);
  };

  const prevMedia = () => {
    const mediaItems = aboutPageData?.instructor_intro_content?.[0]?.instructor_intro_media_items || [];
    setCurrentMediaIndex((prev) => prev > 0 ? prev - 1 : mediaItems.length - 1);
  };

  return {
    state: {
      subdirectory,
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
      setMediaIndex: (i: number) => setCurrentMediaIndex(i),
    },
  } as const;
};


