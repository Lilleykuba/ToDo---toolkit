import { useState, useEffect } from "react";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem("cookiesAccepted");
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 text-white p-4 flex justify-between items-center z-50">
      <p className="text-sm">
        This site uses cookies to improve your experience. By using our site,
        you agree to our{" "}
        <a href="/privacy-policy" className="underline">
          Privacy Policy
        </a>
        .
      </p>
      <button className="btn btn-primary btn-sm" onClick={acceptCookies}>
        Accept
      </button>
    </div>
  );
};

export default CookieConsent;
