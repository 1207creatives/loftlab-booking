// /netlify/functions/create-checkout.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Map of product name to Stripe Product ID (not price_id since we're using products)
const productMap = {
  "Audio Only (1hr)": "prod_S5X993tNBRtU22",
  "Audio + Video (1hr)": "prod_S5XA4gYkiiCba6",
  "Multi-Cam (1hr)": "prod_S5XBIjKCwpzWi0",
  "Audio Only (2hr)": "prod_S5XBKgwa4fboXr",
  "Audio + Video (2hr)": "prod_S5XBhYJOsc7Yq5",
  "Multi-Cam (2hr)": "prod_S5XCXgEAyNBKyj",
  "3 short-form clips": "prod_S5XEKhN1jT9d2T",
  "5 short-form clips": "prod_S5XE7kV6NrjpbC",
  "10 short-form clips": "prod_S5XFHE4kZK9tlh",
  "15 short-form clips": "prod_S5XFQ4vIH1or86",
  "20 short-form clips": "prod_S5XFGfQijVgBGQ",
  "Rush Delivery (48 Hours)": "prod_S5XFFPCBatHizT",
  "Same-Day Delivery": "prod_S5XG4A9ZRg5doz",
  "Add a Guest + (Per Guest)": "prod_S5XG9c9VCNBj4F",
  "Weekend Booking (+ Sat/Sun Bookings)": "prod_S5XHeY68zxTvC9",
  "Remote Guest/Call-In Integration": "prod_S5XHJOKCwZkp1a",
  "BTS Reel (15–30 sec highlight video)": "prod_S5XHn7dEZkdsfD",
  "BTS Photography (15–20 stills)": "prod_S5XI5fq5dnjtQG",
  "60 Minute Strategy Call": "prod_S5XIepRQylVNQh",
  "Thumbnail": "prod_S5XJPRrvG8mPBN"
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { services, email } = JSON.parse(event.body);

    if (!services || services.length === 0 || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const line_items = services.map((service) => ({
      price_data: {
        currency: 'usd',
        product: productMap[service],
        unit_amount: null, // Stripe will use product default price
        tax_behavior: 'inclusive'
      },
      quantity: 1
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: email,
      success_url: 'https://yourdomain.com/success.html',
      cancel_url: 'https://yourdomain.com/',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
