export const success = (message: string, payload?: any) => {
  if (!payload) {
    return {
      success: true,
      message,
    };
  } else {
    return { success: true, message, payload };
  }
};
