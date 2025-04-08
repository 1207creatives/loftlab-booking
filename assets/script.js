
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const weekendCheckbox = document.querySelector('input[value="Weekend Booking"]');
  const totalSpan = document.getElementById('total');
  const emailInput = document.getElementById('email');

  const SUPABASE_URL = "https://iqdgezkzlxcslszfcnps.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxZGdlemt6bHhjc2xzemZjbnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTM1OTIsImV4cCI6MjA1OTYyOTU5Mn0.tGuxP5xmFqdloCIBHNiKmhBgrqGvVyrxi0M7SAGBInI";

  function isWeekend(dateStr) {
    const d = new Date(dateStr);
    const day = d.getUTCDay();
    return day === 0 || day === 6;
  }

  function updateTotal() {
    let total = 0;
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      total += parseFloat(cb.dataset.price || 0);
    });
    totalSpan.textContent = total.toFixed(2);
  }

  function disableBookedSlots(bookedTimes) {
    [...timeInput.options].forEach(option => {
      if (bookedTimes.includes(option.value)) {
        option.disabled = true;
        option.textContent += " (Booked)";
      } else {
        option.disabled = false;
        option.textContent = option.textContent.replace(" (Booked)", "");
      }
    });
  }

  async function fetchBookedSlots(date) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings?date=eq.${date}`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      }
    });
    const bookings = await res.json();
    const bookedTimes = bookings.map(b => b.time);
    disableBookedSlots(bookedTimes);
  }

  dateInput.addEventListener('change', () => {
    if (isWeekend(dateInput.value)) {
      weekendCheckbox.checked = true;
      weekendCheckbox.disabled = true;
    } else {
      weekendCheckbox.checked = false;
      weekendCheckbox.disabled = false;
    }
    updateTotal();
    fetchBookedSlots(dateInput.value);
  });

  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', updateTotal);
  });

  document.getElementById('booking-form').addEventListener('submit', e => {
    e.preventDefault();
    const selectedServices = [...document.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);
    const date = dateInput.value;
    const time = timeInput.value;
    const email = emailInput.value;

    if (!date || !time || selectedServices.length === 0 || !email) {
      alert("Please fill all fields.");
      return;
    }

    localStorage.setItem("booking_date", date);
    localStorage.setItem("booking_time", time);
    localStorage.setItem("booking_services", JSON.stringify(selectedServices));
    localStorage.setItem("booking_email", email);

    console.log("selectedServices:", selectedServices);
console.log("email:", email);

    fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        services: selectedServices, // ✅ now matches the backend
        email: email,
        date: date,
    time: time
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
      }
    });
    
  });
});
