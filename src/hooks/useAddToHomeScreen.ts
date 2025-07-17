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

  // Debug logging on mount
  useEffect(() => {
    console.log("=== Add to Home Screen Hook Debug ===");
    console.log("User Agent:", navigator.userAgent);
    console.log("Is iOS:", /iPad|iPhone|iPod/.test(navigator.userAgent));
    console.log(
      "Is Chrome Mobile:",
      /Chrome/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent)
    );
    console.log(
      "Is Standalone:",
      window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches
    );
    console.log("Service Worker:", "serviceWorker" in navigator);

    // Check PWA criteria
    const hasManifest = !!document.querySelector('link[rel="manifest"]');
    const hasHttps =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost";
    const hasServiceWorker = "serviceWorker" in navigator;

    console.log("Has Manifest:", hasManifest);
    console.log("Has HTTPS:", hasHttps);
    console.log("Has Service Worker:", hasServiceWorker);
    console.log("=====================================");
  }, []);

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
      console.log("beforeinstallprompt event fired - app is installable");
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("App installed successfully");
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
      console.log("No deferred prompt available - showing manual instructions");
      showManualInstallInstructions();
      return false;
    }

    try {
      console.log("Showing install prompt...");
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log("Install prompt outcome:", outcome);

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

    console.log("User Agent:", userAgent);
    console.log("Is iOS:", isIOS);
    console.log("Is Safari:", isSafari);
    console.log("Is Chrome Mobile:", isChromeMobile);

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

    console.log("Instructions:", instructions);
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
