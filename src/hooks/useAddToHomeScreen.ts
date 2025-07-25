import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const useAddToHomeScreen = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const checkIfInstalled = () => {
      if (
        window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches
      ) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Check if running on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    // Listen for the beforeinstallprompt event (Android/Chrome and other PWA-supporting browsers)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Check if already installed
    if (!checkIfInstalled()) {
      // Listen for beforeinstallprompt on all devices (Chrome mobile on Android supports this)
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    // Check if running on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // If on iOS, show manual instructions instead of trying to prompt
    if (isIOS) {
      showManualInstallInstructions();
      return false;
    }

    if (!deferredPrompt) {
      showManualInstallInstructions();
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error prompting install:", error);
      showManualInstallInstructions();
      return false;
    }
  };

  const showManualInstallInstructions = () => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isChromeMobile = /Chrome/.test(userAgent) && /Mobile/.test(userAgent);

    let instructions = "";

    if (isIOS) {
      instructions =
        'לחץ על כפתור השיתוף (□↑) בתחתית המסך, ואז "הוסף למסך הבית"';
    } else if (isChromeMobile) {
      instructions =
        'לחץ על התפריט (⋮) בפינה הימנית העליונה, ואז "הוסף למסך הבית" או "Install app"';
    } else if (userAgent.includes("Chrome")) {
      instructions = 'לחץ על התפריט (⋮) ואז "הוסף למסך הבית"';
    } else if (userAgent.includes("Safari")) {
      instructions = 'לחץ על כפתור השיתוף (□↑) ואז "הוסף למסך הבית"';
    } else if (userAgent.includes("Firefox")) {
      instructions = 'לחץ על התפריט (☰) ואז "הוסף למסך הבית"';
    } else {
      instructions = 'חפש באפשרויות הדפדפן "הוסף למסך הבית"';
    }

    alert(instructions);
  };

  // Function to check if app meets PWA criteria
  const checkPWACriteria = () => {
    const hasManifest = !!document.querySelector('link[rel="manifest"]');
    const hasHttps =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost";
    const hasServiceWorker = "serviceWorker" in navigator;
    const isStandalone =
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches;

    return {
      hasManifest,
      hasHttps,
      hasServiceWorker,
      isStandalone,
      allMet: hasManifest && hasHttps && hasServiceWorker && !isStandalone,
    };
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    showManualInstallInstructions,
    checkPWACriteria,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isSafari:
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
  };
};
