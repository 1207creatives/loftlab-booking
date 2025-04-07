
const SUPABASE_URL = "https://iqdgezkzlxcslszfcnps.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxZGdlemt6bHhjc2xzemZjbnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTM1OTIsImV4cCI6MjA1OTYyOTU5Mn0.tGuxP5xmFqdloCIBHNiKmhBgrqGvVyrxi0M7SAGBInI";

const booking = {
  date: localStorage.getItem("booking_date"),
  time: localStorage.getItem("booking_time"),
  services: JSON.parse(localStorage.getItem("booking_services") || "[]"),
  email: localStorage.getItem("booking_email")
};

if (booking.date && booking.time && booking.services.length && booking.email) {
  fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(booking)
  }).then(res => {
    localStorage.clear();
  });
}
