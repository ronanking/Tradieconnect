import { useEffect, useState } from 'react';
import { useToast } from './use-toast';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive important updates about your jobs and messages.",
        });
      } else if (result === 'denied') {
        toast({
          title: "Notifications Blocked",
          description: "You can enable notifications in your browser settings.",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  };

  const sendNotification = async (payload: NotificationPayload): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    if (permission !== 'granted') {
      const newPermission = await requestPermission();
      if (newPermission !== 'granted') {
        return false;
      }
    }

    try {
      // Check if page is visible - don't send notification if user is actively using the app
      if (document.visibilityState === 'visible') {
        // Show in-app toast instead
        toast({
          title: payload.title,
          description: payload.body,
        });
        return true;
      }

      // Send browser notification
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        tag: payload.tag,
        data: payload.data,
        badge: '/favicon.ico',
        requireInteraction: true,
        silent: false,
        actions: payload.actions
      });

      // Auto-close notification after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Navigate to relevant page based on notification data
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
        
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      
      // Fallback to toast notification
      toast({
        title: payload.title,
        description: payload.body,
      });
      
      return false;
    }
  };

  // Predefined notification types for the tradie marketplace
  const sendJobNotification = (type: 'new_quote' | 'quote_accepted' | 'job_completed' | 'payment_received', data: any) => {
    const notifications = {
      new_quote: {
        title: 'New Quote Received',
        body: `${data.tradieName} sent you a quote for "${data.jobTitle}"`,
        icon: '/icons/quote.png',
        tag: `quote_${data.quoteId}`,
        data: { url: '/customer-dashboard', quoteId: data.quoteId }
      },
      quote_accepted: {
        title: 'Quote Accepted!',
        body: `Your quote for "${data.jobTitle}" has been accepted`,
        icon: '/icons/success.png',
        tag: `job_${data.jobId}`,
        data: { url: '/tradie-dashboard', jobId: data.jobId }
      },
      job_completed: {
        title: 'Job Completed',
        body: `"${data.jobTitle}" has been marked as completed`,
        icon: '/icons/completed.png',
        tag: `job_${data.jobId}`,
        data: { url: '/customer-dashboard', jobId: data.jobId }
      },
      payment_received: {
        title: 'Payment Received',
        body: `You received $${data.amount} for "${data.jobTitle}"`,
        icon: '/icons/payment.png',
        tag: `payment_${data.paymentId}`,
        data: { url: '/tradie-dashboard', paymentId: data.paymentId }
      }
    };

    return sendNotification(notifications[type]);
  };

  const sendMessageNotification = (senderName: string, preview: string, conversationId: number) => {
    return sendNotification({
      title: `New message from ${senderName}`,
      body: preview.length > 50 ? preview.substring(0, 50) + '...' : preview,
      icon: '/icons/message.png',
      tag: `message_${conversationId}`,
      data: { url: '/messages', conversationId }
    });
  };

  const sendContractNotification = (type: 'pending_signature' | 'contract_signed', data: any) => {
    const notifications = {
      pending_signature: {
        title: 'Contract Ready for Signature',
        body: `Contract for "${data.jobTitle}" is ready for your signature`,
        icon: '/icons/contract.png',
        tag: `contract_${data.contractId}`,
        data: { url: '/contracts', contractId: data.contractId }
      },
      contract_signed: {
        title: 'Contract Signed',
        body: `Contract for "${data.jobTitle}" has been signed by ${data.signerName}`,
        icon: '/icons/signed.png',
        tag: `contract_${data.contractId}`,
        data: { url: '/contracts', contractId: data.contractId }
      }
    };

    return sendNotification(notifications[type]);
  };

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    sendJobNotification,
    sendMessageNotification,
    sendContractNotification
  };
}

// Global notification service for use across the app
class NotificationService {
  private static instance: NotificationService;
  private hooks: ReturnType<typeof useNotifications> | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  setHooks(hooks: ReturnType<typeof useNotifications>) {
    this.hooks = hooks;
  }

  async notify(payload: NotificationPayload) {
    if (this.hooks) {
      return this.hooks.sendNotification(payload);
    }
    return false;
  }

  async notifyJob(type: 'new_quote' | 'quote_accepted' | 'job_completed' | 'payment_received', data: any) {
    if (this.hooks) {
      return this.hooks.sendJobNotification(type, data);
    }
    return false;
  }

  async notifyMessage(senderName: string, preview: string, conversationId: number) {
    if (this.hooks) {
      return this.hooks.sendMessageNotification(senderName, preview, conversationId);
    }
    return false;
  }

  async notifyContract(type: 'pending_signature' | 'contract_signed', data: any) {
    if (this.hooks) {
      return this.hooks.sendContractNotification(type, data);
    }
    return false;
  }
}

export const notificationService = NotificationService.getInstance();