import app from './app';

const port = 5000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
