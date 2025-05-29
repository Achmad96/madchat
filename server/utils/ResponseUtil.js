const response = (res, status, message, data = null) => {
  return res.status(status).json({
    status: status >= 400 ? 'error' : 'success',
    message,
    data
  });
};
module.exports = {
  response
};
