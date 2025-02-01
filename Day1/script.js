// Add event listener to the submit button
document.querySelector('button').addEventListener('click', function (e) {
  e.preventDefault();
  const email = document.querySelector('input[type="email"]').value;

  if (email) {
    // Here you would typically send the email to your server
    alert('Thank you for subscribing!');
    document.querySelector('input[type="email"]').value = '';
  } else {
    alert('Please enter a valid email address');
  }
});
