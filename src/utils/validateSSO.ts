
export const validateSSO = async (sso: string, sig: string) => {
  try {
      const response = await fetch(`/api/auth/validate-sso`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ payload: sso, sig: sig })
      });

      const data = await response.json();

      return data;
  } catch (error) {
      console.error('There was an error with the validation:', error);
      return false;
  }
};