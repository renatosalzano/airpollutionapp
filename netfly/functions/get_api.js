fetch(process.env.API_KEY)
.then((response) => {
  return response.json();
})
