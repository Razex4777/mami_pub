import { useState, useEffect } from "react";
import FloatingActionButton from "@/components/ui/interactive/FloatingActionButton";
import { HeroSection, PillarsSection, TimelineSection, ContactSection } from "./sections";
import { animationSources } from "./data";

type AnimationMap = Record<string, any>;

const Home = () => {
  const [animations, setAnimations] = useState<AnimationMap>({});

  useEffect(() => {
    const controllers: AbortController[] = [];

    Object.entries(animationSources).forEach(([key, url]) => {
      const controller = new AbortController();
      controllers.push(controller);

      fetch(url, { signal: controller.signal })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setAnimations(prev => ({ ...prev, [key]: data }));
        })
        .catch(error => {
          if (error.name !== "AbortError") {
            console.error(`Error loading animation ${key}:`, error);
          }
        });
    });

    return () => {
      controllers.forEach(controller => controller.abort());
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <FloatingActionButton phoneNumber="0557914544" />

      <HeroSection animations={animations} />
      <PillarsSection animations={animations} />
      <TimelineSection animations={animations} />
      <ContactSection />
    </div>
  );
};

export default Home;
