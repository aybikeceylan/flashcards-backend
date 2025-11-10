export const success = (data: any, message = "OK") => ({
  success: true,
  message,
  data,
});

export const failure = (message = "Error") => ({
  success: false,
  message,
});

export const notFound = (message = "Not Found") => ({
  success: false,
  message,
});

export const badRequest = (message = "Bad Request") => ({
  success: false,
  message,
});

export const internalServerError = (message = "Internal Server Error") => ({
  success: false,
  message,
});

export const unauthorized = (message = "Unauthorized") => ({
  success: false,
  message,
});
