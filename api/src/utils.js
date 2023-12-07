exports.handleError = (err, res) => {
  if (err.status && typeof err.status == 'number') {
    return res.status(err.status).json({ error: err.message });
  } else {
    //console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
}

exports.constructError = (status, message = "") => {
  let error = new Error(message);
  error.status = status;
  return error;
}