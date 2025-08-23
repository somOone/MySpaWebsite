/**
 * Sanitize appointment data for admin APIs
 * Converts null values to appropriate defaults and ensures data integrity
 */
const sanitizeAppointmentData = (data) => {
  const sanitized = { ...data };
  
  // Convert null values to appropriate defaults
  if (sanitized.tip === null) {
    sanitized.tip = 0;
  }
  if (sanitized.payment === null) {
    sanitized.payment = 0;
  }
  
  // Always update the updated_at timestamp for admin modifications
  sanitized.updated_at = new Date().toISOString();
  
  return sanitized;
};

module.exports = {
  sanitizeAppointmentData
};
