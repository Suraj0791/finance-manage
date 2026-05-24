export const error_codes = {
  CONNECTION_ERROR: "CONNECTION_ERROR",
  DUPLICATE_ERROR: "DUPLICATE_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  NEON_COLD_START: "NEON_COLD_START",
};

export const getErrorMessage = (code, customMessage) => {
  const messages = {
    [error_codes.CONNECTION_ERROR]:
      "Could not connect to the database. This might be due to a Neon Serverless cold start.",
    [error_codes.DUPLICATE_ERROR]: "This record already exists.",
    [error_codes.NOT_FOUND_ERROR]: "The requested resource was not found.",
    [error_codes.VALIDATION_ERROR]: "The provided data is invalid.",
    [error_codes.AUTHORIZATION_ERROR]:
      "You don't have permission to perform this action.",
    [error_codes.SERVER_ERROR]: "An unexpected error occurred on the server.",
    [error_codes.NEON_COLD_START]:
      "The database was autosuspended due to inactivity (Neon Serverless). It is waking up automatically, please try refreshing in a few moments.",
  };

  return customMessage || messages[code] || "An unknown error occurred.";
};
