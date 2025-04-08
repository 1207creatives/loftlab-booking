// Force redeploy with updated URLs
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const body = JSON.parse(event.body);
    console.log("FULL BODY:", event.body);
    console.log("Parsed services:", body.services);
    console.log("Parsed email:", body.email);
    console.log("Parsed date:", body.date);
    console.log("Parsed time:", body.time);

    const { services, email, date, time } = body;
    const items = services;



    if (!items || items.length === 0) {
      console.error('No items received:', items);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No services selected.' }),
      };
    }

    if (!email) {
      console.error('No email received');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required.' }),
      };
    }

    console.log('Received items:', items);
    console.log('Received email:', email);

    const PRICE_MAP = {
      "Audio Only (1hr)": "price_1RBM5VI6eHZ8P8aqRzFmang9",
      "Audio + Video (1hr)": "price_1RBM61I6eHZ8P8aqEIydE7DJ",
      "Multi-Cam (1hr)": "price_1RBM6fI6eHZ8P8aqLzTkolnM",
      "Audio Only (2hr)": "price_1RBM6yI6eHZ8P8aqy7d5LW6A",
      "Audio + Video (2hr)": "price_1RBM7II6eHZ8P8aqJCPNeILU",
      "Multi-Cam (2hr)": "price_1RBM7iI6eHZ8P8aq78iK4KXV",
      "3 short-form clips": "price_1RBMA3I6eHZ8P8aqdxIdqd9l",
      "5 short-form clips": "price_1RBMAHI6eHZ8P8aqVdvglzYX",
      "10 short-form clips": "price_1RBMAcI6eHZ8P8aqlXavSiTD",
      "15 short-form clips": "price_1RBMAoI6eHZ8P8aqvJmFjYgA",
      "20 short-form clips": "price_1RBMB0I6eHZ8P8aqJXJPotbU",
      "Rush Delivery (48 Hours)": "price_1RBMBMI6eHZ8P8aq3pWis8Wo",
      "Same-Day Delivery": "price_1RBMBdI6eHZ8P8aqZMdf9Q24",
      "Add a Guest + (Per Guest)": "price_1RBMCII6eHZ8P8aq8wCJyHGh",
      "Weekend Booking (+ Sat/Sun Bookings)": "price_1RBMCcI6eHZ8P8aqBnX3PAaw",
      "Remote Guest/Call-In Integration": "price_1RBMCvI6eHZ8P8aq6cHkprSb",
      "BTS Reel (15-30 sec highlight video)": "price_1RBMDJI6eHZ8P8aq3YARjuaA",
      "BTS Photography (15-20 stills)": "price_1RBMDeI6eHZ8P8aqMkXV4oTW",
      "60 Minute Strategy Call": "price_1RBMDxI6eHZ8P8aqw3EfmRzR",
      "Thumbnail": "price_1RBMERI6eHZ8P8aqwBx9zYEt",
    };

    const line_items = items
      .filter((item) => PRICE_MAP[item])
      .map((item) => ({
        price: PRICE_MAP[item],
        quantity: 1,
      }));

    if (line_items.length === 0) {
      console.error('No valid Stripe price IDs matched:', items);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid items selected.' }),
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: email,
      success_url: 'https://loftlab.netlify.app/successful',
      cancel_url: 'https://loftlab.netlify.app',
      metadata: {
        email,
        services: items.join(', '),
        booking_date: date,
        booking_time: time
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};