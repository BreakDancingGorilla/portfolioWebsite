const form = document.getElementById('commissionForm');
const statusText = document.getElementById('formStatus');
const submitButton = form.querySelector('button[type="submit"]');

document.getElementById('year').textContent = new Date().getFullYear();

function setStatus(message, isError) {
    statusText.textContent = message;
    statusText.className = isError ? 'text-danger' : 'text-success';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        setStatus('Please fill in the highlighted fields.', true);
        return;
    }

    submitButton.disabled = true;
    setStatus('Sending…', false);

    try {
        const res = await fetch('/api/commission', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Something went wrong.');

        form.reset();
        form.classList.remove('was-validated');
        setStatus("Thanks! Your request was sent. I'll reply by email soon.", false);
    } catch (err) {
        setStatus(`${err.message} You can also email gabriel.m.osborn@proton.me.`, true);
    } finally {
        submitButton.disabled = false;
    }
});
