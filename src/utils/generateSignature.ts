export const generateSignature = async (payload, origin) => {
    try {
        const response = await fetch(`/api/auth/generate-signature`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ payload })
        });
    
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There was an error generating the signature:', error);
        return 'Error generating signature.';
    }
};


