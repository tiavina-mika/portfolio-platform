/*
 * app\api\recaptchaSubmit\route.ts
 * Import necessary types from Next.js and axios for making HTTP requests.
 */
import axios from 'axios';

import env from '@/env';

interface IPostData {
  token: string;
}

export const POST = async (request: Request) => {
  const body: IPostData = await request.json();

  // Retrieve the secret key from environment variables for the ReCaptcha verification.
  const secretKey = env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    // If the secret key is not found, log an error and return an appropriate response.
    return Response.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const { token } = body;

  // Define the form data for the POST request to the ReCaptcha API.
  const formData = `secret=${secretKey}&response=${token}`;

  try {
    // Make a POST request to the Google ReCaptcha verify API.
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Check the ReCaptcha response for success and a score above a certain threshold.
    if (response.data.success && response.data.score > 0.5) {
      // Return a success response if the verification passes.
      return Response.json(
        { success: true, score: response.data.score },
        { status: 200 }
      );
    }

    // Log the failure and return a response indicating the verification did not pass.
    return Response.json(
      { success: false, error: 'ReCaptcha verification failed' },
      { status: 403 }
    );
  }
  catch (error) {
    console.log('error: ', error);
    // Handle any errors that occur during the API request.
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
};
