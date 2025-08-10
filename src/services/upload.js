const API_BASE_URL = "https://collage-468222.uc.r.appspot.com/api"



const uploadPhoto = async (email, file) => {

    // Initialize base URL for the API
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    // Check for current access token
    let token = localStorage.getItem('accessToken');
    // Check for email, if empty, generate a session id and use it as username
    const username = email || `session-${Date.now()}`;


    if (!token) {
        token = await authenticate(username);
    }

    const formData = new FormData();
    formData.append('file', file, 'upload.png');

    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            // Handle unauthorized access and re-authenticate
            if (response.status === 401) {
                await authenticate(username);
                return uploadPhoto(email, file); // Retry after authentication
            }
            throw new Error('Failed to upload photo');
        }

        const data = await response.json();
        return data.file_url;
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
}

const authenticate = async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email }),
    });

    if (!response.ok) {
        throw new Error('Failed to authenticate');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.access_token);
    return data.access_token;
};

export { uploadPhoto };