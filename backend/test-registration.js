const axios = require('axios');

async function testRegistration() {
  try {
    const userData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: '123456',
      phone: '1234567890',
      role: 'user'
    };

    console.log('Testing registration with data:', userData);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Registration successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Registration failed:');
    console.error('Error message:', error.response?.data || error.message);
  }
}

testRegistration();
