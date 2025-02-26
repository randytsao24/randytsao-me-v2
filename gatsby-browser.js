import { Randalytics } from "randalytics";
import { createClient } from "@supabase/supabase-js";

import "./src/styles/global.css";
import "@fontsource/roboto-mono/400.css"; // Regular weight
import "@fontsource/roboto-mono/700.css"; // Bold weight

export const onClientEntry = () => {
  if (typeof window !== "undefined") {
    const supabase = createClient(
      process.env.GATSBY_SUPABASE_DB_URL,
      process.env.GATSBY_SUPABASE_ANON_KEY
    );

    const handleAnalyticsEvent = async (event) => {
      try {
        const formattedTimestamp = new Date(event.timestamp).toISOString();
        await supabase.from("analytics_events").insert({
          name: event.eventName,
          timestamp: formattedTimestamp,
          path: event.path || null,
          element_class: event.elementClass || null,
          element_id: event.elementId || null,
          text: event.text || null,
          title: event.title || null,
        });
      } catch (error) {
        console.error("Error sending analytics event:", error);
      }
    };

    const analytics = Randalytics.getInstance(handleAnalyticsEvent);

    window.randalytics = analytics;
    window.randalytics.init();
  }
};

export const onRouteUpdate = ({ location, prevLocation }) => {
  if (typeof window !== "undefined" && window.randalytics) {
    window.randalytics.trackPageView();
  }
};
