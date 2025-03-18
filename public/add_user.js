// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');

    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(userForm);

        fetch('/api/users', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (response.ok) {
                alert('User added successfully!');
                userForm.reset();
            } else {
                alert('Failed to add user.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred.');
        });
    });
});