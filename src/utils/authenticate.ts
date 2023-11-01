
export const authenticate = async (pcdStr: string) => {
  try {
      const response = await fetch(`/api/auth/authenticate`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: pcdStr
      });

      const data = await response.json();

      return data;
  } catch (error) {
      console.error('There was an error with the validation:', error);
      return false;
  }
};